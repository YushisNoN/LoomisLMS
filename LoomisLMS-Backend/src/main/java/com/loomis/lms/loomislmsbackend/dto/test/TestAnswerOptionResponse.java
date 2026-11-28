package com.loomis.lms.loomislmsbackend.dto.test;

import com.loomis.lms.loomislmsbackend.entity.TestAnswerOption;

import java.util.UUID;

public record TestAnswerOptionResponse(
        UUID id,
        String text,
        Boolean correct,
        Integer position
) {
    public static TestAnswerOptionResponse from(TestAnswerOption option) {
        return new TestAnswerOptionResponse(
                option.getId(),
                option.getText(),
                option.getCorrect(),
                option.getPosition()
        );
    }
}