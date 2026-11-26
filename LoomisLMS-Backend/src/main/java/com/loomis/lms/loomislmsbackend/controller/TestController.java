package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.dto.test.TestQuestionRequest;
import com.loomis.lms.loomislmsbackend.dto.test.TestQuestionResponse;
import com.loomis.lms.loomislmsbackend.services.TestService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/questions")
public class TestController {

    @Autowired
    private TestService testService;

    @GetMapping
    public List<TestQuestionResponse> getQuestions(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return testService.getQuestions(
                        courseId,
                        moduleId,
                        lessonId,
                        teacherId
                )
                .stream()
                .map(TestQuestionResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TestQuestionResponse createQuestion(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @RequestBody TestQuestionRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return TestQuestionResponse.from(
                testService.createQuestion(
                        courseId,
                        moduleId,
                        lessonId,
                        request,
                        teacherId
                )
        );
    }

    @PutMapping("/{questionId}")
    public TestQuestionResponse updateQuestion(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @PathVariable UUID questionId, @RequestBody TestQuestionRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return TestQuestionResponse.from(
                testService.updateQuestion(
                        courseId,
                        moduleId,
                        lessonId,
                        questionId,
                        request,
                        teacherId
                )
        );
    }

    @DeleteMapping("/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @PathVariable UUID questionId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        testService.deleteQuestion(
                courseId,
                moduleId,
                lessonId,
                questionId,
                teacherId
        );
    }
}