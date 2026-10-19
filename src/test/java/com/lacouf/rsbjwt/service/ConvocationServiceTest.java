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
import com.lacouf.rsbjwt.service.schedulers.ConvocationScheduler;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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
    void setUp() {
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
    void accepterConvocation_succes() {
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
    void accepterConvocation_datePassee_lanceException() {
//        ARRANGE
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MIN);

//        ACT
        RendezVousDto rendezVousDto = RendezVousDto.create(goodRendezVous);
        assertThrows(IllegalStateException.class, () ->
                convocationService.accepterConvocation(etudiant.getEmail(), convocation.getId(), rendezVousDto)
        );

//        ASSERT
        assertEquals(StatutConvocation.EXPIREE, convocation.getStatut());
    }

    @Test
    void refuserConvocation_succes() {
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

        verify(convocationRepository).save(convocation);
    }

    @Test
    void refuserConvocation_datePassee_lanceException() {
//        ARRANGE
        String raison = "Pas disponible";
        when(convocationRepository.findWithEmployeurAndEtudiantById(convocation.getId()))
                .thenReturn(Optional.of(convocation));
        ReflectionTestUtils.setField(convocation, "dateLimite", Instant.MIN);

//        ACT
        assertThrows(IllegalStateException.class, () ->
                convocationService.refuserConvocation(etudiant.getEmail(), convocation.getId(), raison)
        );

//        ASSERT
        assertEquals(StatutConvocation.EXPIREE, convocation.getStatut());
    }

    @Test
    void creerConvocation_succes() {
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
    void creerConvocation_quonPossedePas_lanceException() {
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
        when(convocationRepository.expireConvocations(Instant.now(), StatutConvocation.ANNULEE, StatutConvocation.EN_ATTENTE))
                .thenReturn(0);

//        ACT
        convocationService.verifierEtMettreAJourStatutsPasses(timestamp);

//        ASSERT
        verify(convocationRepository).expireConvocations(timestamp, StatutConvocation.ANNULEE, StatutConvocation.EN_ATTENTE);
    }
}
