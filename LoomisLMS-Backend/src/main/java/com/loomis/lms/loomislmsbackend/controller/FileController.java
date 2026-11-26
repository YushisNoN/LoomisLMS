package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.entity.LessonFile;
import com.loomis.lms.loomislmsbackend.services.FileStorageService;
import com.loomis.lms.loomislmsbackend.services.LessonService;
import com.loomis.lms.loomislmsbackend.repository.LessonFileRepository;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.util.UUID;

import org.springframework.http.HttpRange;
import java.io.RandomAccessFile;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final LessonFileRepository lessonFileRepository;
    private final FileStorageService fileStorageService;
    private final LessonService lessonService;

    public FileController(LessonFileRepository lessonFileRepository, FileStorageService fileStorageService, LessonService lessonService) {
        this.lessonFileRepository = lessonFileRepository;
        this.fileStorageService = fileStorageService;
        this.lessonService = lessonService;
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> getFile(@PathVariable UUID fileId, @RequestHeader(value = "Range", required = false) String rangeHeader, Authentication authentication) throws IOException {

        UUID userId = UUID.fromString(authentication.getName());

        boolean isTeacher = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        LessonFile file = lessonFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Файл не найден"
                ));

        var lesson = file.getLesson();
        var module = lesson.getModule();
        var course = module.getCourse();

        lessonService.getLessonForFileAccess(
                course.getId(),
                module.getId(),
                lesson.getId(),
                userId,
                isTeacher
        );

        var path = fileStorageService.getFilePath(file.getStoredName());

        if (!Files.exists(path)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Файл не найден на диске"
            );
        }

        MediaType mediaType = MediaType.parseMediaType(file.getContentType());

        long fileSize = Files.size(path);

        if (rangeHeader == null || !rangeHeader.startsWith("bytes=")) {
            Resource resource = new FileSystemResource(path);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .contentLength(fileSize)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition.inline()
                                    .filename(file.getOriginalName())
                                    .build()
                                    .toString()
                    )
                    .body(resource);
        }

        String[] parts = rangeHeader.substring(6).split("-");

        if (parts.length != 2) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                    .build();
        }

        long start = parts[0].isEmpty()
                ? 0
                : Long.parseLong(parts[0]);

        long end = parts[1].isEmpty()
                ? fileSize - 1
                : Long.parseLong(parts[1]);

        if (start < 0 || end < start || start >= fileSize) {
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileSize)
                    .build();
        }

        end = Math.min(end, fileSize - 1);

        long contentLength = end - start + 1;

        byte[] buffer = new byte[(int) contentLength];

        try (RandomAccessFile randomAccessFile =
                     new RandomAccessFile(path.toFile(), "r")) {

            randomAccessFile.seek(start);
            randomAccessFile.readFully(buffer);
        }

        Resource resource = new org.springframework.core.io.ByteArrayResource(buffer);

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(mediaType)
                .contentLength(contentLength)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(
                        HttpHeaders.CONTENT_RANGE,
                        "bytes " + start + "-" + end + "/" + fileSize
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(file.getOriginalName())
                                .build()
                                .toString()
                )
                .body(resource);
    }
}