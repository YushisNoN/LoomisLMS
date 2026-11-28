package com.loomis.lms.loomislmsbackend.repository;

import com.loomis.lms.loomislmsbackend.entity.LessonFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonFileRepository extends JpaRepository<LessonFile, UUID> {

    Optional<LessonFile> findByIdAndLesson_Id(UUID id, UUID lessonId);

    List<LessonFile> findAllByLesson_Id(UUID lessonId);

    Optional<LessonFile> findByIdAndLesson_Module_Course_Id(UUID id, UUID courseId);
}