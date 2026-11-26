package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.LessonType;

public record LessonRequest(
        String title,
        String content,
        LessonType type
) {}