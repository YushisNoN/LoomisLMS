package com.loomis.lms.loomislmsbackend.controller;


import com.loomis.lms.loomislmsbackend.dto.LessonOrderRequest;
import com.loomis.lms.loomislmsbackend.dto.LessonRequest;
import com.loomis.lms.loomislmsbackend.dto.LessonResponse;
import com.loomis.lms.loomislmsbackend.services.LessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/modules/{moduleId}/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping
    public List<LessonResponse> getLessons(@PathVariable UUID courseId, @PathVariable UUID moduleId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return lessonService
                .getModuleLessons(courseId, moduleId, teacherId)
                .stream()
                .map(LessonResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponse createLesson(@PathVariable UUID courseId, @PathVariable UUID moduleId, @RequestBody LessonRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return LessonResponse.from(
                lessonService.createLesson(
                        courseId,
                        moduleId,
                        request,
                        teacherId
                )
        );
    }

    @DeleteMapping("/{lessonId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        lessonService.deleteLesson(
                courseId,
                moduleId,
                lessonId,
                teacherId
        );
    }

    @PutMapping("/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderLessons(@PathVariable UUID courseId, @PathVariable UUID moduleId, @RequestBody LessonOrderRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());
        lessonService.reorderLessons(
                courseId,
                moduleId,
                request.lessonIds(),
                teacherId
        );
    }
    @GetMapping("/{lessonId}")
    public LessonResponse getLesson(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return LessonResponse.from(
                lessonService.getLesson(
                        courseId,
                        moduleId,
                        lessonId,
                        teacherId
                )
        );
    }

    @PutMapping("/{lessonId}")
    public LessonResponse updateLesson(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @RequestBody LessonRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return LessonResponse.from(
                lessonService.updateLesson(
                        courseId,
                        moduleId,
                        lessonId,
                        request,
                        teacherId
                )
        );
    }
    private void requireStudent(Authentication authentication) throws AccessDeniedException {
        boolean isStudent = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT")
                );

        if (!isStudent) {
            throw new AccessDeniedException("Недостаточно прав");
        }
    }

    @GetMapping("/student")
    public List<LessonResponse> getStudentLessons(@PathVariable UUID courseId, @PathVariable UUID moduleId, Authentication authentication) throws AccessDeniedException {
        requireStudent(authentication);

        return lessonService.getPublishedModuleLessons(courseId, moduleId)
                .stream()
                .map(LessonResponse::from)
                .toList();
    }
}