package com.internmgmt.dto;

import lombok.*;

public class DashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Stats {
        private long totalInterns;
        private long activeInterns;
        private long totalBatches;
        private long activeBatches;
        private long completedBatches;
        private long premiumInterns;
        private long freeInterns;
        private Double averagePerformanceScore;
    }
}
