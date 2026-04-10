package com.internmgmt.controller;

import com.internmgmt.config.CustomUserDetailsService;
import com.internmgmt.config.JwtAuthenticationFilter;
import com.internmgmt.dto.DashboardDTO;
import com.internmgmt.service.DashboardService;
import com.internmgmt.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
@DisplayName("DashboardController Integration Tests")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private DashboardService dashboardService;
    @MockBean private JwtService jwtService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/dashboard — returns 200 with stats for ADMIN")
    void getDashboardStats_asAdmin_returns200() throws Exception {
        DashboardDTO.Stats stats = DashboardDTO.Stats.builder()
                .totalInterns(25L)
                .activeInterns(20L)
                .totalBatches(3L)
                .activeBatches(2L)
                .completedBatches(1L)
                .premiumInterns(10L)
                .freeInterns(15L)
                .averagePerformanceScore(78.5)
                .build();

        when(dashboardService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/dashboard").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInterns").value(25))
                .andExpect(jsonPath("$.activeBatches").value(2))
                .andExpect(jsonPath("$.completedBatches").value(1))
                .andExpect(jsonPath("$.averagePerformanceScore").value(78.5));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("GET /api/v1/dashboard — returns 200 for MANAGER")
    void getDashboardStats_asManager_returns200() throws Exception {
        DashboardDTO.Stats stats = DashboardDTO.Stats.builder()
                .totalInterns(10L).activeInterns(8L).totalBatches(2L)
                .activeBatches(1L).completedBatches(1L)
                .premiumInterns(5L).freeInterns(5L).averagePerformanceScore(82.0)
                .build();

        when(dashboardService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/dashboard").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInterns").value(10));
    }
}
