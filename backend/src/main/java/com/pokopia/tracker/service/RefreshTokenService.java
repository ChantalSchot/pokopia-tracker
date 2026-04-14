package com.pokopia.tracker.service;

import com.pokopia.tracker.config.JwtConfig;
import com.pokopia.tracker.domain.entity.RefreshToken;
import com.pokopia.tracker.domain.entity.User;
import com.pokopia.tracker.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtConfig jwtConfig;

    @Transactional
    public RefreshToken createRefreshToken(User user, String tokenValue) {
        RefreshToken token = RefreshToken.builder()
            .user(user)
            .token(tokenValue)
            .expiresAt(LocalDateTime.now().plusSeconds(jwtConfig.getRefreshTokenExpiration()))
            .lastUsedAt(LocalDateTime.now())
            .build();
        return refreshTokenRepository.save(token);
    }

    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken updateLastUsed(RefreshToken token) {
        token.setLastUsedAt(LocalDateTime.now());
        return refreshTokenRepository.save(token);
    }

    public boolean isValid(RefreshToken token) {
        return !token.isExpired() && !token.isInactive(jwtConfig.getInactivityTimeout());
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    @Transactional
    public void deleteByUserId(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
