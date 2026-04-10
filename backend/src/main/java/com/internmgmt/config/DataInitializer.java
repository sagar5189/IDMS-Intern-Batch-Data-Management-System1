package com.internmgmt.config;

import com.internmgmt.model.Batch;
import com.internmgmt.model.Intern;
import com.internmgmt.model.User;
import com.internmgmt.repository.BatchRepository;
import com.internmgmt.repository.InternRepository;
import com.internmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final InternRepository internRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedBatchesAndInterns();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        log.info("Seeding demo users...");

        userRepository.save(User.builder()
                .username("admin").email("admin@internhub.com")
                .fullName("System Admin").password(passwordEncoder.encode("admin123"))
                .roles(Set.of(User.UserRole.ADMIN)).build());

        userRepository.save(User.builder()
                .username("manager").email("manager@internhub.com")
                .fullName("Batch Manager").password(passwordEncoder.encode("mgr123"))
                .roles(Set.of(User.UserRole.MANAGER)).build());

        userRepository.save(User.builder()
                .username("viewer").email("viewer@internhub.com")
                .fullName("HR Viewer").password(passwordEncoder.encode("view123"))
                .roles(Set.of(User.UserRole.VIEWER)).build());

        log.info("Demo users created → admin/admin123  manager/mgr123  viewer/view123");
    }

    private void seedBatchesAndInterns() {
        if (batchRepository.count() > 0) return;
        log.info("Seeding demo batches and interns...");

        // Batch A — active
        Batch batchA = batchRepository.save(Batch.builder()
                .batchName("Batch 2024-A")
                .startDate(LocalDate.of(2024, 7, 1))
                .endDate(LocalDate.of(2024, 7, 1).plusMonths(6))
                .description("Summer 2024 cohort — Full Stack Development")
                .status(Batch.BatchStatus.COMPLETED)
                .build());

        // Batch B — active
        Batch batchB = batchRepository.save(Batch.builder()
                .batchName("Batch 2025-A")
                .startDate(LocalDate.of(2025, 1, 15))
                .endDate(LocalDate.of(2025, 1, 15).plusMonths(6))
                .description("Winter 2025 cohort — Cloud & DevOps")
                .status(Batch.BatchStatus.ACTIVE)
                .build());

        // Batch C — upcoming
        batchRepository.save(Batch.builder()
                .batchName("Batch 2025-B")
                .startDate(LocalDate.of(2025, 7, 1))
                .endDate(LocalDate.of(2025, 7, 1).plusMonths(6))
                .description("Summer 2025 cohort — AI & ML")
                .status(Batch.BatchStatus.UPCOMING)
                .build());

        // Interns for Batch A
        String[][] internsA = {
            {"Priya Sharma",    "priya@example.com",    "9876543210", "PREMIUM", "2024-07-01"},
            {"Rahul Kumar",     "rahul@example.com",    "9812345678", "FREE",    "2024-07-01"},
            {"Anita Patel",     "anita@example.com",    "9834567890", "PREMIUM", "2024-07-02"},
            {"Vijay Singh",     "vijay@example.com",    "9845678901", "FREE",    "2024-07-03"},
            {"Sneha Gupta",     "sneha@example.com",    "9856789012", "PREMIUM", "2024-07-04"},
        };

        int[] scoresA = {88, 72, 91, 65, 85};
        int seqPremiumA = 0, seqFreeA = 0;

        for (int i = 0; i < internsA.length; i++) {
            String[] d = internsA[i];
            Intern.IdCardType type = Intern.IdCardType.valueOf(d[3]);
            LocalDate doj = LocalDate.parse(d[4]);
            String prefix = type == Intern.IdCardType.PREMIUM ? "EMP" : "TDA";
            int seq = type == Intern.IdCardType.PREMIUM ? ++seqPremiumA : ++seqFreeA;
            String internId = String.format("%s%s-%03d", prefix, doj.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")), seq);

            internRepository.save(Intern.builder()
                    .internId(internId).name(d[0]).email(d[1]).mobileNumber(d[2])
                    .idCardType(type).dateOfJoining(doj).batch(batchA)
                    .status(Intern.InternStatus.COMPLETED)
                    .performanceScore((double) scoresA[i])
                    .performanceRemarks("Completed with " + (scoresA[i] >= 80 ? "distinction" : "good performance"))
                    .build());
        }

        // Interns for Batch B
        String[][] internsB = {
            {"Deepak Verma",    "deepak@example.com",   "9867890123", "PREMIUM", "2025-01-15"},
            {"Kavita Rao",      "kavita@example.com",   "9878901234", "FREE",    "2025-01-15"},
            {"Arjun Nair",      "arjun@example.com",    "9889012345", "PREMIUM", "2025-01-16"},
            {"Pooja Mehta",     "pooja@example.com",    "9890123456", "FREE",    "2025-01-17"},
        };

        double[] scoresB = {78.5, 0, 83.0, 0};
        int seqPremiumB = 0, seqFreeB = 0;

        for (int i = 0; i < internsB.length; i++) {
            String[] d = internsB[i];
            Intern.IdCardType type = Intern.IdCardType.valueOf(d[3]);
            LocalDate doj = LocalDate.parse(d[4]);
            String prefix = type == Intern.IdCardType.PREMIUM ? "EMP" : "TDA";
            int seq = type == Intern.IdCardType.PREMIUM ? ++seqPremiumB : ++seqFreeB;
            String internId = String.format("%s%s-%03d", prefix, doj.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")), seq);

            var builder = Intern.builder()
                    .internId(internId).name(d[0]).email(d[1]).mobileNumber(d[2])
                    .idCardType(type).dateOfJoining(doj).batch(batchB)
                    .status(Intern.InternStatus.ACTIVE);

            if (scoresB[i] > 0) builder.performanceScore(scoresB[i]).performanceRemarks("Mid-term evaluation done");

            internRepository.save(builder.build());
        }

        log.info("Seeded {} batches and {} interns.", 3, internsA.length + internsB.length);
    }
}
