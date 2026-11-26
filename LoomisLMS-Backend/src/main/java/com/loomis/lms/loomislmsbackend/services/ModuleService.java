package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.ModuleRequest;
import com.loomis.lms.loomislmsbackend.entity.Course;
import com.loomis.lms.loomislmsbackend.entity.Module;
import com.loomis.lms.loomislmsbackend.repository.CourseRepository;
import com.loomis.lms.loomislmsbackend.repository.ModuleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
public class ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Module> getCourseModules(UUID courseId, UUID teacherId) {
        checkCourseOwnership(courseId, teacherId);

        return moduleRepository.findAllByCourse_IdOrderByPositionAsc(courseId);
    }

    public Module createModule(UUID courseId, ModuleRequest request, UUID teacherId) {
        Course course = checkCourseOwnership(courseId, teacherId);

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Название модуля не может быть пустым"
            );
        }

        Module module = new Module();

        module.setTitle(request.title().trim());
        module.setDescription(request.description());
        module.setCourse(course);
        module.setPosition(
                moduleRepository.findAllByCourse_IdOrderByPositionAsc(courseId).size()
        );

        return moduleRepository.save(module);
    }

    public void deleteModule(UUID courseId, UUID moduleId, UUID teacherId) {
        checkCourseOwnership(courseId, teacherId);

        Module module = moduleRepository
                .findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Модуль не найден"
                ));

        moduleRepository.delete(module);
    }

    @Transactional
    public void reorderModules(UUID courseId, List<UUID> moduleIds, UUID teacherId) {
        checkCourseOwnership(courseId, teacherId);

        List<Module> modules =
                moduleRepository.findAllByCourse_IdOrderByPositionAsc(courseId);

        if (moduleIds == null ||
                moduleIds.size() != modules.size() ||
                new HashSet<>(moduleIds).size() != moduleIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный порядок модулей"
            );
        }

        for (int i = 0; i < moduleIds.size(); i++) {
            UUID moduleId = moduleIds.get(i);

            Module module = moduleRepository
                    .findByIdAndCourse_Id(moduleId, courseId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Модуль не принадлежит этому курсу"
                    ));

            module.setPosition(i);
        }

        moduleRepository.saveAll(modules);
    }

    private Course checkCourseOwnership(UUID courseId, UUID teacherId) {
        return courseRepository.findByIdAndTeacher_Id(courseId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));
    }
}