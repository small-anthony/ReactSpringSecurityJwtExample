package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CandidatureDtoTest {

    private static final Instant DATE_UN = Instant.parse("2026-11-12T19:00:00Z");
    private static final Instant DATE_DEUX = Instant.parse("2026-11-13T15:30:00Z");

    private Candidature candidature;

    @BeforeEach
    void preparer() {
        Credentials credentials = new Credentials("etudiant@test.com", "password123", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Sophie", "Martin", credentials, 123456, "info");
        etudiant.setId(2L);
        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        candidature = new Candidature(etudiant, offre);
        ReflectionTestUtils.setField(candidature, "id", 100L);
    }

    private Convocation creerConvocation(Long id, List<RendezVous> rendezVous, String message) throws Exception {
        Convocation convocation = new Convocation(rendezVous, message);
        ReflectionTestUtils.setField(convocation, "id", id);
        return convocation;
    }

    @Test
    void create_sansConvocation_convocationNulle() {
        CandidatureDto dto = CandidatureDto.create(candidature);

        assertNull(dto.convocation());
    }

    @Test
    void create_convocationEnAttente_exposeLesRendezVousPossibles() throws Exception {
        Convocation convocation = creerConvocation(1L,
                List.of(RendezVous.create("En ligne - Teams", DATE_UN),
                        RendezVous.create("Bureau CGI", DATE_DEUX)),
                "Choisissez un créneau");
        candidature.addConvocation(convocation);

        CandidatureDto dto = CandidatureDto.create(candidature);

        assertNotNull(dto.convocation());
        assertEquals(1L, dto.convocation().id());
        assertEquals(StatutConvocation.EN_ATTENTE, dto.convocation().statut());
        assertEquals("Choisissez un créneau", dto.convocation().messageEmployeur());
        assertEquals(2, dto.convocation().rendezVousPossibles().size());
        assertEquals("En ligne - Teams", dto.convocation().rendezVousPossibles().get(0).lieu());
        assertEquals(DATE_UN, dto.convocation().rendezVousPossibles().get(0).date());
        assertNull(dto.convocation().rendezVousSelection());
        assertNotNull(dto.convocation().dateLimite());
    }

    @Test
    void create_convocationAcceptee_exposeLeRendezVousChoisi() throws Exception {
        RendezVous choisi = RendezVous.create("Bureau CGI", DATE_DEUX);
        Convocation convocation = creerConvocation(1L,
                List.of(RendezVous.create("En ligne - Teams", DATE_UN), choisi),
                "Choisissez un créneau");
        candidature.addConvocation(convocation);
        convocation.accepter(choisi, "Merci");

        CandidatureDto dto = CandidatureDto.create(candidature);

        assertEquals(StatutConvocation.ACCEPTEE, dto.convocation().statut());
        assertNotNull(dto.convocation().rendezVousSelection());
        assertEquals("Bureau CGI", dto.convocation().rendezVousSelection().lieu());
        assertEquals(DATE_DEUX, dto.convocation().rendezVousSelection().date());
    }

    @Test
    void create_plusieursConvocations_exposeLaPlusRecenteSansAncienRefus() throws Exception {
        Convocation premiere = creerConvocation(1L,
                List.of(RendezVous.create("En ligne - Teams", DATE_UN)), "Première");
        candidature.addConvocation(premiere);
        premiere.refuser("Indisponible");
        Convocation deuxieme = creerConvocation(2L,
                List.of(RendezVous.create("Bureau CGI", DATE_DEUX)), "Deuxième");
        candidature.addConvocation(deuxieme);

        CandidatureDto dto = CandidatureDto.create(candidature);

        assertEquals(2L, dto.convocation().id());
        assertEquals("Deuxième", dto.convocation().messageEmployeur());
        assertEquals(StatutConvocation.EN_ATTENTE, dto.convocation().statut());
        assertNull(dto.messageRefusConvocation());
    }

    @Test
    void create_derniereConvocationRefusee_exposeLeMotifDeRefus() throws Exception {
        Convocation convocation = creerConvocation(1L,
                List.of(RendezVous.create("Bureau CGI", DATE_UN)), "Première");
        candidature.addConvocation(convocation);
        convocation.refuser("Pas disponible");

        CandidatureDto dto = CandidatureDto.create(candidature);

        assertEquals("Pas disponible", dto.messageRefusConvocation());
    }
}