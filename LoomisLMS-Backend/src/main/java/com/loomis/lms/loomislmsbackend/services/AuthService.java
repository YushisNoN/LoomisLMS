package com.loomis.lms.loomislmsbackend.services;
import com.loomis.lms.loomislmsbackend.dto.CurrentUserResponse;
import com.loomis.lms.loomislmsbackend.dto.LoginRequest;
import com.loomis.lms.loomislmsbackend.dto.LoginResponse;
import com.loomis.lms.loomislmsbackend.dto.RegisterRequest;
import com.loomis.lms.loomislmsbackend.entity.User;
import com.loomis.lms.loomislmsbackend.exception.EmailAlreadyExistsException;
import com.loomis.lms.loomislmsbackend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private  PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public LoginResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new EmailAlreadyExistsException(
                    "User with this email already exists"
            );
        }
        User user = new User();
        user.setFirstName(registerRequest.firstName());
        user.setLastName(registerRequest.lastName());
        user.setEmail(registerRequest.email());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.password()));

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(user);

        return new LoginResponse(token, "Bearer");
    }


    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password")
                );

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);

        return new LoginResponse(token, "Bearer");
    }

    public CurrentUserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return CurrentUserResponse.from(user);
    }


}
