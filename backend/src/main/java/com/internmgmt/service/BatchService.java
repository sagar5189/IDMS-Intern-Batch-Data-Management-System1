package com.internmgmt.service;

import com.internmgmt.dto.BatchDTO;
import com.internmgmt.dto.InternDTO;
import com.internmgmt.model.Batch;
import com.internmgmt.repository.BatchRepository;
import com.internmgmt.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BatchService {

    private final BatchRepository batchRepository;
    private final InternRepository internRepository;
    private final NotificationService notificationService;

    // ── CREATE ────────────────────────────────────────────────────────────────
    public BatchDTO.Response createBatch(BatchDTO.CreateRequest req) {
        if (batchRepository.existsByBatchName(req.getBatchName())) {
            throw new IllegalArgumentException("Batch name already exists: " + req.getBatchName());
        }

        Batch batch = Batch.builder()
                .batchName(req.getBatchName())
                .startDate(req.getStartDate())
                .endDate(req.getStartDate().plusMonths(6))   // auto-calculate per spec
                .description(req.getDescription())
                .build();

        batch.calculateEndDateAndStatus();
        Batch saved = batchRepository.save(batch);
        log.info("Created batch: {}", saved.getBatchName());

        notificationService.sendBatchCreationNotification(saved);
        return mapToResponse(saved, true);
    }

    // ── READ ──────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<BatchDTO.Response> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(b -> mapToResponse(b, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BatchDTO.Summary> getBatchSummaries() {
        return batchRepository.findAll().stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BatchDTO.Response getBatchById(Long id) {
        Batch batch = batchRepository.findByIdWithInterns(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));
        return mapToResponse(batch, true);
    }

    @Transactional(readOnly = true)
    public List<BatchDTO.Response> getActiveBatches() {
        return batchRepository.findActiveBatches().stream()
                .map(b -> mapToResponse(b, false))
                .collect(Collectors.toList());
    }

    // FIX 6: search batches by name, status and minimum intern count
    @Transactional(readOnly = true)
    public List<BatchDTO.Response> searchBatches(String name,
                                                   Batch.BatchStatus status,
                                                   int minInternCount) {
        return batchRepository.searchBatches(name, status, minInternCount)
                .stream()
                .map(b -> mapToResponse(b, false))
                .collect(Collectors.toList());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public BatchDTO.Response updateBatch(Long id, BatchDTO.UpdateRequest req) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));

        if (req.getBatchName() != null) batch.setBatchName(req.getBatchName());
        if (req.getDescription() != null) batch.setDescription(req.getDescription());
        if (req.getStartDate() != null) {
            batch.setStartDate(req.getStartDate());
            batch.setEndDate(req.getStartDate().plusMonths(6));
        }
        if (req.getStatus() != null) batch.setStatus(req.getStatus());

        return mapToResponse(batchRepository.save(batch), false);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    public void deleteBatch(Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));

        if (!batch.getInterns().isEmpty()) {
            throw new IllegalStateException("Cannot delete batch with assigned interns");
        }

        batchRepository.deleteById(id);
    }

    // ── OVERVIEW ──────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BatchDTO.Response getBatchOverview(Long id) {
        Batch batch = batchRepository.findByIdWithInterns(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));
        return mapToResponse(batch, true);
    }

    // ── SCHEDULED STATUS UPDATE ───────────────────────────────────────────────
    @Scheduled(cron = "0 0 0 * * *")
    public void updateBatchStatuses() {
        log.info("Running scheduled batch status update…");
        LocalDate today = LocalDate.now();

        batchRepository.findAll().forEach(batch -> {
            Batch.BatchStatus newStatus;
            if (today.isBefore(batch.getStartDate()))       newStatus = Batch.BatchStatus.UPCOMING;
            else if (!today.isAfter(batch.getEndDate()))    newStatus = Batch.BatchStatus.ACTIVE;
            else                                             newStatus = Batch.BatchStatus.COMPLETED;

            if (batch.getStatus() != newStatus) {
                batch.setStatus(newStatus);
                batchRepository.save(batch);
            }
        });
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────
    private BatchDTO.Response mapToResponse(Batch batch, boolean includeInterns) {
        Double avgScore = internRepository.getAveragePerformanceScoreByBatch(batch.getId());

        BatchDTO.Response.ResponseBuilder builder = BatchDTO.Response.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .description(batch.getDescription())
                .status(batch.getStatus())
                .totalInterns(batch.getTotalInterns())
                .averagePerformanceScore(avgScore)
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt());

        if (includeInterns && batch.getInterns() != null) {
            List<InternDTO.Response> internResponses = batch.getInterns().stream()
                    .map(i -> InternDTO.Response.builder()
                            .id(i.getId()).internId(i.getInternId()).name(i.getName())
                            .email(i.getEmail()).mobileNumber(i.getMobileNumber())
                            .idCardType(i.getIdCardType()).dateOfJoining(i.getDateOfJoining())
                            .status(i.getStatus()).performanceScore(i.getPerformanceScore())
                            .performanceRemarks(i.getPerformanceRemarks())
                            .batchId(batch.getId()).batchName(batch.getBatchName())
                            .build())
                    .collect(Collectors.toList());
            builder.interns(internResponses);
        }

        return builder.build();
    }

    private BatchDTO.Summary mapToSummary(Batch batch) {
        return BatchDTO.Summary.builder()
                .id(batch.getId()).batchName(batch.getBatchName())
                .startDate(batch.getStartDate()).endDate(batch.getEndDate())
                .status(batch.getStatus()).totalInterns(batch.getTotalInterns())
                .build();
    }
}
