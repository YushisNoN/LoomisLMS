package com.loomis.lms.loomislmsbackend.dto;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.LessonType;

import java.time.LocalDateTime;
import java.util.UUID;

public record LessonResponse(
        UUID id,
        String title,
        String content,
        LessonType type,
        Integer position,
        LocalDateTime createdAt
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getType(),
                lesson.getPosition(),
                lesson.getCreatedAt()
        );
    }
}