package com.loomis.lms.loomislmsbackend.dto.test;

public record TestAnswerOptionRequest(
        String text,
        Boolean correct
) {}