package com.internmgmt.service;

import com.internmgmt.dto.DashboardDTO;
import com.internmgmt.repository.BatchRepository;
import com.internmgmt.repository.InternRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final InternRepository internRepository;
    private final BatchRepository batchRepository;

    public DashboardDTO.Stats getStats() {
        long totalInterns     = internRepository.count();
        long activeInterns    = internRepository.countActiveInterns();
        long premiumInterns   = internRepository.countPremiumInterns();
        long freeInterns      = internRepository.countFreeInterns();
        Double avgScore       = internRepository.getOverallAveragePerformanceScore();

        long totalBatches     = batchRepository.count();
        long activeBatches    = batchRepository.countActiveBatches();
        long completedBatches = batchRepository.countCompletedBatches();

        return DashboardDTO.Stats.builder()
                .totalInterns(totalInterns)
                .activeInterns(activeInterns)
                .totalBatches(totalBatches)
                .activeBatches(activeBatches)
                .completedBatches(completedBatches)
                .premiumInterns(premiumInterns)
                .freeInterns(freeInterns)
                .averagePerformanceScore(avgScore != null
                        ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .build();
    }
}
