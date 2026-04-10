package com.internmgmt.repository;

import com.internmgmt.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByBatchName(String batchName);
    boolean existsByBatchName(String batchName);

    List<Batch> findByStatus(Batch.BatchStatus status);

    @Query("SELECT b FROM Batch b WHERE b.startDate >= :startDate AND b.endDate <= :endDate")
    List<Batch> findBatchesByDateRange(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Batch b LEFT JOIN FETCH b.interns WHERE b.id = :id")
    Optional<Batch> findByIdWithInterns(@Param("id") Long id);

    @Query("SELECT b FROM Batch b WHERE b.status = 'ACTIVE' ORDER BY b.startDate")
    List<Batch> findActiveBatches();

    @Query("SELECT COUNT(i) FROM Intern i WHERE i.batch.id = :batchId")
    long countInternsByBatchId(@Param("batchId") Long batchId);

    // FIX 6: batch search/filter — by name and minimum intern count
    @Query("SELECT b FROM Batch b WHERE " +
           "(:name IS NULL OR LOWER(b.batchName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "SIZE(b.interns) >= :minInternCount")
    List<Batch> searchBatches(@Param("name") String name,
                              @Param("status") Batch.BatchStatus status,
                              @Param("minInternCount") int minInternCount);

    // Dashboard helpers
    @Query("SELECT COUNT(b) FROM Batch b WHERE b.status = 'ACTIVE'")
    long countActiveBatches();

    @Query("SELECT COUNT(b) FROM Batch b WHERE b.status = 'COMPLETED'")
    long countCompletedBatches();
}
