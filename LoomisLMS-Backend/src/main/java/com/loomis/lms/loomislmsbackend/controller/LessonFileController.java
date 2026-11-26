package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.dto.LessonFileResponse;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.LessonFile;
import com.loomis.lms.loomislmsbackend.services.FileStorageService;
import com.loomis.lms.loomislmsbackend.services.LessonService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/files")
public class LessonFileController {

    private final FileStorageService fileStorageService;
    private final LessonService lessonService;

    public LessonFileController(FileStorageService fileStorageService, LessonService lessonService) {
        this.fileStorageService = fileStorageService;
        this.lessonService = lessonService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LessonFileResponse uploadFile(@PathVariable UUID courseId, @PathVariable UUID moduleId, @PathVariable UUID lessonId, @RequestParam("file") MultipartFile file, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        Lesson lesson = lessonService.getLesson(
                courseId,
                moduleId,
                lessonId,
                teacherId
        );

        LessonFile savedFile = fileStorageService.storeFile(file, lesson);

        return LessonFileResponse.from(savedFile);
    }
}