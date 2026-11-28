package com.loomis.lms.loomislmsbackend.dto;

import com.loomis.lms.loomislmsbackend.entity.Course;

import java.time.LocalDateTime;
import java.util.UUID;

public record CourseResponse(
        UUID id,
        String title,
        String description,
        LocalDateTime createdAt,
        Boolean published
) {
    public static CourseResponse from(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCreatedAt(),
                course.isPublished()
        );
    }
}