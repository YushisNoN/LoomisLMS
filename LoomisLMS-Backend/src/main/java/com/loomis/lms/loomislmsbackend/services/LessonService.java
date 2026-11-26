package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.LessonRequest;
import com.loomis.lms.loomislmsbackend.dto.LessonResponse;
import com.loomis.lms.loomislmsbackend.entity.Course;
import com.loomis.lms.loomislmsbackend.entity.Lesson;
import com.loomis.lms.loomislmsbackend.repository.CourseRepository;
import com.loomis.lms.loomislmsbackend.repository.LessonRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;

import java.util.List;
import java.util.UUID;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<LessonResponse> getCourseLessons(UUID courseId, UUID teacherId) {
        Course course = getTeacherCourse(courseId, teacherId);

        return lessonRepository
                .findAllByCourse_IdOrderByPositionAsc(course.getId())
                .stream()
                .map(LessonResponse::from)
                .toList();
    }

    public LessonResponse createLesson(UUID courseId, LessonRequest request, UUID teacherId) {
        Course course = getTeacherCourse(courseId, teacherId);

        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Название урока обязательно"
            );
        }

        List<Lesson> lessons =
                lessonRepository.findAllByCourse_IdOrderByPositionAsc(courseId);

        Lesson lesson = new Lesson();
        lesson.setTitle(request.title().trim());
        lesson.setContent(request.content());
        lesson.setCourse(course);
        lesson.setPosition(lessons.size());

        return LessonResponse.from(lessonRepository.save(lesson));
    }

    private Course getTeacherCourse(UUID courseId, UUID teacherId) {
        return courseRepository
                .findByIdAndTeacher_Id(courseId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));
    }

    public void deleteLesson(UUID courseId, UUID lessonId, UUID teacherId) {
        getTeacherCourse(courseId, teacherId);

        Lesson lesson = lessonRepository
                .findByIdAndCourse_Id(lessonId, courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Урок не найден"
                ));

        lessonRepository.delete(lesson);
    }

    @Transactional
    public void reorderLessons(UUID courseId, List<UUID> lessonIds, UUID teacherId) {
        getTeacherCourse(courseId, teacherId);

        List<Lesson> lessons =
                lessonRepository.findAllByCourse_IdOrderByPositionAsc(courseId);

        if (lessonIds == null
                || lessonIds.size() != lessons.size()
                || new HashSet<>(lessonIds).size() != lessons.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Некорректный порядок уроков"
            );
        }

        for (UUID lessonId : lessonIds) {
            boolean exists = lessons.stream()
                    .anyMatch(lesson -> lesson.getId().equals(lessonId));

            if (!exists) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Урок не принадлежит этому курсу"
                );
            }
        }

        for (int i = 0; i < lessonIds.size(); i++) {
            UUID lessonId = lessonIds.get(i);

            lessons.stream()
                    .filter(lesson -> lesson.getId().equals(lessonId))
                    .findFirst()
                    .orElseThrow()
                    .setPosition(i);
        }

        lessonRepository.saveAll(lessons);
    }
}