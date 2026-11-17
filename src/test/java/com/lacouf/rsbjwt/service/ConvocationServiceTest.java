package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import com.lacouf.rsbjwt.service.dto.RendezVousDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.ArrayList;
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

    @InjectMocks
    private ConvocationService convocationService;

    private Etudiant etudiant;
    private Employeur employeur;
    private OffreStage offreStage;
    private Candidature candidature;
    private Convocation convocation;
    private RendezVous goodRendezVous;
    private RendezVous badRendezVous;
    private List<RendezVous> rendezVousPossibles;

    @BeforeEach
    void setUp() throws Exception {
        etudiant = new Etudiant("Hatim", "Fakhour", new Credentials("etudiant@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        employeur = new Employeur("Valentin", "Dimitrov", new Credentials("employeur@test.com", "pass", Role.EMPLOYEUR), "CGI Inc.", "514-555-1234");
        offreStage = new OffreStage("Développeur Java", "Stage de dev", "CGI Inc.");
        offreStage.setEmployeur(employeur);
        candidature = new Candidature(etudiant, offreStage);
        ReflectionTestUtils.setField(candidature, "id", 10L);

        rendezVousPossibles = new ArrayList<>();
        goodRendezVous = RendezVous.read("Ici", Instant.MAX);
        rendezVousPossibles.add(goodRendezVous);
        badRendezVous = RendezVous.read("Là-bas", Instant.MIN);
        rendezVousPossibles.add(badRendezVous);

        convocation = new Convocation(rendezVousPossibles, "Message");
        ReflectionTestUtils.setField(convocation, "id", 1L);
        ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MAX);
        candidature.addConvocation(convocation);
    }

    @Test
    void accepterConvocation_succes() throws Exception {
//        ARRANGE
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any(Convocation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

//        ACT
        RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);
        ConvocationDto dto = convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), rendezVousDto);

//        ASSERT
        assertNotNull(dto);
        assertEquals(StatutConvocation.ACCEPTEE, dto.statut());
        assertEquals(StatutConvocation.ACCEPTEE, convocation.getStatut());
        assertEquals(StatutCandidature.ACCEPTEE, convocation.getCandidature().getStatut());

        verify(convocationRepository).save(convocation);
    }

    @Test
    void accepterConvocation_datePassee_lanceException() throws Exception {
//        ARRANGE
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MIN);

//        ACT
        RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);
        assertThrows(Exception.class, () ->
                convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), rendezVousDto)
        );

//        ASSERT
        assertEquals(StatutConvocation.EXPIREE, convocation.getStatut());
    }

    @Test
    void refuserConvocation_succes() throws Exception {
//        ARRANGE
        String raison = "Pas disponible";
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        when(convocationRepository.save(any(Convocation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

//        ACT
        ConvocationDto dto = convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(), raison);

//        ASSERT
        assertNotNull(dto);
        assertEquals(StatutConvocation.REFUSEE, dto.statut());
        assertEquals(raison, convocation.getReponseEtudiant());
        assertEquals(StatutCandidature.EN_ATTENTE, convocation.getCandidature().getStatut());

        verify(convocationRepository).save(convocation);
    }

    @Test
    void refuserConvocation_datePassee_lanceException() throws Exception {
//        ARRANGE
        String raison = "Pas disponible";
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MIN);

//        ACT
        assertThrows(Exception.class, () ->
                convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(), raison)
        );

//        ASSERT
        assertEquals(StatutConvocation.EXPIREE, convocation.getStatut());
    }

    @Test
    void creerConvocation_succes() throws Exception {
//        ARRANGE
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));
        when(convocationRepository.save(any(Convocation.class))).thenAnswer(invocation -> {
            Convocation c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 99L);
            return c;
        });

        List<RendezVousDto> dtos = new ArrayList<>();
        dtos.add(RendezVousDto.create(RendezVous.create("Virtuel", Instant.MAX)));

//        ACT
        ConvocationDto dto = convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), dtos, "Bienvenue");

//        ASSERT
        assertNotNull(dto);
        assertEquals(99L, dto.id());
        assertEquals("Virtuel", dto.rendezVousPossibles().getFirst().lieu());
        assertEquals(StatutConvocation.EN_ATTENTE, dto.statut());

    }

    @Test
    void creerConvocation_quonPossedePas_lanceException() throws Exception {
//        ARRANGE
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));

        List<RendezVousDto> dtos = new ArrayList<>();
        dtos.add(RendezVousDto.create(RendezVous.create("Virtuel", Instant.MAX)));

