package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.LessonRequest;
import com.loomis.lms.loomislmsbackend.entity.Course;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.entity.Module;
import com.loomis.lms.loomislmsbackend.repository.CourseRepository;
import com.loomis.lms.loomislmsbackend.repository.LessonRepository;
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
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Lesson> getModuleLessons(UUID courseId, UUID moduleId, UUID teacherId) {
        checkModuleOwnership(courseId, moduleId, teacherId);

        return lessonRepository.findAllByModule_IdOrderByPositionAsc(moduleId);
    }

    public Lesson createLesson(UUID courseId, UUID moduleId, LessonRequest request, UUID teacherId) {
        Module module = checkModuleOwnership(courseId, moduleId, teacherId);

        validateRequest(request);

        Lesson lesson = new Lesson();
        lesson.setTitle(request.title().trim());
        lesson.setContent(request.content());
        lesson.setType(request.type());
        lesson.setModule(module);

        int position = lessonRepository
                .findAllByModule_IdOrderByPositionAsc(moduleId)
                .size();

        lesson.setPosition(position);

        return lessonRepository.save(lesson);
    }

    public void deleteLesson(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        checkModuleOwnership(courseId, moduleId, teacherId);

        Lesson lesson = findLesson(moduleId, lessonId);

        lessonRepository.delete(lesson);
    }

    @Transactional
    public void reorderLessons(UUID courseId, UUID moduleId, List<UUID> lessonIds, UUID teacherId) {
        checkModuleOwnership(courseId, moduleId, teacherId);

        List<Lesson> lessons =
                lessonRepository.findAllByModule_IdOrderByPositionAsc(moduleId);

        if (lessonIds == null ||
                lessonIds.size() != lessons.size() ||
                new HashSet<>(lessonIds).size() != lessonIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный порядок уроков"
            );
        }

        for (int i = 0; i < lessonIds.size(); i++) {
            Lesson lesson = findLesson(moduleId, lessonIds.get(i));
            lesson.setPosition(i);
        }

        lessonRepository.saveAll(lessons);
    }

    public Lesson getLesson(UUID courseId, UUID moduleId, UUID lessonId, UUID teacherId) {
        checkModuleOwnership(courseId, moduleId, teacherId);

        return findLesson(moduleId, lessonId);
    }

    public Lesson updateLesson(UUID courseId, UUID moduleId, UUID lessonId, LessonRequest request, UUID teacherId) {
        checkModuleOwnership(courseId, moduleId, teacherId);

        validateRequest(request);

        Lesson lesson = findLesson(moduleId, lessonId);

        lesson.setTitle(request.title().trim());
        lesson.setContent(request.content());
        lesson.setType(request.type());

        return lessonRepository.save(lesson);
    }

    private Module checkModuleOwnership(UUID courseId, UUID moduleId, UUID teacherId) {
        courseRepository.findByIdAndTeacher_Id(courseId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));

        return moduleRepository.findByIdAndCourse_Id(moduleId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Модуль не найден"
                ));
    }

    private Lesson findLesson(UUID moduleId, UUID lessonId) {
        return lessonRepository.findByIdAndModule_Id(lessonId, moduleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Урок не найден"
                ));
    }

    private void validateRequest(LessonRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Название урока не может быть пустым"
            );
        }

        if (request.type() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо указать тип урока"
            );
        }
    }
}