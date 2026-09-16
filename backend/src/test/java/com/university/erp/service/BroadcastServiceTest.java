package com.university.erp.service;

import com.university.erp.model.AuditLog;
import com.university.erp.model.Broadcast;
import com.university.erp.model.User;
import com.university.erp.repository.AuditLogRepository;
import com.university.erp.repository.BroadcastRepository;
import com.university.erp.repository.UserRepository;
import com.university.erp.util.ErpException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BroadcastServiceTest {

    BroadcastRepository broadcastRepository;
    AuditLogRepository auditLogRepository;
    UserRepository userRepository;
    SimpMessagingTemplate messagingTemplate;
    BroadcastService broadcastService;

    @BeforeEach
    void setUp() {
        broadcastRepository = mock(BroadcastRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        userRepository = mock(UserRepository.class);
        messagingTemplate = mock(SimpMessagingTemplate.class);

        broadcastService = new BroadcastService(
                broadcastRepository,
                auditLogRepository,
                userRepository,
                messagingTemplate
        );
    }

    @Test
    void createBroadcast_StoresInDb_GeneratesAudit_DispatchesWs() {
        User admin = User.builder().userId(1L).username("admin").build();
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        when(broadcastRepository.save(any(Broadcast.class))).thenAnswer(i -> {
            Broadcast b = i.getArgument(0);
            b.setId(100L);
            return b;
        });

        Broadcast result = broadcastService.createBroadcast(
                "Campus Symposium", "Symposium starts tomorrow", "HIGH", "ALL", "admin", "192.168.1.10"
        );

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Campus Symposium", result.getTitle());
        assertEquals("Symposium starts tomorrow", result.getMessage());
        assertEquals("high", result.getPriority());
        assertEquals("ALL", result.getAudience());
        assertTrue(result.getActive());

        verify(broadcastRepository, times(1)).save(any(Broadcast.class));
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/broadcasts"), any(Map.class));
    }

    @Test
    void createBroadcast_RejectsEmptyTitleOrContent() {
        assertThrows(ErpException.BadRequestException.class, () -> {
            broadcastService.createBroadcast("", "Valid message", "INFO", "ALL", "admin", "127.0.0.1");
        });

        assertThrows(ErpException.BadRequestException.class, () -> {
            broadcastService.createBroadcast("Valid title", "", "INFO", "ALL", "admin", "127.0.0.1");
        });
    }

    @Test
    void deactivateBroadcast_SetsActiveFalse() {
        Broadcast active = Broadcast.builder().id(50L).active(true).build();
        when(broadcastRepository.findById(50L)).thenReturn(Optional.of(active));

        boolean success = broadcastService.deactivateBroadcast(50L);
        assertTrue(success);
        assertFalse(active.getActive());
        verify(broadcastRepository, times(1)).save(active);
    }

    @Test
    void getActiveBroadcasts_FiltersAudienceCorrectly() {
        when(broadcastRepository.findByAudienceInAndActiveTrueOrderByCreatedAtDesc(anyList()))
                .thenReturn(List.of(new Broadcast()));

        List<Broadcast> studentList = broadcastService.getActiveBroadcasts("STUDENT");
        assertNotNull(studentList);
        verify(broadcastRepository).findByAudienceInAndActiveTrueOrderByCreatedAtDesc(
                argThat(list -> list.contains("ALL") && list.contains("STUDENT") && list.contains("STUDENTS"))
        );
    }
}
