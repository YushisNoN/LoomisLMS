package com.loomis.lms.loomislmsbackend.repository;

import com.loomis.lms.loomislmsbackend.entity.LessonBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonBlockRepository extends JpaRepository<LessonBlock, UUID> {

    List<LessonBlock> findAllByLesson_IdOrderByPositionAsc(UUID lessonId);

    Optional<LessonBlock> findByIdAndLesson_Id(UUID id, UUID lessonId);
}