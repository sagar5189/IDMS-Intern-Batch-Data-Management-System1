package com.internmgmt.service;

import com.internmgmt.dto.InternDTO;
import com.internmgmt.model.Batch;
import com.internmgmt.model.Intern;
import com.internmgmt.repository.BatchRepository;
import com.internmgmt.repository.InternRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InternService Unit Tests")
class InternServiceTest {

    @Mock private InternRepository internRepository;
    @Mock private BatchRepository batchRepository;
    @Mock private NotificationService notificationService;
    @InjectMocks private InternService internService;

    private Batch sampleBatch;
    private InternDTO.CreateRequest validRequest;
    private static final LocalDate JOINING_DATE = LocalDate.of(2024, 11, 29);

    @BeforeEach
    void setUp() {
        sampleBatch = Batch.builder()
                .id(1L)
                .batchName("Batch 2024-A")
                .startDate(LocalDate.of(2024, 11, 1))
                .endDate(LocalDate.of(2025, 5, 1))
                .build();

        validRequest = InternDTO.CreateRequest.builder()
                .name("Priya Sharma")
                .email("priya@example.com")
                .mobileNumber("9876543210")
                .idCardType(Intern.IdCardType.PREMIUM)
                .dateOfJoining(JOINING_DATE)
                .batchId(1L)
                .build();
    }

    // ── createIntern ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("createIntern — happy path generates EMP ID with per-batch sequence 001")
    void createIntern_happyPath_generatesPremiumId() {
        when(internRepository.existsByEmail("priya@example.com")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(sampleBatch));
        when(internRepository.findInternIdsByTypeAndBatch(Intern.IdCardType.PREMIUM, 1L))
                .thenReturn(List.of());  // no existing intern → first in batch

        Intern savedIntern = Intern.builder()
                .id(1L)
                .internId("EMP20241129-001")
                .name("Priya Sharma")
                .email("priya@example.com")
                .mobileNumber("9876543210")
                .idCardType(Intern.IdCardType.PREMIUM)
                .dateOfJoining(JOINING_DATE)
                .batch(sampleBatch)
                .status(Intern.InternStatus.ACTIVE)
                .build();

        when(internRepository.findByInternId("EMP20241129-001")).thenReturn(Optional.empty());
        when(internRepository.save(any(Intern.class))).thenReturn(savedIntern);
        doNothing().when(notificationService).sendInternRegistrationNotification(any());

        InternDTO.Response response = internService.createIntern(validRequest);

        assertThat(response.getInternId()).isEqualTo("EMP20241129-001");
        assertThat(response.getName()).isEqualTo("Priya Sharma");
        assertThat(response.getStatus()).isEqualTo(Intern.InternStatus.ACTIVE);
        verify(internRepository).save(any(Intern.class));
    }

    @Test
    @DisplayName("createIntern — FREE card type generates TDA prefix ID")
    void createIntern_freeCardType_generatesTdaId() {
        validRequest.setIdCardType(Intern.IdCardType.FREE);

        when(internRepository.existsByEmail("priya@example.com")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(sampleBatch));
        when(internRepository.findInternIdsByTypeAndBatch(Intern.IdCardType.FREE, 1L))
                .thenReturn(List.of());

        Intern saved = Intern.builder()
                .id(2L)
                .internId("TDA20241129-001")
                .name("Priya Sharma")
                .email("priya@example.com")
                .mobileNumber("9876543210")
                .idCardType(Intern.IdCardType.FREE)
                .dateOfJoining(JOINING_DATE)
                .batch(sampleBatch)
                .status(Intern.InternStatus.ACTIVE)
                .build();

        when(internRepository.findByInternId("TDA20241129-001")).thenReturn(Optional.empty());
        when(internRepository.save(any(Intern.class))).thenReturn(saved);
        doNothing().when(notificationService).sendInternRegistrationNotification(any());

        InternDTO.Response response = internService.createIntern(validRequest);
        assertThat(response.getInternId()).startsWith("TDA");
        assertThat(response.getInternId()).isEqualTo("TDA20241129-001");
    }

    @Test
    @DisplayName("createIntern — second intern in same batch gets sequence 002")
    void createIntern_secondInternSameBatch_getsSequence002() {
        when(internRepository.existsByEmail("priya@example.com")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(sampleBatch));
        // existing intern already added with sequence 001
        when(internRepository.findInternIdsByTypeAndBatch(Intern.IdCardType.PREMIUM, 1L))
                .thenReturn(List.of("EMP20241129-001"));

        Intern saved = Intern.builder()
                .id(3L).internId("EMP20241129-002")
                .name("Priya Sharma").email("priya@example.com")
                .mobileNumber("9876543210").idCardType(Intern.IdCardType.PREMIUM)
                .dateOfJoining(JOINING_DATE).batch(sampleBatch)
                .status(Intern.InternStatus.ACTIVE).build();

        when(internRepository.findByInternId("EMP20241129-002")).thenReturn(Optional.empty());
        when(internRepository.save(any(Intern.class))).thenReturn(saved);
        doNothing().when(notificationService).sendInternRegistrationNotification(any());

        InternDTO.Response response = internService.createIntern(validRequest);
        assertThat(response.getInternId()).isEqualTo("EMP20241129-002");
    }

