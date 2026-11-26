package com.loomis.lms.loomislmsbackend.repository;

import com.loomis.lms.loomislmsbackend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findAllByPublishedTrue();
    List<Course> findAllByTeacher_IdOrderByCreatedAtDesc(UUID teacherId);
    Optional<Course> findByIdAndTeacher_Id(UUID id, UUID teacherId);
}