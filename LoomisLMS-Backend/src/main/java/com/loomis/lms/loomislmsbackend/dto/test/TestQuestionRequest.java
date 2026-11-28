package com.loomis.lms.loomislmsbackend.dto.test;

import com.loomis.lms.loomislmsbackend.entity.QuestionType;

import java.util.List;

public record TestQuestionRequest(
        String question,
        QuestionType type,
        String explanation,
        List<TestAnswerOptionRequest> options,
        List<String> acceptedTextAnswers
) {}