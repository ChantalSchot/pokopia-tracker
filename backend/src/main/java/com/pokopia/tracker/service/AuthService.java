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
import com.pokopia.tracker.exception.ResourceNotFoundException;
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
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .roles(new HashSet<>(Set.of(Role.USER)))
            .build();
        user = userRepository.save(user);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        issueTokens(user, response);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = extractCookie(request, "refresh_token");
        if (refreshTokenValue != null) {
            refreshTokenService.deleteByToken(refreshTokenValue);
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
            refreshTokenService.deleteByToken(refreshTokenValue);
            cookieUtil.clearAuthCookies(response);
            throw new UnauthorizedException("Refresh token expired or inactive");
        }

        User user = refreshToken.getUser();
        refreshTokenService.deleteByToken(refreshTokenValue);
        issueTokens(user, response);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
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
        });
        // Always return success to avoid email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new BusinessRuleException("Invalid or expired reset token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new BusinessRuleException("Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Invalidate all refresh tokens for this user
        refreshTokenService.deleteByUserId(user.getId());
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
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
