package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
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
import java.time.LocalDateTime;
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
                etudiant = new Etudiant("Hatim", "Fakhour", new Credentials("etudiant@test.com", "pass", Role.ETUDIANT),
                                1234567, "Informatique");
                employeur = new Employeur("Valentin", "Dimitrov",
                                new Credentials("employeur@test.com", "pass", Role.EMPLOYEUR), "CGI Inc.",
                                "514-555-1234");
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
                // Arrange
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                when(convocationRepository.save(any(Convocation.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);

                // Act
                ConvocationDto dto = convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(),
                                rendezVousDto);

                // Assert
                assertNotNull(dto);
                assertEquals(StatutConvocation.ACCEPTEE, dto.statut());
                assertEquals(StatutConvocation.ACCEPTEE, convocation.getStatut());

                verify(convocationRepository).save(convocation);
        }

        @Test
        void accepterConvocation_datePassee_lanceException() {
                // Arrange
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MIN);

                RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);

                // Act
                Exception exception = assertThrows(Exception.class, () -> convocationService
                                .accepterConvocation(etudiant.getEmail(), convocation.getId(), rendezVousDto));

                // Assert
                assertNotNull(exception);
                assertEquals(StatutConvocation.EXPIREE, convocation.getStatut());
        }

        @Test
        void refuserConvocation_succes() throws Exception {
                // Arrange
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                when(convocationRepository.save(any(Convocation.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                String raison = "Pas disponible";

                // Act
                ConvocationDto dto = convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(),
                                raison);

                // Assert
                assertNotNull(dto);
                assertEquals(StatutConvocation.REFUSEE, dto.statut());
                assertEquals(raison, convocation.getReponseEtudiant());

                verify(convocationRepository).save(convocation);
        }

        @Test
        void creerConvocation_succes() throws Exception {
                // Arrange
                LocalDateTime date = LocalDateTime.now().plusDays(4);
                when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));
                when(convocationRepository.save(any(Convocation.class))).thenAnswer(invocation -> {
                        Convocation c = invocation.getArgument(0);
                        ReflectionTestUtils.setField(c, "id", 99L);
                        return c;
                });

                List<RendezVousDto> dtos = new ArrayList<>();
                dtos.add(RendezVousDto.create(RendezVous.create("Virtuel", Instant.MAX)));

                // Act
                ConvocationDto dto = convocationService.creerConvocation(employeur.getEmail(), candidature.getId(),
                                dtos, "Bienvenue");

                // Assert
                assertNotNull(dto);
                assertEquals(99L, dto.id());
                assertEquals("Virtuel", dto.rendezVousPossibles().getFirst().lieu());
                assertEquals(StatutConvocation.EN_ATTENTE, dto.statut());
        }

        @Test
        void verifierEtMettreAJourStatutsPasses_appelleRepository() {
                // Act
                convocationService.verifierEtMettreAJourStatutsPasses();

                // Assert
                verify(convocationRepository).expireConvocations(any(Instant.class), eq(StatutConvocation.ANNULEE),
                                eq(StatutConvocation.EN_ATTENTE));
        }

        @Test
        void getConvocationsEtudiant_retourneListe() {
                // Arrange
                when(convocationRepository.findByEtudiantEmail(etudiant.getEmail())).thenReturn(List.of(convocation));

                // Act
                List<ConvocationDto> result = convocationService.getConvocationsEtudiant(etudiant.getEmail());

                // Assert
                assertNotNull(result);
                assertEquals(1, result.size());
        }

        @Test
        void getConvocationsAccepteesEtudiant_retourneListe() {
                // Arrange
                when(convocationRepository.findByEtudiantEmail(etudiant.getEmail())).thenReturn(List.of(convocation));

                // Act
                List<ConvocationDto> result = convocationService.getConvocationsAccepteesEtudiant(etudiant.getEmail());

                // Assert
                assertNotNull(result);
                assertEquals(1, result.size());
        }

        @Test
        void getConvocationsEmployeur_retourneListe() {
                // Arrange
                when(convocationRepository.findByEmployeurEmail(employeur.getEmail())).thenReturn(List.of(convocation));

                // Act
                List<ConvocationDto> result = convocationService.getConvocationsEmployeur(employeur.getEmail());

                // Assert
                assertNotNull(result);
                assertEquals(1, result.size());
        }

        @Test
        void getToutesConvocations_retourneListe() {
                // Arrange
                when(convocationRepository.findAll()).thenReturn(List.of(convocation));

                // Act
                List<ConvocationDto> result = convocationService.getToutesConvocations();

                // Assert
                assertNotNull(result);
                assertEquals(1, result.size());
        }

        @Test
        void creerConvocation_candidatureNonTrouvee_lanceException() {
                // Arrange
                when(candidatureRepository.findById(999L)).thenReturn(Optional.empty());
                List<RendezVousDto> dtos = List.of(RendezVousDto.create(goodRendezVous));

                // Act
                Exception exception = assertThrows(Exception.class,
                                () -> convocationService.creerConvocation(employeur.getEmail(), 999L, dtos, "Message"));

                // Assert
                assertEquals("Candidature non trouvée", exception.getMessage());
        }

        @Test
        void creerConvocation_employeurNonAutorise_lanceException() {
                // Arrange
                when(candidatureRepository.findById(candidature.getId())).thenReturn(Optional.of(candidature));
                List<RendezVousDto> dtos = List.of(RendezVousDto.create(goodRendezVous));

                // Act
                Exception exception = assertThrows(Exception.class, () -> convocationService
                                .creerConvocation("autre@test.com", candidature.getId(), dtos, "Message"));

                // Assert
                assertEquals("Vous n'êtes pas autorisé à convoquer ce candidat", exception.getMessage());
        }

        @Test
        void accepterConvocation_etudiantNonAutorise_lanceException() {
                // Arrange
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);

                // Act
                Exception exception = assertThrows(Exception.class, () -> convocationService
                                .accepterConvocation("autre@test.com", convocation.getId(), rendezVousDto));

                // Assert
                assertEquals("No auth", exception.getMessage());
        }

        @Test
        void refuserConvocation_convocationImmuable_lanceException() {
                // Arrange
                when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                                .thenReturn(Optional.of(convocation));
                ReflectionTestUtils.setField(convocation, "statut", StatutConvocation.ACCEPTEE);

                // Act
                Exception exception = assertThrows(Exception.class, () -> convocationService
                                .refuserConvocation(etudiant.getEmail(), convocation.getId(), "Trop tard"));

                // Assert
                assertEquals("Convocation est immuable", exception.getMessage());
        }
}
