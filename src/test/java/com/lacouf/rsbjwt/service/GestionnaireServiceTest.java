package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.CvRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.AssignationProfesseurResponseDto;
import com.lacouf.rsbjwt.service.dto.EtudiantPourAssignationDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurPourAssignationDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.RapportEtudiantDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireServiceTest {
    @Mock
    private CvRepository cvRepository;

    @Mock
    private OffreStageRepository offreStageRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private NotificationService notificationService;

    @Test
    void getCvEnAttente_shouldReturnListCvEnAttente() {
//        ARRANGE
        Cv cv1 = new Cv();
        cv1.setId(1L);
        Cv cv2 = new Cv();
        cv2.setId(2L);

        when(cvRepository.findByApprobationStatus(StatusAcceptation.EN_ATTENTE))
                .thenReturn(List.of(cv1, cv2));

//        ACT
        List<CvDto> resultat = gestionnaireService.getCvEnAttente();

//        ASSERT
        assertEquals(2, resultat.size());
        assertEquals(1L, resultat.get(0).id());
        assertEquals(2L, resultat.get(1).id());
    }

    @Test
    void accepterCv_shouldChangeCvStatus_WhenCvExists() throws Exception {
//         ARRANGE
        Cv cv = new Cv();
        cv.setId(1L);

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

        when(cvRepository.save(cv)).thenReturn(cv);

//        ACT
        CvDto resultat = gestionnaireService.accepterCv(1L);

//        ASSERT
        assertEquals(StatusAcceptation.ACCEPTE, resultat.status());
    }

    @Test
    void refuserCv_shouldChangeCvStatusSetMessage_WhenCvExists() throws Exception {
//         ARRANGE
        Cv cv = new Cv();
        cv.setId(1L);
        String messageRefus = "Message de refus";

        when(cvRepository.findById(1L))
                .thenReturn(Optional.of(cv));

        when(cvRepository.save(cv)).thenReturn(cv);

//        ACT
        CvDto resultat = gestionnaireService.refuserCv(1L, messageRefus);

//        ASSERT
        assertEquals(StatusAcceptation.REFUSE, resultat.status());
        assertEquals("Message de refus", resultat.message());
    }

    @Test
    void accepterCv_shouldThrowException_WhenCvDoesNotExist() {
//        ARRANGE
        when(cvRepository.findById(1L))
                .thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () -> gestionnaireService.accepterCv(1L));

//        ASSERT
        assertEquals("CV non trouvé", exception.getMessage());
    }

    @Test
    void getCvPdf_shouldReturnPdfDataCvExists() throws Exception {
//        ARRANGE
        byte[] expectedData = "Faux contenu PDF".getBytes();
        Cv cv = new Cv();
        cv.setData(expectedData);

        when(cvRepository.findById(1L)).thenReturn(Optional.of(cv));

//        ACT
        byte[] actualData = gestionnaireService.getCvPdf(1L);

//        ASSERT
        assertArrayEquals(expectedData, actualData);
    }

    @Test
    void getCvPdf_shouldThrowExceptionCvDoesNotExist() {
//        ARRANGE
        when(cvRepository.findById(1L)).thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () -> gestionnaireService.getCvPdf(1L));

