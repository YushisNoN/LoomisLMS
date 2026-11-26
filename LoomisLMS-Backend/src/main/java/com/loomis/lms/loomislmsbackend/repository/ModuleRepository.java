package com.loomis.lms.loomislmsbackend.repository;
import com.loomis.lms.loomislmsbackend.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {

    List<Module> findAllByCourse_IdOrderByPositionAsc(UUID courseId);

    Optional<Module> findByIdAndCourse_Id(UUID id, UUID courseId);
}