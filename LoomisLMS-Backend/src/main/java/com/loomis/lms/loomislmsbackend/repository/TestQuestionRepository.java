package com.loomis.lms.loomislmsbackend.repository;

import com.loomis.lms.loomislmsbackend.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, UUID> {

    List<TestQuestion> findAllByLesson_IdOrderByPositionAsc(UUID lessonId);

    Optional<TestQuestion> findByIdAndLesson_Id(UUID id, UUID lessonId);
}