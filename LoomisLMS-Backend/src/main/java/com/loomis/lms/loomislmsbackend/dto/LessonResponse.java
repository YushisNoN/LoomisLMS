package com.loomis.lms.loomislmsbackend.dto;
import com.loomis.lms.loomislmsbackend.entity.Lesson;

import java.time.LocalDateTime;
import java.util.UUID;

public record LessonResponse(
        UUID id,
        String title,
        String content,
        Integer position,
        LocalDateTime createdAt
) {

    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getPosition(),
                lesson.getCreatedAt()
        );
    }
}