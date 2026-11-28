package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.User;
import com.loomis.lms.loomislmsbackend.entity.UserRole;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        UserRole role
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}