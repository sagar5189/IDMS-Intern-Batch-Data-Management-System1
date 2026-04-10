package com.internmgmt.controller;

import com.internmgmt.config.JwtAuthenticationFilter;
import com.internmgmt.model.User;
import com.internmgmt.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:4200}")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtFilter;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getUsername());
        String token = jwtFilter.generateToken(userDetails);
        User user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of(
            "token", token,
            "username", user.getUsername(),
            "fullName", user.getFullName(),
            "roles", user.getRoles()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }
        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .fullName(req.getFullName())
            .password(passwordEncoder.encode(req.getPassword()))
            .roles(Set.of(User.UserRole.VIEWER))
            .build();
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Size(min = 3) private String username;
        @Email @NotBlank private String email;
        @NotBlank private String fullName;
        @NotBlank @Size(min = 6) private String password;
    }
}
