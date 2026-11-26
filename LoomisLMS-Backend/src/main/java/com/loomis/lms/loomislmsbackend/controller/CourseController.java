package com.loomis.lms.loomislmsbackend.controller;

import com.loomis.lms.loomislmsbackend.dto.CourseRequest;
import com.loomis.lms.loomislmsbackend.dto.CourseResponse;
import com.loomis.lms.loomislmsbackend.services.CourseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<CourseResponse> getPublishedCourses() {
        return courseService.getPublishedCourses();
    }

    @GetMapping("/my")
    public List<CourseResponse> getTeacherCourses(Authentication authentication) {
        requireTeacher(authentication);

        UUID teacherId = UUID.fromString(authentication.getName());

        return courseService.getTeacherCourses(teacherId);
    }

    @GetMapping("/{id}/student")
    public CourseResponse getStudentCourse(@PathVariable UUID id, Authentication authentication) {
        requireStudent(authentication);

        return courseService.getPublishedCourse(id);
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse createCourse(@RequestBody CourseRequest request, Authentication authentication) {
        requireTeacher(authentication);

        UUID teacherId = UUID.fromString(authentication.getName());

        return courseService.createCourse(request, teacherId);
    }

    @PutMapping("/{id}/publish")
    public CourseResponse publishCourse(@PathVariable UUID id, Authentication authentication) {
        requireTeacher(authentication);

        UUID teacherId = UUID.fromString(authentication.getName());

        return courseService.publishCourse(id, teacherId);
    }

    @PutMapping("/{id}/unpublish")
    public CourseResponse unpublishCourse(@PathVariable UUID id, Authentication authentication) {
        requireTeacher(authentication);

        UUID teacherId = UUID.fromString(authentication.getName());

        return courseService.unpublishCourse(id, teacherId);
    }

    private void requireTeacher(Authentication authentication) {
        System.out.println("AUTH NAME: " + authentication.getName());
        System.out.println("AUTHORITIES: " + authentication.getAuthorities());

        boolean isTeacher = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_TEACHER")
                );

        if (!isTeacher) {
            throw new AccessDeniedException("Недостаточно прав");
        }
    }

    private void requireStudent(Authentication authentication) {
        boolean isStudent = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT")
                );

        if (!isStudent) {
            throw new AccessDeniedException("Недостаточно прав");
        }
    }

    @GetMapping("/{id}")
    public CourseResponse getTeacherCourse(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        requireTeacher(authentication);

        UUID teacherId = UUID.fromString(authentication.getName());

        return courseService.getTeacherCourse(id, teacherId);
    }


}