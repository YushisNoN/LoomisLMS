package com.loomis.lms.loomislmsbackend.dto;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.LessonType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record LessonResponse(
        UUID id,
        String title,
        String content,
        LessonType type,
        Integer position,
        LocalDateTime createdAt,
        List<LessonBlockResponse> blocks
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getType(),
                lesson.getPosition(),
                lesson.getCreatedAt(),
                lesson.getBlocks()
                        .stream()
                        .map(LessonBlockResponse::from)
                        .toList()
        );
    }
}