    // ── Duplicate email validation ─────────────────────────────────────────────

    @Test
    @DisplayName("createIntern — throws IllegalArgumentException on duplicate email")
    void createIntern_duplicateEmail_throwsException() {
        when(internRepository.existsByEmail("priya@example.com")).thenReturn(true);

        assertThatThrownBy(() -> internService.createIntern(validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");

        verify(internRepository, never()).save(any());
    }

    @Test
    @DisplayName("createIntern — throws RuntimeException when batch not found")
    void createIntern_batchNotFound_throwsException() {
        when(internRepository.existsByEmail("priya@example.com")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> internService.createIntern(validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Batch not found");
    }

    // ── ID generation format ───────────────────────────────────────────────────

    @Test
    @DisplayName("ID format — PREMIUM: EMP{YYYYMMDD}-{3digit}")
    void idFormat_premium_correctFormat() {
        when(internRepository.existsByEmail(anyString())).thenReturn(false);
        when(batchRepository.findById(anyLong())).thenReturn(Optional.of(sampleBatch));
        when(internRepository.findInternIdsByTypeAndBatch(any(), anyLong()))
                .thenReturn(List.of());

        Intern saved = Intern.builder()
                .id(1L).internId("EMP20241129-001")
                .name("Test").email("test@example.com")
                .mobileNumber("9876543210").idCardType(Intern.IdCardType.PREMIUM)
                .dateOfJoining(JOINING_DATE).batch(sampleBatch)
                .status(Intern.InternStatus.ACTIVE).build();

        when(internRepository.findByInternId("EMP20241129-001")).thenReturn(Optional.empty());
        when(internRepository.save(any())).thenReturn(saved);
        doNothing().when(notificationService).sendInternRegistrationNotification(any());

        InternDTO.Response resp = internService.createIntern(validRequest);
        assertThat(resp.getInternId()).matches("EMP\\d{8}-\\d{3}");
    }

    @Test
    @DisplayName("ID format — FREE: TDA{YYYYMMDD}-{3digit}")
    void idFormat_free_correctFormat() {
        validRequest.setIdCardType(Intern.IdCardType.FREE);
        when(internRepository.existsByEmail(anyString())).thenReturn(false);
        when(batchRepository.findById(anyLong())).thenReturn(Optional.of(sampleBatch));
        when(internRepository.findInternIdsByTypeAndBatch(any(), anyLong()))
                .thenReturn(List.of());

        Intern saved = Intern.builder()
                .id(1L).internId("TDA20241129-001")
                .name("Test").email("test@example.com")
                .mobileNumber("9876543210").idCardType(Intern.IdCardType.FREE)
                .dateOfJoining(JOINING_DATE).batch(sampleBatch)
                .status(Intern.InternStatus.ACTIVE).build();

        when(internRepository.findByInternId("TDA20241129-001")).thenReturn(Optional.empty());
        when(internRepository.save(any())).thenReturn(saved);
        doNothing().when(notificationService).sendInternRegistrationNotification(any());

        InternDTO.Response resp = internService.createIntern(validRequest);
        assertThat(resp.getInternId()).matches("TDA\\d{8}-\\d{3}");
    }

    // ── getAllInterns ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllInterns — returns mapped list")
    void getAllInterns_returnsMappedList() {
        Intern i1 = Intern.builder().id(1L).internId("EMP20241129-001")
                .name("A").email("a@e.com").mobileNumber("9000000001")
                .idCardType(Intern.IdCardType.PREMIUM).dateOfJoining(JOINING_DATE)
                .batch(sampleBatch).status(Intern.InternStatus.ACTIVE).build();
        Intern i2 = Intern.builder().id(2L).internId("TDA20241129-001")
                .name("B").email("b@e.com").mobileNumber("9000000002")
                .idCardType(Intern.IdCardType.FREE).dateOfJoining(JOINING_DATE)
                .batch(sampleBatch).status(Intern.InternStatus.ACTIVE).build();

        when(internRepository.findAll()).thenReturn(List.of(i1, i2));

        List<InternDTO.Response> result = internService.getAllInterns();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getInternId()).isEqualTo("EMP20241129-001");
        assertThat(result.get(1).getInternId()).isEqualTo("TDA20241129-001");
    }

    // ── deleteIntern ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteIntern — calls deleteById when intern exists")
    void deleteIntern_internExists_deletesSuccessfully() {
        when(internRepository.existsById(1L)).thenReturn(true);
        internService.deleteIntern(1L);
        verify(internRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteIntern — throws when intern not found")
    void deleteIntern_internNotFound_throwsException() {
        when(internRepository.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> internService.deleteIntern(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Intern not found");
    }
}