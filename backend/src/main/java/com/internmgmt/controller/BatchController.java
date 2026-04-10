package com.internmgmt.controller;

import com.internmgmt.dto.BatchDTO;
import com.internmgmt.model.Batch;
import com.internmgmt.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:4200}")
public class BatchController {

    private final BatchService batchService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BatchDTO.Response> createBatch(@Valid @RequestBody BatchDTO.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(batchService.createBatch(req));
    }

    @GetMapping
    public ResponseEntity<List<BatchDTO.Response>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @GetMapping("/summaries")
    public ResponseEntity<List<BatchDTO.Summary>> getBatchSummaries() {
        return ResponseEntity.ok(batchService.getBatchSummaries());
    }

    @GetMapping("/active")
    public ResponseEntity<List<BatchDTO.Response>> getActiveBatches() {
        return ResponseEntity.ok(batchService.getActiveBatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO.Response> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @GetMapping("/{id}/overview")
    public ResponseEntity<BatchDTO.Response> getBatchOverview(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchOverview(id));
    }

    // FIX 6: Batch search endpoint
    @GetMapping("/search")
    public ResponseEntity<List<BatchDTO.Response>> searchBatches(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Batch.BatchStatus status,
            @RequestParam(defaultValue = "0") int minInternCount) {
        return ResponseEntity.ok(batchService.searchBatches(name, status, minInternCount));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<BatchDTO.Response> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchDTO.UpdateRequest req) {
        return ResponseEntity.ok(batchService.updateBatch(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(Map.of("message", "Batch deleted successfully"));
    }
}
