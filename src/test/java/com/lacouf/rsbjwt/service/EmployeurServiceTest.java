package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationType;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeurServiceTest {

    private static final String ADRESSE = "1350 boulevard René-Lévesque Ouest, Montréal, QC";
    private static final String VILLE = "Montréal";
    private static final String CODE_POSTAL = "H3G 1T4";
    private static final String TELEPHONE = "514-555-1234";
    private static final int ANNEE_COURANTE = AcademicSessionUtils.getAnneeActuelle();
    private static final LocalDate DATE_DEBUT = LocalDate.of(ANNEE_COURANTE, 3, 2);
    private static final LocalDate DATE_FIN = LocalDate.of(ANNEE_COURANTE, 5, 22);
    @Mock
    private UserAppRepository userAppRepository;
    @Mock
    private EmployeurRepository employeurRepository;
    @Mock
    private OffreStageRepository offreStageRepository;
    @Mock
    private CandidatureRepository candidatureRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private GestionnaireRepository gestionnaireRepository;
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
        String exigences = "Connaissances en Java et React";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentials = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentials, nomEntreprise, "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        OffreStage offreEnregistree = new OffreStage(titre, description, nomEntreprise, discipline, salaire,
                exigences);
        offreEnregistree.setAdresse(ADRESSE);
        offreEnregistree.setVille(VILLE);
        offreEnregistree.setCodePostal(CODE_POSTAL);
        offreEnregistree.setTelephone(TELEPHONE);
        offreEnregistree.setDateDebut(DATE_DEBUT);
        offreEnregistree.setDateFin(DATE_FIN);
        offreEnregistree.setId(1L);
        offreEnregistree.setEmployeur(employeur);
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offreEnregistree);

        // ACT
        OffreStageDto resultat = employeurService.createOffreStage(titre, nomEntreprise, description, discipline,
                salaire, exigences, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, null, DATE_DEBUT, DATE_FIN);

        // ASSERT
        assertNotNull(resultat);
        assertEquals(1, resultat.id());
        assertEquals(titre, resultat.titre());
        assertEquals(nomEntreprise, resultat.nomEntreprise());
        assertEquals(description, resultat.description());
        assertEquals(discipline, resultat.discipline());
        assertEquals(ADRESSE, resultat.adresse());
        assertEquals(VILLE, resultat.ville());
        assertEquals(CODE_POSTAL, resultat.codePostal());
        assertEquals(TELEPHONE, resultat.telephone());
        assertEquals(DATE_DEBUT, resultat.dateDebut());
        assertEquals(DATE_FIN, resultat.dateFin());
    }

    @Test
    void testCreerOffre_titreVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class,
                () -> employeurService.createOffreStage("", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        // Assert
        assertEquals("Le titre est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_nomEntrepriseVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .createOffreStage("Stagiaire en informatique", "", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        // ASSERT
        assertEquals("Le nom de l'entreprise est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_descriptionVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .createOffreStage("Stagiaire en informatique", "CGI", "", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        // ASSERT
        assertEquals("La description est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_emailVide_lanceException() {
        // ACT
        Exception exception = assertThrows(Exception.class,
                () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "", null, DATE_DEBUT, DATE_FIN));

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
                .createOffreStage("Stagiaire en informatique", "CGI", "Description", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, emailInexistant, null, DATE_DEBUT, DATE_FIN));

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
                () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description", null, null, null, ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, null, DATE_DEBUT, DATE_FIN));

        // ASSeRT
        assertEquals("Employeur non trouvé avec cette id", exception.getMessage());
    }

    @Test
    void getOffres_retourneLesOffresDeLaPlusRecenteALaPlusAncienne() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);

        OffreStage ancienne = new OffreStage("Ancienne offre", "Description", "CGI");
        ancienne.setId(1L);
        OffreStage recente = new OffreStage("Offre récente", "Description", "CGI");
        recente.setId(2L);
        when(offreStageRepository.findWithCandidaturesByEmployeur(employeur))
                .thenReturn(List.of(ancienne, recente));

        List<OffreStageDto> resultat = employeurService.getOffres(email);

        assertEquals(2, resultat.size());
        assertEquals("Offre récente", resultat.get(0).titre());
        assertEquals("Ancienne offre", resultat.get(1).titre());
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
        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(10L, employeur)).thenReturn(Optional.of(offre));

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

        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(99L, employeur)).thenReturn(Optional.empty());

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
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void refuserCandidature_conventionEnAttenteReponse_refuseLaCandidature() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.refuserCandidature(100L, "Désistement", email);

        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertEquals("Désistement", resultat.messageReponse());
    }

    @Test
    void refuserCandidature_apresEntrevueAcceptee_refuseLaCandidature() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_ENTREVUE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.refuserCandidature(100L, "Profil non retenu après l'entrevue", email);

        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertEquals("Profil non retenu après l'entrevue", resultat.messageReponse());
    }

    @Test
    void refuserCandidature_enAttenteChoixStage_refuseLaCandidature() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.refuserCandidature(100L, "Poste comblé entre-temps", email);

        assertEquals(StatutCandidature.REFUSEE, resultat.statut());
        assertEquals("Poste comblé entre-temps", resultat.messageReponse());
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
    }

    @Test
    void embaucherCandidature_entrevueAcceptee_embaucheLaCandidature() throws Exception {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_ENTREVUE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = employeurService.embaucherCandidature(100L, email);

        assertEquals(StatutCandidature.EN_ATTENTE_CHOIX_STAGE, resultat.statut());
        assertNull(resultat.messageReponse());
    }

    @Test
    void embaucherCandidature_neGenerePasContratEtNotifieEtudiant() throws Exception {
        ContratService mockContratService = mock(ContratService.class);
        EmployeurService serviceAvecContrat = new EmployeurService(
                userAppRepository, employeurRepository, offreStageRepository, candidatureRepository,
                notificationService, gestionnaireRepository, mockContratService);

        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.getEtudiant().setId(55L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_ENTREVUE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(inv -> inv.getArgument(0));

        CandidatureDto resultat = serviceAvecContrat.embaucherCandidature(100L, email);

        assertEquals(StatutCandidature.EN_ATTENTE_CHOIX_STAGE, resultat.statut());
        verify(mockContratService, never()).genererContratAutomatique(anyLong());
        verify(notificationService).pushNotification(any(Notification.class), eq(55L));
    }

    @Test
    void embaucherCandidature_etudiantDejaStageChoisi_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_ENTREVUE);

        OffreStage autreOffre = new OffreStage("Autre poste", "Desc", "Google");
        autreOffre.setAnnee(AcademicSessionUtils.getAnneeActuelle());
        Candidature autreCand = new Candidature(candidature.getEtudiant(), autreOffre);
        autreCand.setId(200L);
        autreCand.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);

        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.findByEtudiant(candidature.getEtudiant())).thenReturn(List.of(candidature, autreCand));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(100L, email));

        assertEquals("Cet étudiant a déjà choisi un autre stage pour cette session.", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void embaucherCandidature_sansEntrevueAcceptee_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        Candidature candidature = creerCandidature(100L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(100L, employeur)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(100L, email));

        assertEquals("L'entrevue doit être confirmée par l'étudiant avant l'embauche", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
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
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void embaucherCandidature_candidatureDunAutreEmployeur_lanceException() {
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);
        when(candidatureRepository.findByIdAndOffreStageEmployeur(99L, employeur)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                employeurService.embaucherCandidature(99L, email));

        assertEquals("Candidature introuvable pour cet employeur", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void getOffres_avecAnnee_retourneOffresFiltreesParAnnee() throws Exception {
//        ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);

        OffreStage offre2025 = new OffreStage("Stage 2025", "Description", "CGI", "info", "25$/h", "Java", 2025);
        offre2025.setId(1L);

        when(offreStageRepository.findWithCandidaturesByEmployeurAndAnnee(employeur, 2025))
                .thenReturn(List.of(offre2025));

//        ACT
        List<OffreStageDto> resultat = employeurService.getOffres(email, 2025);

//        ASSERT
        assertEquals(1, resultat.size());
        assertEquals(2025, resultat.getFirst().annee());
        assertEquals("Stage 2025", resultat.getFirst().titre());
    }

    @Test
    void getAnnees_retourneAnneesDisponiblesPourEmployeur() throws Exception {
//        ARRANGE
        String email = "employeur@entreprise.com";
        Employeur employeur = preparerEmployeur(email);

        when(offreStageRepository.findDistinctAnneesByEmployeur(employeur)).thenReturn(List.of(2025));

//        ACT
        List<Integer> annees = employeurService.getAnnees(email);

//        ASSERT
        assertTrue(annees.contains(2025));
        assertTrue(annees.size() >= 1);
    }

    @Test
    void deleteOffre_avecOffreValide_supprimeLOffre() {
        // ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        OffreStage offre = new OffreStage("Stagiaire en informatique", "Description", "CGI");
        offre.setId(10L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));
        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(10L, employeur))
                .thenReturn(Optional.of(offre));

        // ACT
        assertDoesNotThrow(() -> employeurService.deleteOffre(10L, email));

        // ASSERT
        assertTrue(offre.isSupprime());
        assertNotNull(offre.getDateSuppression());
        assertEquals(LocalDate.now(), offre.getDateSuppression());
    }

    @Test
    void deleteOffre_shouldThrowException_whenOffreNotFound() {
        // ARRANGE
        String email = "employeur@entreprise.com";
        Credentials credentialsEmployeur = new Credentials(email, "password123", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jean", "Tremblay", credentialsEmployeur, "CGI", "514-555-1234");
        employeur.setId(1L);

        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(employeur));
        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(99L, employeur))
                .thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.deleteOffre(99L, email));

        // ASSERT
        assertEquals("Offre introuvable pour cet employeur", exception.getMessage());
    }

    @Test
    void deleteOffre_shouldThrowException_whenEmployeurNotFound() {
        // ARRANGE
        String emailInexistant = "inconnu@entreprise.com";

        when(userAppRepository.findUserAppByEmail(emailInexistant)).thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.deleteOffre(10L, emailInexistant));

        // ASSERT
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

        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(10L, employeur)).thenReturn(Optional.of(offre));
        when(offreStageRepository.save(any(OffreStage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        //ACT
        OffreStageDto resultat = employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI",
                "Développement d'applications web avec Spring Boot et React", "info",
                "25$/h", "Connaissances en Java et React", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, DATE_DEBUT, DATE_FIN);

        //ASSERT
        assertNotNull(resultat);
        assertEquals(10, resultat.id());
        assertEquals("Stagiaire en informatique", resultat.titre());
        assertEquals("Développement d'applications web avec Spring Boot et React", resultat.description());
        assertEquals("info", resultat.discipline());
        assertEquals("25$/h", resultat.salaire());
        assertEquals("Connaissances en Java et React", resultat.exigences());
        assertEquals(ADRESSE, resultat.adresse());
        assertEquals(VILLE, resultat.ville());
        assertEquals(CODE_POSTAL, resultat.codePostal());
        assertEquals(TELEPHONE, resultat.telephone());
        assertEquals(DATE_DEBUT, resultat.dateDebut());
        assertEquals(DATE_FIN, resultat.dateFin());
        assertEquals(StatusAcceptation.EN_ATTENTE, resultat.status());
    }

    @Test
    void updateOffreStage_titreVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "", "CGI", "Description valide", "info",
                        "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le titre est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_nomEntrepriseVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "Stagiaire en informatique", "", "Description valide", "info",
                        "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le nom de l'entreprise est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_descriptionVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(10L, "Stagiaire en informatique", "CGI", "", "info",
                        "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

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
                        "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, emailInexistant, DATE_DEBUT, DATE_FIN));

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
        when(offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(99L, employeur)).thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService
                .updateOffreStage(99L, "Stagiaire en informatique", "CGI", "Description valide", "info",
                        "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Offre introuvable pour cet employeur", exception.getMessage());
    }

    @Test
    void testCreerOffre_adresseVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, "", VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("L'adresse est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_adresseNulle_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, null, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("L'adresse est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_telephoneVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, "", "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le téléphone est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_telephoneNul_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, null, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le téléphone est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_telephoneInvalide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, "abc", "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le numéro de téléphone est invalide", exception.getMessage());
    }

    @Test
    void testCreerOffre_telephoneTropCourt_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, CODE_POSTAL, "555-1234", "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le numéro de téléphone est invalide", exception.getMessage());
    }

    @Test
    void updateOffreStage_adresseVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info", "25$/h", "Java", "", VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("L'adresse est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_telephoneVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info", "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, "", "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le téléphone est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_telephoneInvalide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info", "25$/h", "Java", ADRESSE, VILLE, CODE_POSTAL, "abc", "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le numéro de téléphone est invalide", exception.getMessage());
    }

    @Test
    void testCreerOffre_villeVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, "", CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("La ville est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_codePostalVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, "", TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le code postal est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_codePostalInvalide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", null, null, null, ADRESSE, VILLE, "12345", TELEPHONE, "employeur@entreprise.com", null, DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le code postal est invalide", exception.getMessage());
    }

    @Test
    void updateOffreStage_villeVide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info", "25$/h", "Java", ADRESSE, "", CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("La ville est obligatoire", exception.getMessage());
    }

    @Test
    void updateOffreStage_codePostalInvalide_lanceException() {
        //ACT
        Exception exception = assertThrows(Exception.class, () -> employeurService.updateOffreStage(10L, "Stagiaire en informatique", "CGI", "Description valide", "info", "25$/h", "Java", ADRESSE, VILLE, "12345", TELEPHONE, "employeur@entreprise.com", DATE_DEBUT, DATE_FIN));

        //ASSERT
        assertEquals("Le code postal est invalide", exception.getMessage());
    }

    @Test
    void createOffreStage_devraitNotifierTousLesGestionnaires() throws Exception {
        String email = "employeur@entreprise.com";
        preparerEmployeur(email);

        Gestionnaire gest1 = new Gestionnaire("John", "Gestion",
                new Credentials("gest1@test.com", "pass", Role.GESTIONNAIRE));
        gest1.setId(10L);
        Gestionnaire gest2 = new Gestionnaire("Marie", "Gestion",
                new Credentials("gest2@test.com", "pass", Role.GESTIONNAIRE));
        gest2.setId(20L);

        when(offreStageRepository.save(any(OffreStage.class))).thenAnswer(inv -> {
            OffreStage saved = inv.getArgument(0);
            saved.setId(77L);
            return saved;
        });
        when(gestionnaireRepository.findAll()).thenReturn(List.of(gest1, gest2));

        employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                null, null, null,
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, null, DATE_DEBUT, DATE_FIN);

        org.mockito.ArgumentCaptor<Notification> notifCaptor = org.mockito.ArgumentCaptor.forClass(Notification.class);
        verify(notificationService).pushNotification(notifCaptor.capture(), eq(10L));
        verify(notificationService).pushNotification(any(Notification.class), eq(20L));

        Notification notif = notifCaptor.getValue();
        assertEquals(NotificationType.ACTION_REQUIRED, notif.getType());
        assertEquals("gestionnaire.offre_submitted", notif.getMessage());
        assertEquals(NotificationActionType.APPROUVER_OFFRE, notif.getAction().getType());
        assertEquals(77L, notif.getAction().getReferenceId());
    }

    @Test
    void createOffreStage_avecDatesDebutEtFin_sauvegardeLesDates() throws Exception {
        String email = "employeur@entreprise.com";
        preparerEmployeur(email);
        when(offreStageRepository.save(any(OffreStage.class))).thenAnswer(inv -> inv.getArgument(0));

        OffreStageDto resultat = employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                "Techniques de l'informatique", "25$/h", "Java",
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, null, DATE_DEBUT, DATE_FIN);

        assertEquals(DATE_DEBUT, resultat.dateDebut());
        assertEquals(DATE_FIN, resultat.dateFin());
    }

    @Test
    void createOffreStage_dateDebutManquante_lanceException() {
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                "Techniques de l'informatique", "25$/h", "Java",
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null,
                null, DATE_FIN));

        assertEquals("La date de début est obligatoire", exception.getMessage());
    }

    @Test
    void createOffreStage_dateFinManquante_lanceException() {
        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                "Techniques de l'informatique", "25$/h", "Java",
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null,
                DATE_DEBUT, null));

        assertEquals("La date de fin est obligatoire", exception.getMessage());
    }

    @Test
    void createOffreStage_dateFinAvantDebut_lanceException() {
        String email = "employeur@entreprise.com";

        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                "Techniques de l'informatique", "25$/h", "Java",
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, email, null,
                DATE_FIN, DATE_DEBUT));

        assertEquals("La date de fin doit être postérieure à la date de début", exception.getMessage());
    }

    @Test
    void createOffreStage_datesAncienneSession_lanceException() {
        LocalDate debutPasse = LocalDate.of(ANNEE_COURANTE - 1, 3, 2);
        LocalDate finPassee = LocalDate.of(ANNEE_COURANTE - 1, 5, 22);

        Exception exception = assertThrows(Exception.class, () -> employeurService.createOffreStage(
                "Développeur Java", "CGI", "Stage backend",
                "Techniques de l'informatique", "25$/h", "Java",
                ADRESSE, VILLE, CODE_POSTAL, TELEPHONE, "employeur@entreprise.com", null,
                debutPasse, finPassee));

        assertEquals("Les dates de l'offre ne peuvent pas appartenir à une ancienne session.", exception.getMessage());
    }
}
