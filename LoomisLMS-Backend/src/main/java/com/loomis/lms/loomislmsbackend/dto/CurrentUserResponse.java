package com.loomis.lms.loomislmsbackend.dto;



import com.loomis.lms.loomislmsbackend.entity.User;

import java.util.UUID;
public record CurrentUserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String role
) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}