package com.loomis.lms.loomislmsbackend.dto;

public record LoginResponse(
        String token,
        String tokenType
) {}