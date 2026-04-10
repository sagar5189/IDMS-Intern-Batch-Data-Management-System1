package com.internmgmt.dto;

import com.internmgmt.model.Batch;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BatchDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Batch name is required")
        @Size(min = 2, max = 100)
        private String batchName;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @Size(max = 500)
        private String description;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        private String batchName;
        private LocalDate startDate;
        private String description;
        private Batch.BatchStatus status;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String batchName;
        private LocalDate startDate;
        private LocalDate endDate;
        private String description;
        private Batch.BatchStatus status;
        private int totalInterns;
        private Double averagePerformanceScore;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<InternDTO.Response> interns;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private Long id;
        private String batchName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Batch.BatchStatus status;
        private int totalInterns;
    }
}
