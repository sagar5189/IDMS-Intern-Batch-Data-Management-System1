package com.internmgmt.service;

import com.internmgmt.dto.InternDTO;
import com.internmgmt.model.Batch;
import com.internmgmt.model.Intern;
import com.internmgmt.repository.BatchRepository;
import com.internmgmt.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InternService {

    private static final int MAX_ID_GEN_ATTEMPTS = 3;

    private final InternRepository internRepository;
    private final BatchRepository batchRepository;
    private final NotificationService notificationService;

    // ── CREATE ────────────────────────────────────────────────────────────────
    public InternDTO.Response createIntern(InternDTO.CreateRequest req) {
        if (internRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }

        Batch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + req.getBatchId()));

        /*
         * Concurrency-safe ID generation:
         *   1. Read the current max sequence from the DB and compute the next candidate ID.
         *   2. Attempt to save. If a concurrent request already inserted the same ID
         *      (DataIntegrityViolationException on the unique column), increment and retry.
         *   3. Retry up to MAX_ID_GEN_ATTEMPTS times before failing hard.
         *   The DB unique constraint on intern_id is the true guard; this loop handles
         *   the rare collision without a JVM-level lock (safe for multi-instance deployments).
         */
        for (int attempt = 1; attempt <= MAX_ID_GEN_ATTEMPTS; attempt++) {
            try {
                String internId = generateInternId(
                        req.getDateOfJoining(), req.getIdCardType(), req.getBatchId());

                Intern intern = Intern.builder()
                        .internId(internId)
                        .name(req.getName())
                        .email(req.getEmail())
                        .mobileNumber(req.getMobileNumber())
                        .idCardType(req.getIdCardType())
                        .dateOfJoining(req.getDateOfJoining())
                        .batch(batch)
                        .status(Intern.InternStatus.ACTIVE)
                        .build();

                Intern saved = internRepository.save(intern);
                // flush immediately so DataIntegrityViolationException is thrown inside this loop
                internRepository.flush();

                log.info("Created intern: {} with ID: {} (attempt {})",
                        saved.getName(), saved.getInternId(), attempt);

                notificationService.sendInternRegistrationNotification(saved);
                return mapToResponse(saved);

            } catch (DataIntegrityViolationException ex) {
                if (attempt == MAX_ID_GEN_ATTEMPTS) {
                    log.error("Failed to generate unique intern ID after {} attempts for batch {}",
                            MAX_ID_GEN_ATTEMPTS, req.getBatchId());
                    throw new RuntimeException(
                            "Could not generate a unique intern ID. Please try again.");
                }
                log.warn("Intern ID collision on attempt {} for batch {}, retrying…",
                        attempt, req.getBatchId());
            }
        }
        // unreachable — loop always returns or throws
        throw new RuntimeException("Unexpected error during intern creation");
    }

    // ── READ ──────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InternDTO.Response> getAllInterns() {
        return internRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InternDTO.Response getInternById(Long id) {
        return internRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + id));
    }

    @Transactional(readOnly = true)
    public InternDTO.Response getInternByInternId(String internId) {
        return internRepository.findByInternId(internId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + internId));
    }

    @Transactional(readOnly = true)
    public List<InternDTO.Response> searchInterns(String name, Long batchId,
                                                   Intern.IdCardType idCardType,
                                                   Intern.InternStatus status) {
        return internRepository.searchInterns(name, batchId, idCardType, status)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public InternDTO.Response updateIntern(Long id, InternDTO.UpdateRequest req) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + id));

        if (req.getName() != null) intern.setName(req.getName());
        if (req.getEmail() != null) intern.setEmail(req.getEmail());
        if (req.getMobileNumber() != null) intern.setMobileNumber(req.getMobileNumber());
        if (req.getStatus() != null) intern.setStatus(req.getStatus());
        if (req.getPerformanceScore() != null) intern.setPerformanceScore(req.getPerformanceScore());
        if (req.getPerformanceRemarks() != null) intern.setPerformanceRemarks(req.getPerformanceRemarks());
        if (req.getBatchId() != null) {
            Batch batch = batchRepository.findById(req.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found: " + req.getBatchId()));
            intern.setBatch(batch);
        }

        return mapToResponse(internRepository.save(intern));
    }

    public InternDTO.Response updatePerformance(Long id, InternDTO.PerformanceUpdate req) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Intern not found: " + id));
        intern.setPerformanceScore(req.getPerformanceScore());
        intern.setPerformanceRemarks(req.getPerformanceRemarks());
        return mapToResponse(internRepository.save(intern));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    public void deleteIntern(Long id) {
        if (!internRepository.existsById(id)) {
            throw new RuntimeException("Intern not found: " + id);
        }
        internRepository.deleteById(id);
        log.info("Deleted intern with id: {}", id);
    }

    // ── ID GENERATION — per-batch sequence, DB-agnostic ──────────────────────
    /**
     * Computes the next intern ID for the given type + batch combination.
     *
     * Sequence is scoped per (type + batch) so every intern of the same card
     * type within a batch gets a globally incrementing number — 001, 002, 003 —
     * regardless of their joining date. This matches the spec requirement of
     * "sequential per batch".
     *
     * Sequence extraction is done entirely in Java by parsing the trailing
     * 3-digit suffix from existing IDs. This avoids CAST() JPQL expressions
     * that behave differently across H2 (dev) and MySQL (prod) dialects.
     *
     * Thread-safety is handled at the persistence layer: the unique constraint
     * on intern_id + the retry loop in createIntern() guarantee correctness
     * under concurrent writes without a JVM-level lock.
     */
    private String generateInternId(LocalDate dateOfJoining,
                                     Intern.IdCardType type,
                                     Long batchId) {
        String prefix = type == Intern.IdCardType.PREMIUM ? "EMP" : "TDA";
        String datePart = dateOfJoining.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Sequence is per (type + batch) — not per date — so the counter is
        // global within the batch regardless of when each intern joined.
        List<String> existingIds = internRepository
                .findInternIdsByTypeAndBatch(type, batchId);

        int maxSeq = existingIds.stream()
                .mapToInt(id -> {
                    try {
                        int dashIdx = id.lastIndexOf('-');
                        return dashIdx >= 0
                                ? Integer.parseInt(id.substring(dashIdx + 1))
                                : 0;
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .max()
                .orElse(0);

        return String.format("%s%s-%03d", prefix, datePart, maxSeq + 1);
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────
    private InternDTO.Response mapToResponse(Intern intern) {
        return InternDTO.Response.builder()
                .id(intern.getId())
                .internId(intern.getInternId())
                .name(intern.getName())
                .email(intern.getEmail())
                .mobileNumber(intern.getMobileNumber())
                .idCardType(intern.getIdCardType())
                .dateOfJoining(intern.getDateOfJoining())
                .batchName(intern.getBatch() != null ? intern.getBatch().getBatchName() : null)
                .batchId(intern.getBatch() != null ? intern.getBatch().getId() : null)
                .status(intern.getStatus())
                .performanceScore(intern.getPerformanceScore())
                .performanceRemarks(intern.getPerformanceRemarks())
                .createdAt(intern.getCreatedAt())
                .updatedAt(intern.getUpdatedAt())
                .build();
    }
}
