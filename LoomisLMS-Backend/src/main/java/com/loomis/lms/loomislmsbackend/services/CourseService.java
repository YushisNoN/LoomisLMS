package com.loomis.lms.loomislmsbackend.services;

import com.loomis.lms.loomislmsbackend.dto.CourseRequest;
import com.loomis.lms.loomislmsbackend.dto.CourseResponse;
import com.loomis.lms.loomislmsbackend.entity.Course;
import com.loomis.lms.loomislmsbackend.entity.User;
import com.loomis.lms.loomislmsbackend.repository.CourseRepository;
import com.loomis.lms.loomislmsbackend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CourseResponse> getPublishedCourses() {
        return courseRepository.findAllByPublishedTrue()
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    public List<CourseResponse> getTeacherCourses(UUID teacherId) {
        return courseRepository.findAllByTeacher_IdOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    public CourseResponse createCourse(CourseRequest request, UUID teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Преподаватель не найден"));

        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setTeacher(teacher);
        course.setPublished(false);

        Course savedCourse = courseRepository.save(course);

        return CourseResponse.from(savedCourse);
    }

    public CourseResponse getTeacherCourse(UUID courseId, UUID teacherId) {
        Course course = courseRepository
                .findByIdAndTeacher_Id(courseId, teacherId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Курс не найден"
                ));

        return CourseResponse.from(course);
    }
}