//        ASSERT
        assertEquals("CV non trouvé", exception.getMessage());
    }

    @Test
    public void accepterOffreStage_succes() throws Exception{
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1L);

        Etudiant etudiant = new Etudiant();
        etudiant.setId(2L);

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(etudiantRepository.findAllById(List.of(2L))).thenReturn(List.of(etudiant));
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offre);

        // ACT
        OffreStageDto resultat = gestionnaireService.accepterOffreStage(1L, List.of(2L));

        // ASSERT
        assertNotNull(resultat);
        assertEquals(StatusAcceptation.ACCEPTE, resultat.status());
        assertEquals(1, offre.getEtudiantsAutorises().size());
    }

    @Test
    void accepterOffreStage_offreIntrouvable_lanceException() {
        // ARRANGE
        when(offreStageRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.accepterOffreStage(99L, null));

        // ASSERT
        assertEquals("Offre de stage non trouvée", exception.getMessage());
    }

    @Test
    void accepterOffreStage_offreDejaTraitee_lanceException() throws Exception {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Desc", "CGI");
        offre.setId(1L);

        offre.accepter();

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.accepterOffreStage(1L, null));

        // ASSERT
        assertEquals("Cette offre a déjà été traitée.", exception.getMessage());
    }

    @Test
    void refuserOffreStage_succes() throws Exception {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1L);

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offre);

        // ACT
        OffreStageDto resultat = gestionnaireService.refuserOffreStage(1L, "Refusé");

        // ASSERT
        assertNotNull(resultat);
        assertEquals(StatusAcceptation.REFUSE, resultat.status());
        assertEquals("Refusé", resultat.messageReponse());
    }

    @Test
    void getOffresEnAttente_succes() {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1L);

        when(offreStageRepository.findByApprobationStatusAndDateSuppressionIsNull(StatusAcceptation.EN_ATTENTE))
                .thenReturn(List.of(offre));

        // ACT
        List<OffreStageDto> resultat = gestionnaireService.getOffresEnAttente();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals(1, resultat.getFirst().id());
    }

    @Test
    void getOffresEnAttente_avecAnnee_retourneOffresEnAttenteAnnee() {
//        ARRANGE
        OffreStage offre = new OffreStage("Stage 2025", "Description", "CGI", "info", "25$/h", "15 semaines", "Java", 2025);
        offre.setId(1L);

        when(offreStageRepository.findByApprobationStatusAndAnnee(StatusAcceptation.EN_ATTENTE, 2025))
                .thenReturn(List.of(offre));

//        ACT
        List<OffreStageDto> resultat = gestionnaireService.getOffresEnAttente(2025);

//        ASSERT
        assertEquals(1, resultat.size());
        assertEquals(2025, resultat.getFirst().annee());
    }

    @Test
    void getToutesOffres_avecAnnee_retourneToutesLesOffresAnnee() {
//        ARRANGE
        OffreStage offre = new OffreStage("Stage 2025", "Description", "CGI", "info", "25$/h", "15 semaines", "Java", 2025);
        offre.setId(1L);

        when(offreStageRepository.findAllByAnnee(2025)).thenReturn(List.of(offre));

//        ACT
        List<OffreStageDto> resultat = gestionnaireService.getToutesOffres(2025);

//        ASSERT
        assertEquals(1, resultat.size());
        assertEquals(2025, resultat.getFirst().annee());
    }

    @Test
    void getAnneesDisponibles_retourneAnneesTriees() {
//        ARRANGE
        when(offreStageRepository.findDistinctAnnees()).thenReturn(List.of(2025));

//        ACT
        List<Integer> annees = gestionnaireService.getAnneesDisponibles();

//        ASSERT
        assertTrue(annees.contains(2025));
    }

    @Test
    void getTousLesEtudiants_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);

        when(etudiantRepository.findAll()).thenReturn(List.of(etudiant));

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getTousLesEtudiants();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Jean", resultat.getFirst().firstName());
        assertTrue(resultat.getFirst().candidatures().isEmpty());
    }

    @Test
    void getEtudiantsSansConvocation_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);
        int anneeActuelle = AcademicSessionUtils.getAnneeActuelle();

        when(etudiantRepository.findEtudiantsSansConvocation(anneeActuelle)).thenReturn(List.of(etudiant));

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getEtudiantsSansConvocation();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Jean", resultat.getFirst().firstName());
        assertTrue(resultat.getFirst().candidatures().isEmpty());
    }

    @Test
    void getEtudiantsEnAttenteEntrevue_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);
        int anneeActuelle = AcademicSessionUtils.getAnneeActuelle();

        OffreStage offre = new OffreStage("Dev Java", "Description", "CGI");
        offre.setAnnee(anneeActuelle);

        Candidature candidature = new Candidature(etudiant, offre);
        candidature.setId(100L);

        etudiant.setCandidatures(List.of(candidature));

        when(etudiantRepository.findEtudiantsEnAttenteEntrevue(anneeActuelle)).thenReturn(List.of(etudiant));

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getEtudiantsEnAttenteEntrevue();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Jean", resultat.getFirst().firstName());
        assertEquals("Dev Java", resultat.getFirst().candidatures().getFirst().titreOffre());
        assertEquals("CGI", resultat.getFirst().candidatures().getFirst().nomEntreprise());
    }

    @Test
    void getEtudiantsEnAttenteReponse_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);
        int anneeActuelle = AcademicSessionUtils.getAnneeActuelle();

        OffreStage offre = new OffreStage("Dev Web", "Description", "Desjardins");
        offre.setAnnee(anneeActuelle);

        Candidature candidature = new Candidature(etudiant, offre);
        candidature.setId(101L);
        etudiant.setCandidatures(List.of(candidature));

        when(etudiantRepository.findEtudiantsEnAttenteReponse(anneeActuelle)).thenReturn(List.of(etudiant));

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getEtudiantsEnAttenteReponse();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Jean", resultat.getFirst().firstName());
        assertEquals("Dev Web", resultat.getFirst().candidatures().getFirst().titreOffre());
        assertEquals("Desjardins", resultat.getFirst().candidatures().getFirst().nomEntreprise());
    }

    @Test
    void getEtudiantsTrouveStage_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);
        int anneeActuelle = AcademicSessionUtils.getAnneeActuelle();

        OffreStage offre = new OffreStage("Dev Fullstack", "Description", "Hydro-Québec");
        offre.setAnnee(anneeActuelle);

        Candidature candidature = new Candidature(etudiant, offre);
        candidature.setId(102L);

        etudiant.setCandidatures(List.of(candidature));

        when(etudiantRepository.findEtudiantsTrouveStage(anneeActuelle)).thenReturn(List.of(etudiant));

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getEtudiantsTrouveStage();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals("Jean", resultat.getFirst().firstName());
        assertEquals("Dev Fullstack", resultat.getFirst().candidatures().getFirst().titreOffre());
        assertEquals("Hydro-Québec", resultat.getFirst().candidatures().getFirst().nomEntreprise());
    }

    @Test
    void getEtudiantsTrouveStage_avecAnneeSpecifique() {
        // ARRANGE
        int anneeArchive = 2025;
        when(etudiantRepository.findEtudiantsTrouveStage(anneeArchive)).thenReturn(List.of());

        // ACT
        List<RapportEtudiantDto> resultat = gestionnaireService.getEtudiantsTrouveStage(anneeArchive);

        // ASSERT
        assertNotNull(resultat);
        assertTrue(resultat.isEmpty());
        verify(etudiantRepository).findEtudiantsTrouveStage(anneeArchive);
    }

    @Test
    void getEtudiantsPourAssignation_avecAnnee() {
        // Arrange
        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        when(etudiantRepository.findEtudiantsTrouveStage(2026)).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantPourAssignationDto> resultat = gestionnaireService.getEtudiantsPourAssignation(2026);

        // Assert
        assertEquals(1, resultat.size());
        assertEquals("Sophie", resultat.getFirst().firstName());
        verify(etudiantRepository).findEtudiantsTrouveStage(2026);
    }

    @Test
    void getEtudiantsPourAssignation_sansAnnee() {
        // Arrange
        Etudiant etudiant = new Etudiant("Luc", "Belanger", new Credentials("luc@test.com", "pass", Role.ETUDIANT), 654321, "info");
        etudiant.setId(2L);
        when(etudiantRepository.findEtudiantsTrouveStage()).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantPourAssignationDto> resultat = gestionnaireService.getEtudiantsPourAssignation(null);

        // Assert
        assertEquals(1, resultat.size());
        assertEquals("Luc", resultat.getFirst().firstName());
        verify(etudiantRepository).findEtudiantsTrouveStage();
    }

    @Test
    void getProfesseursPourAssignation_avecNom() {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        when(professeurRepository.findByNom("Martin")).thenReturn(List.of(prof));
        when(etudiantRepository.countByProfesseurId(10L)).thenReturn(2L);

        // Act
        List<ProfesseurPourAssignationDto> resultat = gestionnaireService.getProfesseursPourAssignation("Martin");

        // Assert
        assertEquals(1, resultat.size());
        assertEquals("Martin", resultat.getFirst().firstName());
        assertEquals(2L, resultat.getFirst().nombreEtudiantsAssignes());
        assertFalse(resultat.getFirst().tropEtudiants());
    }

    @Test
    void getProfesseursPourAssignation_sansNom() {
        // Arrange
        Professeur prof = new Professeur("Chantal", "Gagnon", new Credentials("chantal@test.com", "pass", Role.PROFESSEUR));
        prof.setId(20L);
        when(professeurRepository.findAll()).thenReturn(List.of(prof));
        when(etudiantRepository.countByProfesseurId(20L)).thenReturn(6L);

        // Act
        List<ProfesseurPourAssignationDto> resultat = gestionnaireService.getProfesseursPourAssignation(null);

        // Assert
        assertEquals(1, resultat.size());
        assertEquals(6L, resultat.getFirst().nombreEtudiantsAssignes());
        assertTrue(resultat.getFirst().tropEtudiants());
    }

    private Etudiant createEtudiantAvecStage(Long id, String prenom, String nom, String email, int matricule) {
        Etudiant etudiant = new Etudiant(prenom, nom, new Credentials(email, "pass", Role.ETUDIANT), matricule, "info");
        etudiant.setId(id);
        OffreStage offre = new OffreStage("Dev Web", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        offre.setId(1L);
        Candidature cand = new Candidature(etudiant, offre);
        cand.setId(1L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));
        return etudiant;
    }

    @Test
    void assignerProfesseur_avecProfesseurId_succes() throws Exception {
        // Arrange
        Etudiant etudiant = createEtudiantAvecStage(1L, "Sophie", "Martin", "sophie@test.com", 123456);
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findById(10L)).thenReturn(Optional.of(prof));
        when(etudiantRepository.countByProfesseurId(10L)).thenReturn(2L);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        AssignationProfesseurResponseDto reponse = gestionnaireService.assignerProfesseur(1L, 10L, null);

        // Assert
        assertNotNull(reponse);
        assertTrue(reponse.success());
        assertEquals("Sophie", reponse.etudiant().firstName());
        assertEquals("Martin", reponse.professeur().firstName());
        assertNull(reponse.avertissement());
    }

    @Test
    void assignerProfesseur_avecProfesseurNom_succes() throws Exception {
        // Arrange
        Etudiant etudiant = createEtudiantAvecStage(2L, "Luc", "Belanger", "luc@test.com", 654321);
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        when(etudiantRepository.findById(2L)).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findByNom("Martin Tremblay")).thenReturn(List.of(prof));
        when(etudiantRepository.countByProfesseurId(10L)).thenReturn(1L);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        AssignationProfesseurResponseDto reponse = gestionnaireService.assignerProfesseur(2L, null, "Martin Tremblay");

        // Assert
        assertNotNull(reponse);
        assertTrue(reponse.success());
        assertEquals("Martin", reponse.professeur().firstName());
    }

    @Test
    void assignerProfesseur_depasseSeuilCharge_retourneAvertissement() throws Exception {
        // Arrange
        Etudiant etudiant = createEtudiantAvecStage(1L, "Sophie", "Martin", "sophie@test.com", 123456);
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findById(10L)).thenReturn(Optional.of(prof));
        when(etudiantRepository.countByProfesseurId(10L)).thenReturn(6L);
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        AssignationProfesseurResponseDto reponse = gestionnaireService.assignerProfesseur(1L, 10L, null);

        // Assert
        assertNotNull(reponse);
        assertNotNull(reponse.avertissement());
        assertTrue(reponse.avertissement().contains("seuil recommandé"));
    }

    @Test
    void assignerProfesseur_etudiantSansStage_lanceException() {
        // Arrange
        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.assignerProfesseur(1L, 10L, null)
        );

        assertTrue(exception.getMessage().contains("L'étudiant n'a pas encore trouvé de stage"));
    }

    @Test
    void assignerProfesseur_etudiantNonTrouve_lanceException() {
        // Arrange
        when(etudiantRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.assignerProfesseur(99L, 10L, null)
        );

        assertTrue(exception.getMessage().contains("Étudiant non trouvé"));
    }

    @Test
    void assignerProfesseur_professeurNonTrouve_lanceException() {
        // Arrange
        Etudiant etudiant = createEtudiantAvecStage(1L, "Sophie", "Martin", "sophie@test.com", 123456);
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.assignerProfesseur(1L, 99L, null)
        );

        assertTrue(exception.getMessage().contains("Professeur non trouvé"));
    }

    @Test
    void desassignerProfesseur_succes() throws Exception {
        // Arrange
        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        etudiant.setProfesseur(prof);

        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(etudiantRepository.save(any(Etudiant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        EtudiantPourAssignationDto resultat = gestionnaireService.desassignerProfesseur(1L);

        // Assert
        assertNotNull(resultat);
        assertNull(resultat.professeurAssigne());
        assertFalse(resultat.estAssigne());
    }

    @Test
    void desassignerProfesseur_etudiantNonTrouve_lanceException() {
        // Arrange
        when(etudiantRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.desassignerProfesseur(99L)
        );

        assertTrue(exception.getMessage().contains("Étudiant non trouvé"));
    }
}