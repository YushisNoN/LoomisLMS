package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.LessonBlock;
import com.loomis.lms.loomislmsbackend.entity.LessonBlockType;

import java.util.UUID;

public record LessonBlockResponse(
        UUID id,
        LessonBlockType type,
        String content,
        Integer position
) {
    public static LessonBlockResponse from(LessonBlock block) {
        return new LessonBlockResponse(
                block.getId(),
                block.getType(),
                block.getContent(),
                block.getPosition()
        );
    }
}