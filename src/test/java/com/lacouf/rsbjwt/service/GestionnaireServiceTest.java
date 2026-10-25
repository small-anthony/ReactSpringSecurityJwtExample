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
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
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
        offre.setId(1l);

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
    void getCandidaturesAcceptees_succes() {
        // ARRANGE
        Credentials cred = new Credentials("jean@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Jean", "Dupont", cred, 1234567, "Informatique");
        etudiant.setId(1L);

        OffreStage offre = new OffreStage("Dev Java", "Description", "CGI");
        offre.setId(10L);

        Candidature candidature = new Candidature(etudiant, offre);
        candidature.setId(100L);
        candidature.setStatut(StatutCandidature.ACCEPTEE);

        when(candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE))
                .thenReturn(List.of(candidature));

        // ACT
        List<CandidatureDto> resultat = gestionnaireService.getCandidaturesAcceptees();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals(StatutCandidature.ACCEPTEE, resultat.getFirst().statut());
        assertEquals("Jean", resultat.getFirst().etudiant().firstName());
        assertEquals("Dev Java", resultat.getFirst().titreOffre());
        assertEquals("CGI", resultat.getFirst().nomEntreprise());
    }
    @Test
    void getCandidaturesRefusees_succes() {
        // ARRANGE
        Credentials cred = new Credentials("marie@test.com", "pass", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Marie", "Curie", cred, 7654321, "Informatique");
        etudiant.setId(2L);

        OffreStage offre = new OffreStage("Dev Web", "Description", "Desjardins");
        offre.setId(11L);

        Candidature candidature = new Candidature(etudiant, offre);
        candidature.setId(101L);
        candidature.setStatut(StatutCandidature.REFUSEE);
        candidature.setMessageReponse("Poste comblé");

        when(candidatureRepository.findByStatut(StatutCandidature.REFUSEE))
                .thenReturn(List.of(candidature));
        // ACT
        List<CandidatureDto> resultat = gestionnaireService.getCandidaturesRefusees();
        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals(StatutCandidature.REFUSEE, resultat.getFirst().statut());
        assertEquals("Marie", resultat.getFirst().etudiant().firstName());
        assertEquals("Poste comblé", resultat.getFirst().messageReponse());
    }
}
