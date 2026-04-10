package com.internmgmt.controller;

import com.internmgmt.dto.InternDTO;
import com.internmgmt.model.Intern;
import com.internmgmt.service.InternService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interns")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:4200}")
public class InternController {

    private final InternService internService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InternDTO.Response> createIntern(@Valid @RequestBody InternDTO.CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internService.createIntern(req));
    }

    @GetMapping
    public ResponseEntity<List<InternDTO.Response>> getAllInterns() {
        return ResponseEntity.ok(internService.getAllInterns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternDTO.Response> getInternById(@PathVariable Long id) {
        return ResponseEntity.ok(internService.getInternById(id));
    }

    @GetMapping("/intern-id/{internId}")
    public ResponseEntity<InternDTO.Response> getInternByInternId(@PathVariable String internId) {
        return ResponseEntity.ok(internService.getInternByInternId(internId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<InternDTO.Response>> searchInterns(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Intern.IdCardType idCardType,
            @RequestParam(required = false) Intern.InternStatus status) {
        return ResponseEntity.ok(internService.searchInterns(name, batchId, idCardType, status));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InternDTO.Response> updateIntern(
            @PathVariable Long id,
            @Valid @RequestBody InternDTO.UpdateRequest req) {
        return ResponseEntity.ok(internService.updateIntern(id, req));
    }

    @PatchMapping("/{id}/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InternDTO.Response> updatePerformance(
            @PathVariable Long id,
            @Valid @RequestBody InternDTO.PerformanceUpdate req) {
        return ResponseEntity.ok(internService.updatePerformance(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteIntern(@PathVariable Long id) {
        internService.deleteIntern(id);
        return ResponseEntity.ok(Map.of("message", "Intern deleted successfully", "id", id.toString()));
    }
}
