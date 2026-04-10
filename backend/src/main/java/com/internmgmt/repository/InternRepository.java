package com.internmgmt.repository;

import com.internmgmt.model.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternRepository extends JpaRepository<Intern, Long> {

    Optional<Intern> findByInternId(String internId);
    Optional<Intern> findByEmail(String email);
    boolean existsByEmail(String email);

    List<Intern> findByBatchId(Long batchId);
    List<Intern> findByIdCardType(Intern.IdCardType idCardType);
    List<Intern> findByStatus(Intern.InternStatus status);

    @Query("SELECT i FROM Intern i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Intern> findByNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT i FROM Intern i WHERE " +
           "(:name IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:batchId IS NULL OR i.batch.id = :batchId) AND " +
           "(:idCardType IS NULL OR i.idCardType = :idCardType) AND " +
           "(:status IS NULL OR i.status = :status)")
    List<Intern> searchInterns(@Param("name") String name,
                               @Param("batchId") Long batchId,
                               @Param("idCardType") Intern.IdCardType idCardType,
                               @Param("status") Intern.InternStatus status);

    /**
     * Returns all internId strings for a given type + batch combination.
     * Scoped per batch (not per date) so the sequence counter is global within
     * the batch — e.g. 001, 002, 003 regardless of joining date.
     * Sequence extraction is done in Java to avoid CAST() dialect differences.
     */
    @Query("SELECT i.internId FROM Intern i " +
           "WHERE i.idCardType = :type " +
           "AND i.batch.id = :batchId")
    List<String> findInternIdsByTypeAndBatch(@Param("type") Intern.IdCardType type,
                                             @Param("batchId") Long batchId);

    @Query("SELECT AVG(i.performanceScore) FROM Intern i WHERE i.batch.id = :batchId AND i.performanceScore IS NOT NULL")
    Double getAveragePerformanceScoreByBatch(@Param("batchId") Long batchId);

    // ── Dashboard aggregates ──────────────────────────────────────────────────
    @Query("SELECT COUNT(i) FROM Intern i WHERE i.status = 'ACTIVE'")
    long countActiveInterns();

    @Query("SELECT COUNT(i) FROM Intern i WHERE i.idCardType = 'PREMIUM'")
    long countPremiumInterns();

    @Query("SELECT COUNT(i) FROM Intern i WHERE i.idCardType = 'FREE'")
    long countFreeInterns();

    @Query("SELECT AVG(i.performanceScore) FROM Intern i WHERE i.performanceScore IS NOT NULL")
    Double getOverallAveragePerformanceScore();
}