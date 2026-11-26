package com.loomis.lms.loomislmsbackend.repository;

import com.loomis.lms.loomislmsbackend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findAllByCourse_IdOrderByPositionAsc(UUID courseId);
    Optional<Lesson> findByIdAndCourse_Id(UUID id, UUID courseId);
}