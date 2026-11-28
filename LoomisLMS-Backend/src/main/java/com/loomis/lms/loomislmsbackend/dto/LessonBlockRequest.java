package com.loomis.lms.loomislmsbackend.dto;
import com.loomis.lms.loomislmsbackend.entity.LessonBlockType;

public record LessonBlockRequest(
        LessonBlockType type,
        String content,
        Integer position
) {
}