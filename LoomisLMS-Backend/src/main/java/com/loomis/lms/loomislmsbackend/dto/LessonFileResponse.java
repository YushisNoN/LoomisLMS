package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.LessonFile;

import java.util.UUID;

public record LessonFileResponse(
        UUID id,
        String originalName,
        String contentType,
        Long size,
        String url
) {
    public static LessonFileResponse from(LessonFile file) {
        return new LessonFileResponse(
                file.getId(),
                file.getOriginalName(),
                file.getContentType(),
                file.getSize(),
                "/api/files/" + file.getId()
        );
    }
}