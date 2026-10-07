package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmployeurServiceTest {
    @Mock
    private UserAppRepository userAppRepository;
    @Mock
    private EmployeurRepository employeurRepository;
    @Mock
    private OffreStageRepository offreStageRepository;
    @Mock
    private CandidatureRepository candidatureRepository;
    @InjectMocks
    private EmployeurService employeurService;

    @Test
    void testCreerOffre_succes() throws Exception {
        // ARRANGE
        String email = "employeur@entreprise.com";
        String titre = "Stagiaire en informatique";
        String nomEntreprise = "CGI";
        String description = "Développement d'applications web avec Spring Boot et React";
        String discipline = "info";
        String salaire = "25$/h";
        String duree = "16 semaines";
        String exigences = "Connaissances en Java et React";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentials = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentials, nomEntreprise, "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        OffreStage offreEnregistree = new OffreStage(titre, description, nomEntreprise, discipline, salaire, duree,
                exigences);
        offreEnregistree.setId(1L);
        offreEnregistree.setEmployeur(employeur);
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offreEnregistree);

        // ACT
        OffreStageDto resultat = employeurService.createOffreStage(titre, nomEntreprise, description, discipline, duree,
                salaire, exigences, email);

        // ASSERT
        assertNotNull(resultat);
        assertEquals(1, resultat.id());
        assertEquals(titre, resultat.titre());
        assertEquals(nomEntreprise, resultat.nomEntreprise());
        assertEquals(description, resultat.description());
        assertEquals(discipline, resultat.discipline());
    }

    @Test
    void testCreerOffre_titreVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class,
                () -> employeurService.createOffreStage("", "CGI", "Description valide", "employeur@entreprise.com"));

        // Assert
        assertEquals("Le titre est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_nomEntrepriseVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .createOffreStage("Stagiaire en informatique", "", "Description valide", "employeur@entreprise.com"));

        // ASSERT
        assertEquals("Le nom de l'entreprise est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_descriptionVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .createOffreStage("Stagiaire en informatique", "CGI", "", "employeur@entreprise.com"));

        // ASSERT
        assertEquals("La description est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_emailVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class,
                () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", ""));

        // ASSERT
        assertEquals("Le courriel de l'employeur est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_utilisateurIntrouvable_lanceException() {
        // ARRANGE
        String emailInexistant = "inconnu@entreprise.com";
        when(userAppRepository.findUserAppByEmail(emailInexistant)).thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .createOffreStage("Stagiaire en informatique", "CGI", "Description", emailInexistant));

        // Assert
        assertEquals("Utilisateur non trouvé avec l'email : " + emailInexistant, exception.getMessage());
    }

    @Test
    void testCreerOffre_employeurIntrouvable_lanceException() {
        // ARRANGE
        String email = "utilisateur@entreprise.com";
        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(99L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));
        when(employeurRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class,
                () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description", email));

        // ASSeRT
        assertEquals("Employeur non trouvé avec cette id", exception.getMessage());
    }

    @Test
    void getCandidatures_avecOffreValide_retourneLaListe() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        offre.setId(10L);
        when(offreStageRepository.findByIdAndEmployeur(10L, employeur)).thenReturn(Optional.of(offre));

        Credentials credentialsEtudiant = new Credentials("etudiant@test.com", "password123", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Sophie", "Martin", credentialsEtudiant, 123456, "Informatique");
        etudiant.setId(2L);
        Candidature candidature = new Candidature(etudiant, offre);
        ReflectionTestUtils.setField(candidature, "id", 100L);
        when(candidatureRepository.findByOffreStage(offre)).thenReturn(List.of(candidature));

        //ACT
        List<CandidatureDto> resultat = employeurService.getCandidatures(10L, email);

        //ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Sophie", resultat.get(0).etudiant().firstName());
    }

    @Test
    void getCandidatures_avecOffreDunAutreEmployeur_lanceException() {
        //ARRANGE
        String email = "employeur@entreprise.com";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        when(offreStageRepository.findByIdAndEmployeur(99L, employeur)).thenReturn(Optional.empty());


        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.getCandidatures(99L, email));

        //ASSERT
        assertEquals("Offre introuvable pour cet employeur", exception.getMessage());
    }

    @Test
    void getCvCandidat_avecCandidatureValide_retourneLesDonneesDuCv() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        Credentials credentialsEtudiant = new Credentials("etudiant@test.com", "password123", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Sophie", "Martin", credentialsEtudiant, 123456, "Informatique");
        etudiant.setCv(new byte[] { 1, 2, 3 });

        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        Candidature candidature = new Candidature(etudiant, offre);
        ReflectionTestUtils.setField(candidature, "id", 100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        //ACT
        byte[] resultat = employeurService.getCvCandidat(100L, email);

        //ASSERT
        assertArrayEquals(new byte[] { 1, 2, 3 }, resultat);
    }

    @Test
    void getCvCandidat_sansCv_lanceException() {
        //ARRANGE
        String email = "employeur@entreprise.com";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        Credentials credentialsEtudiant = new Credentials("etudiant@test.com", "password123", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Sophie", "Martin", credentialsEtudiant, 123456, "Informatique");

        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        Candidature candidature = new Candidature(etudiant, offre);
        ReflectionTestUtils.setField(candidature, "id", 100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.getCvCandidat(100L, email));

        //ASSERT
        assertEquals("Aucun CV disponible pour ce candidat", exception.getMessage());
    }


}