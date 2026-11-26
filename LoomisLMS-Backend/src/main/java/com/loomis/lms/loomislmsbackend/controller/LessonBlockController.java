package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.dto.LessonBlockRequest;
import com.loomis.lms.loomislmsbackend.dto.LessonBlockResponse;
import com.loomis.lms.loomislmsbackend.entity.LessonBlock;
import com.loomis.lms.loomislmsbackend.services.LessonBlockService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/blocks")
public class LessonBlockController {

    @Autowired
    private LessonBlockService lessonBlockService;

    @GetMapping
    public List<LessonBlockResponse> getBlocks(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());
        System.out.println("BLOCKS CONTROLLER REACHED");
        return lessonBlockService
                .getBlocks(courseId, moduleId, lessonId, teacherId)
                .stream()
                .map(LessonBlockResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LessonBlockResponse createBlock(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @RequestBody LessonBlockRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        LessonBlock block = lessonBlockService.createBlock(
                courseId,
                moduleId,
                lessonId,
                request,
                teacherId
        );

        return LessonBlockResponse.from(block);
    }

    @PutMapping("/{blockId}")
    public LessonBlockResponse updateBlock(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @PathVariable UUID blockId, @RequestBody LessonBlockRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        LessonBlock block = lessonBlockService.updateBlock(
                courseId,
                moduleId,
                lessonId,
                blockId,
                request,
                teacherId
        );

        return LessonBlockResponse.from(block);
    }

    @DeleteMapping("/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlock(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @PathVariable UUID blockId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        lessonBlockService.deleteBlock(
                courseId,
                moduleId,
                lessonId,
                blockId,
                teacherId
        );
    }

    @PutMapping("/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderBlocks(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @RequestBody List<UUID> blockIds, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        lessonBlockService.reorderBlocks(
                courseId,
                moduleId,
                lessonId,
                blockIds,
                teacherId
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
    public List<LessonBlockResponse> getStudentBlocks(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, Authentication authentication) throws AccessDeniedException {
        requireStudent(authentication);
        return lessonBlockService.getStudentBlocks(
                        courseId,
                        moduleId,
                        lessonId
                ).stream()
                .map(LessonBlockResponse::from)
                .toList();
    }
}