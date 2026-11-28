package com.loomis.lms.loomislmsbackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private final SecureRandom secureRandom = new SecureRandom();

    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    public String createRefreshToken(UUID userId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        String refreshToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        String key = "refresh:" + hashToken(refreshToken);

        redisTemplate.opsForValue().set(
                key,
                userId.toString(),
                REFRESH_TOKEN_TTL
        );

        return refreshToken;
    }

    public String getUserId(String refreshToken) {
        String key = "refresh:" + hashToken(refreshToken);
        return redisTemplate.opsForValue().get(key);
    }

    public void deleteRefreshToken(String refreshToken) {
        String key = "refresh:" + hashToken(refreshToken);
        redisTemplate.delete(key);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception exception) {
            throw new RuntimeException("Could not hash refresh token", exception);
        }
    }

    public String rotateRefreshToken(String oldRefreshToken, UUID userId) {
        deleteRefreshToken(oldRefreshToken);
        return createRefreshToken(userId);
    }
}