package com.loomis.lms.loomislmsbackend.controller;
import com.loomis.lms.loomislmsbackend.dto.CurrentUserResponse;
import com.loomis.lms.loomislmsbackend.dto.LoginRequest;
import com.loomis.lms.loomislmsbackend.dto.LoginResponse;
import com.loomis.lms.loomislmsbackend.dto.RegisterRequest;

import com.loomis.lms.loomislmsbackend.services.AuthService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(@Valid @RequestBody RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser(@AuthenticationPrincipal Object principal) {
        if (!(principal instanceof String userId)) {
            throw new BadCredentialsException("Invalid authentication");
        }
        return authService.getCurrentUser(userId);
    }
}
