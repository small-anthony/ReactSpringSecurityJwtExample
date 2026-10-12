package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.service.dto.NotificationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Etudiant etudiant;
    private Notification notification;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant("Hatim", "Fakhour", new Credentials("etudiant@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        notification = new Notification(etudiant, "Titre", "Message", "CONVOCATION_NOUVELLE", 1L);
        notification.setId(10L);
    }

    @Test
    void creerNotification_succes() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Notification result = notificationService.creerNotification(etudiant, "Titre", "Message", "TYPE", 1L);

        assertNotNull(result);
        assertEquals("Titre", result.getTitre());
        assertEquals("Message", result.getMessage());
        assertFalse(result.isLu());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getNotifications_succes() {
        when(notificationRepository.findByDestinataireEmail("etudiant@test.com"))
                .thenReturn(List.of(notification));

        List<NotificationDto> dtos = notificationService.getNotifications("etudiant@test.com");

        assertNotNull(dtos);
        assertEquals(1, dtos.size());
        assertEquals("Titre", dtos.get(0).getTitre());
    }

    @Test
    void marquerCommeLue_succes() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        notificationService.marquerCommeLue(10L, "etudiant@test.com");

        assertTrue(notification.isLu());
        verify(notificationRepository).save(notification);
    }

    @Test
    void marquerCommeLue_accesRefuse_lanceException() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        assertThrows(SecurityException.class, () ->
                notificationService.marquerCommeLue(10L, "autre@test.com")
        );
    }

    @Test
    void marquerToutesCommeLues_succes() {
        notificationService.marquerToutesCommeLues("etudiant@test.com");
        verify(notificationRepository).marquerToutesCommeLuesByEmail("etudiant@test.com");
    }
}
