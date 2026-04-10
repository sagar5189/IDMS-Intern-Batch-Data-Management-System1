package com.internmgmt.dto;

import com.internmgmt.model.User;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.Set;

public class AuthDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
        private String username;

        @Email @NotBlank(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String username;
        private String fullName;
        private Set<User.UserRole> roles;
    }
}
