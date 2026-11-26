package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.dto.LessonRequest;
import com.loomis.lms.loomislmsbackend.dto.LessonResponse;
import com.loomis.lms.loomislmsbackend.services.LessonService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.loomis.lms.loomislmsbackend.dto.LessonOrderRequest;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/courses/{courseId}/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping
    public List<LessonResponse> getLessons(@PathVariable UUID courseId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return lessonService.getCourseLessons(courseId, teacherId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponse createLesson(@PathVariable UUID courseId, @RequestBody LessonRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return lessonService.createLesson(courseId, request, teacherId);
    }

    @DeleteMapping("/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable UUID courseId, @PathVariable UUID lessonId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        lessonService.deleteLesson(courseId, lessonId, teacherId);
    }

    @PutMapping("/order")
    public void reorderLessons(@PathVariable UUID courseId, @RequestBody LessonOrderRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        lessonService.reorderLessons(
                courseId,
                request.lessonIds(),
                teacherId
        );
    }
}