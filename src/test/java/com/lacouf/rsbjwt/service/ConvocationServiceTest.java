package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConvocationServiceTest {

    @Mock
    private ConvocationRepository convocationRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ConvocationService convocationService;

    private Etudiant etudiant;
    private Employeur employeur;
    private OffreStage offreStage;
    private Candidature candidature;
    private Convocation convocation;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant("Hatim", "Fakhour", new Credentials("etudiant@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        employeur = new Employeur("Valentin", "Dimitrov", new Credentials("employeur@test.com", "pass", Role.EMPLOYEUR), "CGI Inc.", "514-555-1234");
        offreStage = new OffreStage("Développeur Java", "Stage de dev", "CGI Inc.");
        offreStage.setEmployeur(employeur);
        candidature = new Candidature(etudiant, offreStage);

        convocation = new Convocation(candidature, LocalDateTime.now().plusDays(3), "Bureau Montréal", "Message");
        convocation.setId(1L);
    }

    @Test
    void getConvocationsEtudiant_succes() {
        when(convocationRepository.findByStatutInAndDateHeureBefore(anyList(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(convocationRepository.findByEtudiantEmail("etudiant@test.com"))
                .thenReturn(List.of(convocation));

        List<ConvocationDto> result = convocationService.getConvocationsEtudiant("etudiant@test.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("Bureau Montréal", result.get(0).getLieu());
        assertEquals(StatutConvocation.EN_ATTENTE, result.get(0).getStatut());
    }

    @Test
    void accepterConvocation_succes() {
        when(convocationRepository.findByIdAndEtudiantEmail(1L, "etudiant@test.com"))
                .thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any(Convocation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ConvocationDto dto = convocationService.accepterConvocation(1L, "etudiant@test.com");

        assertNotNull(dto);
        assertEquals(StatutConvocation.ACCEPTEE, dto.getStatut());
        assertEquals(StatutConvocation.ACCEPTEE, convocation.getStatut());

        verify(convocationRepository).save(convocation);
        verify(notificationService).creerNotification(eq(employeur), eq("Convocation acceptée"), anyString(), eq("CONVOCATION_ACCEPTEE"), eq(1L));
        verify(notificationService).creerNotification(eq(etudiant), eq("Entrevue confirmée"), anyString(), eq("CONVOCATION_CONFIRMEE"), eq(1L));
    }

    @Test
    void accepterConvocation_datePassee_lanceException() {
        convocation.setDateHeure(LocalDateTime.now().minusDays(1));
        when(convocationRepository.findByIdAndEtudiantEmail(1L, "etudiant@test.com"))
                .thenReturn(Optional.of(convocation));

        assertThrows(IllegalStateException.class, () ->
                convocationService.accepterConvocation(1L, "etudiant@test.com")
        );

        assertEquals(StatutConvocation.EN_ATTENTE_REPONSE, convocation.getStatut());
        assertEquals(StatutCandidature.EN_ATTENTE_REPONSE, candidature.getStatut());
        verify(convocationRepository).save(convocation);
    }

    @Test
    void refuserConvocation_succes() {
        when(convocationRepository.findByIdAndEtudiantEmail(1L, "etudiant@test.com"))
                .thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any(Convocation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ConvocationDto dto = convocationService.refuserConvocation(1L, "etudiant@test.com", "Pas disponible");

        assertNotNull(dto);
        assertEquals(StatutConvocation.REFUSEE, dto.getStatut());
        assertEquals("Pas disponible", convocation.getMotifEtudiant());
        assertEquals(StatutCandidature.REFUSEE, candidature.getStatut());

        verify(convocationRepository).save(convocation);
        verify(notificationService).creerNotification(eq(employeur), eq("Convocation refusée"), contains("Pas disponible"), eq("CONVOCATION_REFUSEE"), eq(1L));
    }

    @Test
    void proposerAutreDate_succes() {
        LocalDateTime nouvelleDate = LocalDateTime.now().plusDays(5);
        when(convocationRepository.findByIdAndEtudiantEmail(1L, "etudiant@test.com"))
                .thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any(Convocation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ConvocationDto dto = convocationService.proposerAutreDate(1L, "etudiant@test.com", nouvelleDate, "Examen ce jour-là");

        assertNotNull(dto);
        assertEquals(StatutConvocation.CONFLIT_HORAIRE, dto.getStatut());
        assertEquals(nouvelleDate, convocation.getDateProposeeEtudiant());
        assertEquals("Examen ce jour-là", convocation.getMotifEtudiant());

        verify(convocationRepository).save(convocation);
        verify(notificationService).creerNotification(eq(employeur), eq("Conflit d'horaire - Nouvelle date proposée"), contains("Examen ce jour-là"), eq("CONVOCATION_CONFLIT"), eq(1L));
    }

    @Test
    void proposerAutreDate_datePassee_lanceException() {
        LocalDateTime datePassee = LocalDateTime.now().minusDays(1);

        assertThrows(IllegalArgumentException.class, () ->
                convocationService.proposerAutreDate(1L, "etudiant@test.com", datePassee, "Erreur")
        );
        verify(convocationRepository, never()).save(any());
    }

    @Test
    void creerConvocation_succes() {
        LocalDateTime date = LocalDateTime.now().plusDays(4);
        when(candidatureRepository.findById(10L)).thenReturn(Optional.of(candidature));
        when(convocationRepository.save(any(Convocation.class))).thenAnswer(invocation -> {
            Convocation c = invocation.getArgument(0);
            c.setId(99L);
            return c;
        });

        ConvocationDto dto = convocationService.creerConvocation(10L, date, "Virtuel", "Bienvenue", "employeur@test.com");

        assertNotNull(dto);
        assertEquals(99L, dto.getId());
        assertEquals("Virtuel", dto.getLieu());
        assertEquals(StatutConvocation.EN_ATTENTE, dto.getStatut());

        verify(notificationService).creerNotification(eq(etudiant), eq("Nouvelle convocation d'entrevue"), anyString(), eq("CONVOCATION_NOUVELLE"), eq(99L));
    }

    @Test
    void getToutesConvocations_pourGestionnaire() {
        when(convocationRepository.findByStatutInAndDateHeureBefore(anyList(), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(convocationRepository.findAllOrderByDateHeureAsc())
                .thenReturn(List.of(convocation));

        List<ConvocationDto> result = convocationService.getToutesConvocations();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Hatim Fakhour", result.get(0).getEtudiantNomComplet());
        assertEquals("CGI Inc.", result.get(0).getEntreprise());
    }

    @Test
    void verifierEtMettreAJourStatutsPasses_metStatutEnAttenteReponse() {
        Convocation convPassee = new Convocation(candidature, LocalDateTime.now().minusHours(2), "Lieu", "Msg");
        when(convocationRepository.findByStatutInAndDateHeureBefore(anyList(), any(LocalDateTime.class)))
                .thenReturn(List.of(convPassee));

        convocationService.verifierEtMettreAJourStatutsPasses();

        assertEquals(StatutConvocation.EN_ATTENTE_REPONSE, convPassee.getStatut());
        assertEquals(StatutCandidature.EN_ATTENTE_REPONSE, candidature.getStatut());
        verify(convocationRepository).save(convPassee);
    }
}