//        ASSERT
        assertThrows(AuthenticationException.class, () ->
                convocationService.creerConvocation("fakeEmail@test.com", candidature.getId(), dtos, "Bienvenue")
        );
    }

        @Test
        void verifierEtMettreAJourStatutsPasses_shouldExpireConvocations() {
//        ARRANGE
                Instant timestamp = Instant.now();
                when(convocationRepository.expireConvocations(timestamp, StatutConvocation.ANNULEE, StatutConvocation.EN_ATTENTE))
                        .thenReturn(0);

//        ACT
                convocationService.verifierEtMettreAJourStatutsPasses(timestamp);

//        ASSERT
                verify(convocationRepository).expireConvocations(timestamp, StatutConvocation.ANNULEE, StatutConvocation.EN_ATTENTE);
        }

        @Test
        void reconvoquerApresRefus_succes() throws Exception {
//        ARRANGE
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                when(convocationRepository.save(any(Convocation.class)))
                                .thenAnswer(invocation -> {
                                        Convocation c = invocation.getArgument(0);
                                        if (c.getId() == null) {
                                                ReflectionTestUtils.setField(c, "id", 2L);
                                        }
                                        return c;
                                });

//                ACT
                convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(), "Pas dispo le matin");

                assertEquals(StatutCandidature.EN_ATTENTE, candidature.getStatut());
                assertEquals("Pas dispo le matin", candidature.getConvocations().get(0).getReponseEtudiant());

                when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));

                List<RendezVousDto> nouveauxRdv = List.of(RendezVousDto.create(RendezVous.create("En ligne", Instant.MAX)));
                ConvocationDto nouvelleDto = convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), nouveauxRdv, "Nouveaux créneaux");

