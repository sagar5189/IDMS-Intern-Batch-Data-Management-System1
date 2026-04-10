package com.internmgmt.dto;

import com.internmgmt.model.Intern;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InternDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
        private String name;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number (10 digits starting with 6-9)")
        @NotBlank(message = "Mobile number is required")
        private String mobileNumber;

        @NotNull(message = "ID card type is required")
        private Intern.IdCardType idCardType;

        @NotNull(message = "Date of joining is required")
        private LocalDate dateOfJoining;

        @NotNull(message = "Batch ID is required")
        private Long batchId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        @Size(min = 2, max = 100)
        private String name;

        @Email
        private String email;

        @Pattern(regexp = "^[6-9]\\d{9}$")
        private String mobileNumber;

        private Intern.InternStatus status;
        private Double performanceScore;
        private String performanceRemarks;
        private Long batchId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String internId;
        private String name;
        private String email;
        private String mobileNumber;
        private Intern.IdCardType idCardType;
        private LocalDate dateOfJoining;
        private String batchName;
        private Long batchId;
        private Intern.InternStatus status;
        private Double performanceScore;
        private String performanceRemarks;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceUpdate {
        @Min(0) @Max(100)
        private Double performanceScore;
        private String performanceRemarks;
    }
}
