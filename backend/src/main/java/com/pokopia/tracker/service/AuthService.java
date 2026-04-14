package com.pokopia.tracker.service;

import com.pokopia.tracker.config.JwtConfig;
import com.pokopia.tracker.domain.entity.PasswordResetToken;
import com.pokopia.tracker.domain.entity.RefreshToken;
import com.pokopia.tracker.domain.entity.User;
import com.pokopia.tracker.domain.enums.Role;
import com.pokopia.tracker.dto.request.*;
import com.pokopia.tracker.dto.response.UserResponse;
import com.pokopia.tracker.exception.BusinessRuleException;
import com.pokopia.tracker.exception.ConflictException;
import com.pokopia.tracker.exception.UnauthorizedException;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.PasswordResetTokenRepository;
import com.pokopia.tracker.repository.UserRepository;
import com.pokopia.tracker.security.CookieUtil;
import com.pokopia.tracker.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final JwtConfig jwtConfig;
    private final CookieUtil cookieUtil;
    private final PokemonMapper mapper;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Register attempt for username='{}', email='{}'", request.getUsername(), request.getEmail());
        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed — username already taken: '{}'", request.getUsername());
            throw new ConflictException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed — email already registered: '{}'", request.getEmail());
            throw new ConflictException("Email already registered");
        }
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .roles(new HashSet<>(Set.of(Role.USER)))
            .build();
        user = userRepository.save(user);
        log.info("User registered successfully: id='{}', username='{}'", user.getId(), user.getUsername());
        return mapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse login(LoginRequest request, HttpServletResponse response) {
        String identifier = request.getUsername(); // may be username or email
        log.info("Login attempt for identifier='{}'", identifier);

        // Support login by email OR username with cross-fallback
        User user;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> {
                    log.warn("Login failed — user not found for identifier='{}'", identifier);
                    return new UnauthorizedException("Invalid username or password");
                });
        } else {
            user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> {
                    log.warn("Login failed — user not found for identifier='{}'", identifier);
                    return new UnauthorizedException("Invalid username or password");
                });
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed — wrong password for identifier='{}'", identifier);
            throw new UnauthorizedException("Invalid username or password");
        }

        issueTokens(user, response);
        log.info("Login successful for username='{}', id='{}'", user.getUsername(), user.getId());
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookie(request, "refresh_token");
        if (refreshTokenValue != null) {
            refreshTokenService.deleteByToken(refreshTokenValue);
            log.info("Logout — refresh token invalidated");
        } else {
            log.info("Logout — no refresh token cookie present");
        }
        cookieUtil.clearAuthCookies(response);
    }

    @Transactional
    public UserResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookie(request, "refresh_token");
        if (refreshTokenValue == null) {
            throw new UnauthorizedException("No refresh token provided");
        }
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshTokenService.isValid(refreshToken)) {
            log.warn("Token refresh failed — expired or invalid for user='{}'",
                refreshToken.getUser().getUsername());
            refreshTokenService.deleteByToken(refreshTokenValue);
            cookieUtil.clearAuthCookies(response);
            throw new UnauthorizedException("Refresh token expired or inactive");
        }
        User user = refreshToken.getUser();
        log.debug("Token refreshed for username='{}'", user.getUsername());
        refreshTokenService.deleteByToken(refreshTokenValue);
        issueTokens(user, response);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Forgot password request for email='{}'", request.getEmail());
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
            passwordResetTokenRepository.save(resetToken);
            mailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Password reset email sent to '{}'", user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with token");
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new BusinessRuleException("Invalid or expired reset token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            log.warn("Password reset failed — token expired or already used");
            throw new BusinessRuleException("Invalid or expired reset token");
        }
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        refreshTokenService.deleteByUserId(user.getId());
        log.info("Password reset successful for username='{}'", user.getUsername());
    }

    private void issueTokens(User user, HttpServletResponse response) {
        Set<String> roles = user.getRoles().stream()
            .map(Enum::name)
            .collect(Collectors.toSet());
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), roles);
        String refreshTokenValue = tokenProvider.generateRefreshTokenValue();
        refreshTokenService.createRefreshToken(user, refreshTokenValue);
        cookieUtil.addAccessTokenCookie(response, accessToken, jwtConfig.getAccessTokenExpiration());
        cookieUtil.addRefreshTokenCookie(response, refreshTokenValue, jwtConfig.getRefreshTokenExpiration());
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) return cookie.getValue();
        }
        return null;
    }
}