//                ASSERT
                assertNotNull(nouvelleDto);
                assertEquals(StatutConvocation.EN_ATTENTE, nouvelleDto.statut());
                assertEquals(StatutCandidature.EN_ATTENTE_REPONSE, candidature.getStatut());
                assertEquals(2, candidature.getConvocations().size());
        }

    @Test
    void getConvocationsEtudiant_succes() {
        // Arrange
        when(convocationRepository.findByEtudiantEmail("etudiant@test.com")).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos = convocationService.getConvocationsEtudiant("etudiant@test.com");

        // Assert
        assertEquals(1, dtos.size());
        verify(convocationRepository).findByEtudiantEmail("etudiant@test.com");
    }

    @Test
    void getConvocationsAccepteesEtudiant_succes() {
        // Arrange
        when(convocationRepository.findByEtudiantEmail("etudiant@test.com")).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos = convocationService.getConvocationsAccepteesEtudiant("etudiant@test.com");

        // Assert
        assertEquals(1, dtos.size());
        verify(convocationRepository).findByEtudiantEmail("etudiant@test.com");
    }

    @Test
    void getConvocationsEmployeur_sansAnnee() {
        // Arrange
        when(convocationRepository.findByEmployeurEmail("employeur@test.com")).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos = convocationService.getConvocationsEmployeur("employeur@test.com");

        // Assert
        assertEquals(1, dtos.size());
        verify(convocationRepository).findByEmployeurEmail("employeur@test.com");
    }

    @Test
    void getConvocationsEmployeur_avecAnnee_filtreCorrectement() {
        // Arrange
        offreStage.setAnnee(2026);
        when(convocationRepository.findByEmployeurEmail("employeur@test.com")).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos2026 = convocationService.getConvocationsEmployeur("employeur@test.com", 2026);
        List<ConvocationDto> dtos2025 = convocationService.getConvocationsEmployeur("employeur@test.com", 2025);

        // Assert
        assertEquals(1, dtos2026.size());
        assertTrue(dtos2025.isEmpty());
    }

    @Test
    void getToutesConvocations_sansAnnee() {
        // Arrange
        when(convocationRepository.findAll()).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos = convocationService.getToutesConvocations();

        // Assert
        assertEquals(1, dtos.size());
        verify(convocationRepository).findAll();
    }

    @Test
    void getToutesConvocations_avecAnnee_filtreCorrectement() {
        // Arrange
        offreStage.setAnnee(2026);
        when(convocationRepository.findAll()).thenReturn(List.of(convocation));

        // Act
        List<ConvocationDto> dtos2026 = convocationService.getToutesConvocations(2026);
        List<ConvocationDto> dtos2025 = convocationService.getToutesConvocations(2025);

        // Assert
        assertEquals(1, dtos2026.size());
        assertTrue(dtos2025.isEmpty());
    }

    @Test
    void creerConvocation_candidatureNonTrouvee_lanceException() {
        // Arrange
        when(candidatureRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.creerConvocation("employeur@test.com", 99L, List.of(), "msg")
        );
        assertTrue(e.getMessage().toLowerCase().contains("candidature") && e.getMessage().toLowerCase().contains("trouv"));
    }

    @Test
    void creerConvocation_listeRendezVousVide_lanceException() {
        // Arrange
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), List.of(), "msg")
        );
        assertTrue(e.getMessage().contains("La liste des rendez-vous doit contenir au moins un element"));
    }

    @Test
    void creerConvocation_listeRendezVousNulle_lanceException() {
        // Arrange
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), null, "msg")
        );
        assertTrue(e.getMessage().contains("La liste des rendez-vous doit contenir au moins un element"));
    }

    @Test
    void creerConvocation_lieuInvalide_lanceException() {
        // Arrange
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));
        List<RendezVousDto> dtos = List.of(new RendezVousDto(Instant.MAX, ""));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), dtos, "msg")
        );
        assertTrue(e.getMessage().toLowerCase().contains("lieu"));
    }

    @Test
    void creerConvocation_datePassee_lanceException() {
        // Arrange
        when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));
        List<RendezVousDto> dtos = List.of(new RendezVousDto(Instant.MIN, "Bureau"));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.creerConvocation(employeur.getEmail(), candidature.getId(), dtos, "msg")
        );
        assertTrue(e.getMessage().toLowerCase().contains("date") && e.getMessage().toLowerCase().contains("futur"));
    }

    @Test
    void accepterConvocation_convocationNonTrouvee_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.accepterConvocation("etudiant@test.com", 99L, RendezVousDto.create(goodRendezVous))
        );
        assertTrue(e.getMessage().toLowerCase().contains("convocation") && e.getMessage().toLowerCase().contains("trouv"));
    }

    @Test
    void accepterConvocation_nonDestineeAEtudiant_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));

        // Act & Assert
        assertThrows(AuthenticationException.class, () ->
                convocationService.accepterConvocation("autre@test.com", convocation.getId(), RendezVousDto.create(goodRendezVous))
        );
    }

    @Test
    void accepterConvocation_dejaResolue_lanceException() {
        // Arrange
        ReflectionTestUtils.setField(convocation, "statut", StatutConvocation.ACCEPTEE);
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), RendezVousDto.create(goodRendezVous))
        );
        assertTrue(e.getMessage().contains("La convocation est deja resolue"));
    }

    @Test
    void accepterConvocation_rendezVousNul_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), null)
        );
        assertTrue(e.getMessage().contains("Le rendez-vous selectionne n'est pas disponible"));
    }

    @Test
    void accepterConvocation_rendezVousNonDansListe_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));
        RendezVousDto inconnu = new RendezVousDto(Instant.MAX, "Mars");

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), inconnu)
        );
        assertTrue(e.getMessage().contains("Le rendez-vous selectionne n'est pas disponible"));
    }

    @Test
    void refuserConvocation_convocationNonTrouvee_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.refuserConvocation("etudiant@test.com", 99L, "motif")
        );
        assertTrue(e.getMessage().toLowerCase().contains("convocation") && e.getMessage().toLowerCase().contains("trouv"));
    }

    @Test
    void refuserConvocation_nonDestineeAEtudiant_lanceException() {
        // Arrange
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.refuserConvocation("autre@test.com", convocation.getId(), "motif")
        );
        assertTrue(e.getMessage().contains("Non autorise"));
    }

    @Test
    void refuserConvocation_dejaResolue_lanceException() {
        // Arrange
        ReflectionTestUtils.setField(convocation, "statut", StatutConvocation.REFUSEE);
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId())).thenReturn(Optional.of(convocation));

        // Act & Assert
        Exception e = assertThrows(Exception.class, () ->
                convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(), "motif")
        );
        assertTrue(e.getMessage().contains("La convocation est deja resolue"));
    }
}