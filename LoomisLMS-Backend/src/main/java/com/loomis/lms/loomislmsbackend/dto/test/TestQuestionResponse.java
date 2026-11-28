package com.loomis.lms.loomislmsbackend.dto.test;

import com.loomis.lms.loomislmsbackend.entity.QuestionType;
import com.loomis.lms.loomislmsbackend.entity.TestQuestion;

import java.util.List;
import java.util.UUID;

public record TestQuestionResponse(
        UUID id,
        String question,
        QuestionType type,
        String explanation,
        Integer position,
        List<TestAnswerOptionResponse> options,
        List<String> acceptedTextAnswers
) {
    public static TestQuestionResponse from(TestQuestion question) {
        return new TestQuestionResponse(
                question.getId(),
                question.getQuestion(),
                question.getType(),
                question.getExplanation(),
                question.getPosition(),
                question.getOptions().stream()
                        .map(TestAnswerOptionResponse::from)
                        .toList(),
                question.getAcceptedTextAnswers()
        );
    }
}