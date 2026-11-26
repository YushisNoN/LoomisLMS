package com.loomis.lms.loomislmsbackend.controller;
import com.loomis.lms.loomislmsbackend.dto.ModuleOrderRequest;
import com.loomis.lms.loomislmsbackend.dto.ModuleRequest;
import com.loomis.lms.loomislmsbackend.dto.ModuleResponse;
import com.loomis.lms.loomislmsbackend.entity.Module;


import com.loomis.lms.loomislmsbackend.services.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/modules")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public List<ModuleResponse> getModules(@PathVariable UUID courseId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return moduleService.getCourseModules(courseId, teacherId)
                .stream()
                .map(ModuleResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleResponse createModule(@PathVariable UUID courseId, @RequestBody ModuleRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        return ModuleResponse.from(
                moduleService.createModule(courseId, request, teacherId)
        );
    }

    @DeleteMapping("/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteModule(@PathVariable UUID courseId, @PathVariable UUID moduleId, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());

        moduleService.deleteModule(courseId, moduleId, teacherId);
    }

    @PutMapping("/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderModules(@PathVariable UUID courseId, @RequestBody ModuleOrderRequest request, Authentication authentication) {
        UUID teacherId = UUID.fromString(authentication.getName());
        moduleService.reorderModules(
                courseId,
                request.moduleIds(),
                teacherId
        );
    }

    private void requireStudent(Authentication authentication) throws AccessDeniedException {
        boolean isStudent = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_STUDENT")
                );

        if (!isStudent) {
            throw new AccessDeniedException("Недостаточно прав");
        }
    }

    @GetMapping("/student")
    public List<ModuleResponse> getStudentModules(@PathVariable UUID courseId, Authentication authentication) throws AccessDeniedException {
        requireStudent(authentication);

        return moduleService.getPublishedCourseModules(courseId)
                .stream()
                .map(ModuleResponse::from)
                .toList();
    }
}