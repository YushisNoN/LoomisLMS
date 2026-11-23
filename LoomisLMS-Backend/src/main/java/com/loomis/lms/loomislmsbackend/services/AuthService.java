package com.loomis.lms.loomislmsbackend.services;
import com.loomis.lms.loomislmsbackend.dto.RegisterRequest;
import com.loomis.lms.loomislmsbackend.entity.User;
import com.loomis.lms.loomislmsbackend.exception.EmailAlreadyExistsException;
import com.loomis.lms.loomislmsbackend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private  PasswordEncoder passwordEncoder;

    public User register(RegisterRequest registerRequest) {
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
        return userRepository.save(user);
    }

}
