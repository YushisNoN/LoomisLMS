package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.Module;

import java.time.LocalDateTime;
import java.util.UUID;

public record ModuleResponse(
        UUID id,
        String title,
        String description,
        Integer position,
        LocalDateTime createdAt
) {
    public static ModuleResponse from(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getTitle(),
                module.getDescription(),
                module.getPosition(),
                module.getCreatedAt()
        );
    }
}