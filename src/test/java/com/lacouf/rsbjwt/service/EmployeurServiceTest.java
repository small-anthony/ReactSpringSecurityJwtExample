package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.HistoriqueCandidature;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.HistoriqueCandidatureRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.HistoriqueCandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
    @Mock
    private HistoriqueCandidatureRepository historiqueRepository;
    @InjectMocks
    private EmployeurService employeurService;

	private Employeur preparerEmployeur(String email) {
		UserApp userMock = mock(UserApp.class);
		when(userMock.getId()).thenReturn(1L);
		when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

		Credentials credentials = new Credentials(email, "password123", Role.EMPLOYEUR);
		Employeur employeur = new Employeur("Jean", "Tremblay", credentials, "CGI", "514-555-1234");
		employeur.setId(1L);
		when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));
		return employeur;
	}

	private Candidature creerCandidature(Long id) {
		Credentials credentialsEtudiant = new Credentials("etudiant@test.com", "password123", Role.ETUDIANT);
		Etudiant etudiant = new Etudiant("Sophie", "Martin", credentialsEtudiant, 123456, "info");
		etudiant.setId(2L);
		OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
		Candidature candidature = new Candidature(etudiant, offre);
		ReflectionTestUtils.setField(candidature, "id", id);
		return candidature;
	}

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

    @Test
    void refuserCandidature_avecMessage_enregistreLeMessageSansEspaces() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        //ACT
        CandidatureDto resultat = employeurService.refuserCandidature(100L, "  Profil non retenu  ", email);

        //ASSERT
        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertEquals("Profil non retenu", resultat.messageReponse());

        ArgumentCaptor<HistoriqueCandidature> captor = ArgumentCaptor.forClass(HistoriqueCandidature.class);
        verify(historiqueRepository).save(captor.capture());
        assertEquals(StatutCandidature.REFUSEE, captor.getValue().getNouveauStatut());
        assertEquals("Profil non retenu", captor.getValue().getMessage());
    }

    @Test
    void refuserCandidature_messageNul_enregistreSansMessage() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        //ACT
        CandidatureDto resultat = employeurService.refuserCandidature(100L, null, email);

        //ASSERT
        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertNull(resultat.messageReponse());
    }

    @Test
    void refuserCandidature_messageVide_enregistreSansMessage() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        //ACT
        CandidatureDto resultat = employeurService.refuserCandidature(100L, "   ", email);

        //ASSERT
        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertNull(resultat.messageReponse());
    }

    @Test
    void refuserCandidature_candidatureDunAutreEmployeur_lanceException() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(99L, employeur)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.refuserCandidature(99L, "Message", email));

        //ASSERT
        assertEquals("Candidature introuvable pour cet employeur", exception.getMessage());
        verify(historiqueRepository, never()).save(any(HistoriqueCandidature.class));
    }

    @Test
    void refuserCandidature_conventionEnAttenteReponse_refuseEtEnregistreLHistorique() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.refuserCandidature(100L, "Désistement", email);

        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        ArgumentCaptor<HistoriqueCandidature> captor = ArgumentCaptor.forClass(HistoriqueCandidature.class);
        verify(historiqueRepository).save(captor.capture());
        assertEquals(StatutCandidature.REFUSEE, captor.getValue().getNouveauStatut());
    }

    @Test
    void refuserCandidature_apresEntrevueAcceptee_refuseLaCandidature() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.ACCEPTEE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.refuserCandidature(100L, "Profil non retenu après l'entrevue", email);

        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertEquals("Profil non retenu après l'entrevue", resultat.messageReponse());
        verify(historiqueRepository).save(any(HistoriqueCandidature.class));
    }

    @Test
    void refuserCandidature_dejaEmbauchee_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EMBAUCHEE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.refuserCandidature(100L, "Message", email));

        assertEquals("Cette candidature a déjà reçu une réponse", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
        verify(historiqueRepository, never()).save(any(HistoriqueCandidature.class));
    }

    @Test
    void embaucherCandidature_entrevueAcceptee_embaucheEtEnregistreLHistorique() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.ACCEPTEE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.embaucherCandidature(100L, email);

        assertEquals(StatutCandidature.EMBAUCHEE, resultat.statut());
        assertNull(resultat.messageReponse());

        ArgumentCaptor<HistoriqueCandidature> captor = ArgumentCaptor.forClass(HistoriqueCandidature.class);
        verify(historiqueRepository).save(captor.capture());
        assertEquals(StatutCandidature.EMBAUCHEE, captor.getValue().getNouveauStatut());
        assertNull(captor.getValue().getMessage());
    }

    @Test
    void embaucherCandidature_sansEntrevueAcceptee_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(100L, email));

        assertEquals("L'entrevue doit être confirmée par l'étudiant avant l'embauche", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
        verify(historiqueRepository, never()).save(any(HistoriqueCandidature.class));
    }

    @Test
    void embaucherCandidature_candidatureEnAttente_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(100L, email));

        assertEquals("L'entrevue doit être confirmée par l'étudiant avant l'embauche", exception.getMessage());
    }

    @Test
    void embaucherCandidature_dejaEmbauchee_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EMBAUCHEE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(100L, email));

        assertEquals("L'entrevue doit être confirmée par l'étudiant avant l'embauche", exception.getMessage());
        verify(historiqueRepository, never()).save(any(HistoriqueCandidature.class));
    }

    @Test
    void embaucherCandidature_candidatureDunAutreEmployeur_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(99L, employeur)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(99L, email));

        assertEquals("Candidature introuvable pour cet employeur", exception.getMessage());
        verify(historiqueRepository, never()).save(any(HistoriqueCandidature.class));
    }

    @Test
    void getHistorique_avecDecisions_retourneLaListe() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Candidature candidature = creerCandidature(100L);
        HistoriqueCandidature historique = new HistoriqueCandidature(
                candidature, StatutCandidature.EN_ATTENTE, StatutCandidature.REFUSEE, "Profil non retenu", email);
        when(historiqueRepository.findByAuteurEmailOrderByDateDecisionDesc(email)).thenReturn(List.of(historique));

        //ACT
        List<HistoriqueCandidatureDto> resultat = employeurService.getHistorique(email);

        //ASSERT
        assertEquals(1, resultat.size());
        HistoriqueCandidatureDto dto = resultat.get(0);
        assertEquals(100L, dto.candidatureId());
        assertEquals("Sophie Martin", dto.etudiantNom());
        assertEquals("Stagiaire en informatique", dto.titreOffre());
        assertEquals(StatutCandidature.EN_ATTENTE, dto.ancienStatut());
        assertEquals(StatutCandidature.REFUSEE, dto.nouveauStatut());
        assertEquals("Profil non retenu", dto.message());
    }

    @Test
    void getHistorique_sansDecision_retourneUneListeVide() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        when(historiqueRepository.findByAuteurEmailOrderByDateDecisionDesc(email)).thenReturn(List.of());

        //ACT
        List<HistoriqueCandidatureDto> resultat = employeurService.getHistorique(email);

        //ASSERT
        assertTrue(resultat.isEmpty());
    }

    @Test
    void deleteOffre_avecOffreValide_supprimeLOffre() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));

        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        offre.setId(10L);

        when(offreStageRepository.findByIdAndEmployeur(10L, employeur)).thenReturn(Optional.of(offre));

        //ACT & ASSERT
        assertDoesNotThrow(() -> employeurService.deleteOffre(10L, email));
    }

    @Test
    void deleteOffre_avecOffreDunAutreEmployeur_lanceException() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));
        when(offreStageRepository.findByIdAndEmployeur(99L, employeur)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.deleteOffre(99L, email));

        // ASSERT
        assertEquals("Offre introuvable pour cet employeur", exception.getMessage());
    }
    @Test
    void deleteOffre_employeurIntrouvable_lanceException() {
        //ARRANGE
        String emailInexistant = "inconnu@entreprise.com";

        when(userAppRepository.findUserAppByEmail(emailInexistant)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.deleteOffre(10L, emailInexistant));

        //ASSERT
        assertEquals("Employeur non trouvé", exception.getMessage());
    }

    @Test
    void updateOffreStage_avecOffreValide_retourneOffreModifiee() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));

        OffreStage offre = new OffreStage("Ancien titre", "Ancienne description", "CGI");
        offre.setId(10L);
        offre.accepter();

        when(offreStageRepository.findByIdAndEmployeur(10L, employeur)).thenReturn(Optional.of(offre));
        when(offreStageRepository.save(any(OffreStage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        //ACT
        OffreStageDto resultat = employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI",
                "Développement d'applications web avec Spring Boot et React", "info", "16 semaines",
                "25$/h", "Connaissances en Java et React", email);

        //ASSERT
        assertNotNull(resultat);
        assertEquals(10, resultat.id());
        assertEquals("Stagiaire en informatique", resultat.titre());
        assertEquals("Développement d'applications web avec Spring Boot et React", resultat.description());
        assertEquals("info", resultat.discipline());
        assertEquals("16 semaines", resultat.duree());
        assertEquals("25$/h", resultat.salaire());
        assertEquals("Connaissances en Java et React", resultat.exigences());
        assertEquals(StatusAcceptation.EN_ATTENTE, resultat.status());
    }

    @Test
    void updateOffreStage_titreVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "", "CGI", "Description valide", "info", "16 semaines",
                        "25$/h", "Java", "employeur@entreprise.com"));

        //ASSERT
        assertEquals("Le titre est obligatoire", exception.getMessage());
    }
    @Test
    void updateOffreStage_nomEntrepriseVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "Stagiaire en informatique", "", "Description valide", "info",
                        "16 semaines", "25$/h", "Java", "employeur@entreprise.com"));

        //ASSERT
        assertEquals("Le nom de l'entreprise est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_descriptionVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "Stagiaire en informatique", "CGI", "", "info",
                        "16 semaines", "25$/h", "Java", "employeur@entreprise.com"));

        //ASSERT
        assertEquals("La description est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_employeurIntrouvable_lanceException() {
        //ARRANGE
        String emailInexistant = "inconnu@entreprise.com";

        when(userAppRepository.findUserAppByEmail(emailInexistant)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info",
                        "16 semaines", "25$/h", "Java", emailInexistant));

        //ASSERT
        assertEquals("Employeur non trouvé", exception.getMessage());
    }

    @Test
    void updateOffreStage_avecOffreDunAutreEmployeur_lanceException() {
        //ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));
        when(offreStageRepository.findByIdAndEmployeur(99L, employeur)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(99L, "Stagiaire en informatique", "CGI", "Description valide", "info",
                        "16 semaines", "25$/h", "Java", email));

        //ASSERT
        assertEquals("Offre introuvable pour cet employeur", exception.getMessage());
    }
}