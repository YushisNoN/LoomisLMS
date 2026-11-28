package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.LessonFile;
import com.loomis.lms.loomislmsbackend.repository.LessonFileRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final LessonFileRepository lessonFileRepository;
    private final Path storageLocation;
    private final long maxFileSize;

    public FileStorageService(
            LessonFileRepository lessonFileRepository,
            @Value("${app.file-storage.location}") String location,
            @Value("${app.file-storage.max-file-size}") long maxFileSize
    ) throws IOException {

        this.lessonFileRepository = lessonFileRepository;
        this.storageLocation = Paths.get(location)
                .toAbsolutePath()
                .normalize();
        this.maxFileSize = maxFileSize;

        Files.createDirectories(storageLocation);
    }

    @Transactional
    public LessonFile storeFile(MultipartFile file, Lesson lesson) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Файл не выбран"
            );
        }

        if (file.getSize() > maxFileSize) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Размер файла превышает 500 МБ"
            );
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректное имя файла"
            );
        }

        String extension = getExtension(originalName);

        String contentType = file.getContentType();

        if (!isAllowedFile(extension, contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Неподдерживаемый формат файла"
            );
        }

        String storedName = UUID.randomUUID() + "." + extension;

        Path targetPath = storageLocation.resolve(storedName).normalize();

        if (!targetPath.startsWith(storageLocation)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный путь файла"
            );
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Не удалось сохранить файл"
            );
        }

        LessonFile lessonFile = new LessonFile();
        lessonFile.setOriginalName(originalName);
        lessonFile.setStoredName(storedName);
        lessonFile.setContentType(contentType);
        lessonFile.setSize(file.getSize());
        lessonFile.setLesson(lesson);

        try {
            return lessonFileRepository.save(lessonFile);
        } catch (RuntimeException e) {
            try {
                Files.deleteIfExists(targetPath);
            } catch (IOException ignored) {
            }

            throw e;
        }
    }

    private String getExtension(String filename) {
        int index = filename.lastIndexOf('.');

        if (index < 0 || index == filename.length() - 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Файл должен иметь расширение"
            );
        }

        return filename.substring(index + 1).toLowerCase();
    }

    private boolean isAllowedFile(String extension, String contentType) {

        if (contentType == null) {
            return false;
        }

        return switch (extension) {
            case "mp4" -> contentType.equals("video/mp4");
            case "webm" -> contentType.equals("video/webm");
            case "pdf" -> contentType.equals("application/pdf");
            case "pptx" -> contentType.equals(
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            );
            case "png" -> contentType.equals("image/png");
            case "jpg", "jpeg" -> contentType.equals("image/jpeg");
            case "webp" -> contentType.equals("image/webp");
            default -> false;
        };
    }

    public Path getFilePath(String storedName) {
        Path path = storageLocation.resolve(storedName).normalize();

        if (!path.startsWith(storageLocation)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный путь файла"
            );
        }

        return path;
    }
}