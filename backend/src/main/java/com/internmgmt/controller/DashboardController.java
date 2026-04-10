package com.internmgmt.controller;

import com.internmgmt.dto.DashboardDTO;
import com.internmgmt.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:4200}")
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/v1/dashboard
     * Returns aggregate stats: total interns, active/completed batches,
     * average performance score, and card-type breakdown.
     * Accessible by ADMIN, MANAGER, and VIEWER roles.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VIEWER')")
    public ResponseEntity<DashboardDTO.Stats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}
