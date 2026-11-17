package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProfesseurServiceTest {

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private ProfesseurService professeurService;

    @Test
    void getEtudiantsAssignes_succesSansAnnee() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        OffreStage offre = new OffreStage("Dev Web", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        offre.setId(1L);
        Candidature cand = new Candidature(etudiant, offre);
        cand.setId(1L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findByProfesseurId(10L)).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantSuperviseDto> resultat = professeurService.getEtudiantsAssignes("martin@test.com", null);

        // Assert
        assertNotNull(resultat);
        assertEquals(1, resultat.size());
        assertEquals("Sophie", resultat.getFirst().firstName());
        assertEquals("EMBAUCHEE", resultat.getFirst().statutStage());
        assertEquals("CGI", resultat.getFirst().entrepriseStage());
    }

    @Test
    void getEtudiantsAssignes_succesAvecAnnee() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        OffreStage offre2026 = new OffreStage("Dev Web", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        offre2026.setId(1L);
        Candidature cand = new Candidature(etudiant, offre2026);
        cand.setId(1L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findByProfesseurId(10L)).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantSuperviseDto> resultat = professeurService.getEtudiantsAssignes("martin@test.com", 2026);

        // Assert
        assertNotNull(resultat);
        assertEquals(1, resultat.size());
        assertEquals("EMBAUCHEE", resultat.getFirst().statutStage());
    }

    @Test
    void getEtudiantsAssignes_professeurNonTrouve_lanceException() {
        // Arrange
        when(professeurRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantsAssignes("inconnu@test.com", null)
        );

        assertTrue(exception.getMessage().contains("Professeur introuvable"));
    }

    @Test
    void getEtudiantDetail_succes() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        // Act
        EtudiantSuperviseDto resultat = professeurService.getEtudiantDetail(1L, "martin@test.com");

        // Assert
        assertNotNull(resultat);
        assertEquals(1L, resultat.id());
        assertEquals("Sophie", resultat.firstName());
    }

    @Test
    void getEtudiantDetail_professeurNonTrouve_lanceException() {
        // Arrange
        when(professeurRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(1L, "inconnu@test.com")
        );

        assertTrue(exception.getMessage().contains("Professeur introuvable"));
    }

    @Test
    void getEtudiantDetail_etudiantNonTrouve_lanceException() {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(99L, "martin@test.com")
        );

        assertTrue(exception.getMessage().contains("Étudiant introuvable"));
    }

    @Test
    void getEtudiantDetail_etudiantNonAssigneACeProfesseur_lanceException() {
        // Arrange
        Professeur prof1 = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof1.setId(10L);

        Professeur prof2 = new Professeur("Chantal", "Gagnon", new Credentials("chantal@test.com", "pass", Role.PROFESSEUR));
        prof2.setId(20L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof2);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof1));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(1L, "martin@test.com")
        );

        assertTrue(exception.getMessage().contains("Cet étudiant n'est pas assigné à ce professeur"));
    }
}
