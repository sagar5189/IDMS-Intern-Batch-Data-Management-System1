package com.internmgmt.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "interns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "intern_id", unique = true, nullable = false)
    private String internId;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    @Column(nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    @NotBlank(message = "Mobile number is required")
    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_card_type", nullable = false)
    private IdCardType idCardType;

    @Column(name = "date_of_joining", nullable = false)
    private LocalDate dateOfJoining;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    // Performance tracking
    @Column(name = "performance_score")
    private Double performanceScore;

    @Column(name = "performance_remarks", length = 500)
    private String performanceRemarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private InternStatus status = InternStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum IdCardType {
        FREE, PREMIUM
    }

    public enum InternStatus {
        ACTIVE, COMPLETED, TERMINATED
    }
}
