package com.internmgmt.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_name", nullable = false, unique = true)
    private String batchName;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private BatchStatus status = BatchStatus.UPCOMING;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Intern> interns = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateEndDateAndStatus() {
        if (startDate != null) {
            this.endDate = startDate.plusMonths(6);
        }
        updateStatus();
    }

    private void updateStatus() {
        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate)) {
            this.status = BatchStatus.UPCOMING;
        } else if (!today.isAfter(endDate)) {
            this.status = BatchStatus.ACTIVE;
        } else {
            this.status = BatchStatus.COMPLETED;
        }
    }

    public int getTotalInterns() {
        return interns != null ? interns.size() : 0;
    }

    public enum BatchStatus {
        UPCOMING, ACTIVE, COMPLETED
    }
}
