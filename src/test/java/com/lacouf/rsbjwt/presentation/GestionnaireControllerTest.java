package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.ConvocationService;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.RapportEtudiantDto;
import com.lacouf.rsbjwt.presentation.RequestDto.AssignationProfesseurRequest;
import com.lacouf.rsbjwt.service.dto.AssignationProfesseurResponseDto;
import com.lacouf.rsbjwt.service.dto.EtudiantPourAssignationDto;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurPourAssignationDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireControllerTest {
    @Mock
    private GestionnaireService gestionnaireService;

    @Mock
    private ConvocationService convocationService;

    @InjectMocks
    private GestionnaireController gestionnaireController;

    private CvDto createDummyCvDto() {
        return new CvDto(1L, StatusAcceptation.EN_ATTENTE, null, 1L, "Sophie", "Martin", 123456);
    }

    private OffreStageDto createDummyOffreStageDto() {
        return new OffreStageDto(
                1, "Dev Web", "Description", "CGI",
                StatusAcceptation.EN_ATTENTE, null,
                "informatique", "25$/h", "15 sem", "Java",
                List.of(), 2026
        );
    }

    private RapportEtudiantDto createDummyRapportEtudiantDto() {
        return new RapportEtudiantDto(
                1, "Sophie", "Martin", "sophie@test.com", 123456, "informatique", List.of()
        );
    }

    private EtudiantPourAssignationDto createDummyEtudiantDto() {
        return new EtudiantPourAssignationDto(
                1L, "Sophie", "Martin", "sophie@test.com", 123456, "informatique",
                true, "Dev Web", "CGI", null, false, List.of()
        );
    }

    private ProfesseurPourAssignationDto createDummyProfesseurDto() {
        return new ProfesseurPourAssignationDto(
                10L, "Martin", "Tremblay", "martin@test.com", 2L, false, 5
        );
    }

    private AssignationProfesseurResponseDto createDummyAssignationResponseDto() {
        ProfesseurDto profDto = new ProfesseurDto(10, "Martin", "Tremblay", "martin@test.com", Role.PROFESSEUR);
        return AssignationProfesseurResponseDto.succes(createDummyEtudiantDto(), profDto, "Succes", null);
    }

    @Test
    void accepterCv_shouldReturnCreatedCv() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, null);
        CvDto cvDto = createDummyCvDto();

        when(gestionnaireService.accepterCv(request.id())).thenReturn(cvDto);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.acceptCv(request);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(cvDto, response.getBody());
    }

    @Test
    void refuseCv_shouldReturnCreatedCv() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, "Refusé pour des raisons spécifiques");
        CvDto cvDto = createDummyCvDto();

        when(gestionnaireService.refuserCv(request.id(), request.message())).thenReturn(cvDto);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.refuseCv(request);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(cvDto, response.getBody());
    }

    @Test
    void refuseCv_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, "Refusé pour des raisons spécifiques");

        when(gestionnaireService.refuserCv(request.id(), request.message()))
                .thenThrow(new Exception("Erreur lors du refus du CV"));

//        ACT
        ResponseEntity<Object> response = gestionnaireController.refuseCv(request);

//        ARRANGE
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur lors du refus du CV", response.getBody());
    }

    @Test
    void getCvEnAttente_shouldReturnOk() {
//        ARRANGE
        List<CvDto> cvList = List.of(createDummyCvDto(), createDummyCvDto());

        when(gestionnaireService.getCvEnAttente()).thenReturn(cvList);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getCvEnAttente();

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cvList, response.getBody());
    }

    @Test
    void getCvPdf_shouldReturnOkPdfData() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, null);
        byte[] expectedPdfData = "Contenu PDF factice".getBytes();

        when(gestionnaireService.getCvPdf(request.id())).thenReturn(expectedPdfData);

//        ACT
        ResponseEntity<byte[]> response = gestionnaireController.getCvPdf(request);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedPdfData, response.getBody());
    }

    @Test
    void getCvPdf_shouldReturnBadRequest() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, null);

        when(gestionnaireService.getCvPdf(request.id())).thenThrow(new Exception("Erreur lors de la récupération"));

//        ACT
        ResponseEntity<byte[]> response = gestionnaireController.getCvPdf(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void accepterOffreStage_shouldReturnOk() throws Exception {
//        ARRANGE
        AcceptationOffreDto request = new AcceptationOffreDto(1L, List.of(2L));
        OffreStageDto offreDto = createDummyOffreStageDto();

        when(gestionnaireService.accepterOffreStage(1L, List.of(2L))).thenReturn(offreDto);

//        ACT
        ResponseEntity<?> response = gestionnaireController.accepterOffreStage(request);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void accepterOffreStage_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        AcceptationOffreDto request = new AcceptationOffreDto(1L, List.of(2L));

        when(gestionnaireService.accepterOffreStage(1L, List.of(2L)))
                .thenThrow(new Exception("Offre de stage non trouvée"));

//        ACT
        ResponseEntity<?> response = gestionnaireController.accepterOffreStage(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Offre de stage non trouvée", response.getBody());
    }

    @Test
    void getOffresEnAttente_shouldReturnOk() throws Exception {
//        ARRANGE
        List<OffreStageDto> liste = List.of(createDummyOffreStageDto());

        when(gestionnaireService.getOffresEnAttente()).thenReturn(liste);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getOffresEnAttente(null);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getOffresEnAttente_avecAnnee_shouldReturnOk() {
//        ARRANGE
        List<OffreStageDto> liste = List.of(createDummyOffreStageDto());
        when(gestionnaireService.getOffresEnAttente(2025)).thenReturn(liste);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getOffresEnAttente(2025);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getToutesOffres_avecAnnee_shouldReturnOk() {
//        ARRANGE
        List<OffreStageDto> liste = List.of(createDummyOffreStageDto());
        when(gestionnaireService.getToutesOffres(2025)).thenReturn(liste);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getToutesOffres(2025);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getAnneesDisponibles_shouldReturnOk() {
//        ARRANGE
        List<Integer> annees = List.of(2026, 2025);
        when(gestionnaireService.getAnneesDisponibles()).thenReturn(annees);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getAnneesDisponibles();

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(annees, response.getBody());
    }

    @Test
    void refuserOffreStage_shouldReturnOk() throws Exception {
//        ARRANGE
        RejetOffreDto request = new RejetOffreDto(1L, "Refusé");
        OffreStageDto offreDto = createDummyOffreStageDto();

        when(gestionnaireService.refuserOffreStage(1L, "Refusé")).thenReturn(offreDto);

//        ACT
        ResponseEntity<?> response = gestionnaireController.refuserOffreStage(request);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void refuserOffreStage_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        RejetOffreDto request = new RejetOffreDto(1L, "Refusé");

        when(gestionnaireService.refuserOffreStage(1L, "Refusé"))
                .thenThrow(new Exception("Offre de stage non trouvée"));
//        ACT

        ResponseEntity<?> response = gestionnaireController.refuserOffreStage(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Offre de stage non trouvée", response.getBody());
    }

    @Test
    void getToutesConvocations_avecAnnee_shouldReturnOk() {
//        ARRANGE
        List<ConvocationDto> convocations = List.of();
        when(convocationService.getToutesConvocations(2025)).thenReturn(convocations);

//        ACT
        ResponseEntity<Object> response = gestionnaireController.getToutesConvocations(2025);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(convocations, response.getBody());
    }

    @Test
    void getTousLesEtudiants_shouldReturnOk() {
        // ARRANGE
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getTousLesEtudiants()).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getTousLesEtudiants();

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getEtudiantsSansConvocation_shouldReturnOk() {
        // ARRANGE
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getEtudiantsSansConvocation(null)).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getEtudiantsSansConvocation(null);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getEtudiantsEnAttenteEntrevue_shouldReturnOk() {
        // ARRANGE
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getEtudiantsEnAttenteEntrevue(null)).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getEtudiantsEnAttenteEntrevue(null);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getEtudiantsEnAttenteReponse_shouldReturnOk() {
        // ARRANGE
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getEtudiantsEnAttenteReponse(null)).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getEtudiantsEnAttenteReponse(null);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getEtudiantsTrouveStage_shouldReturnOk() {
        // ARRANGE
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getEtudiantsTrouveStage(null)).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getEtudiantsTrouveStage(null);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getEtudiantsPourAssignation_shouldReturnOk() {
        // Arrange
        List<EtudiantPourAssignationDto> liste = List.of(createDummyEtudiantDto());
        when(gestionnaireService.getEtudiantsPourAssignation(2026)).thenReturn(liste);

        // Act
        ResponseEntity<List<EtudiantPourAssignationDto>> response = gestionnaireController.getEtudiantsPourAssignation(2026);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getProfesseursPourAssignation_shouldReturnOk() {
        // Arrange
        List<ProfesseurPourAssignationDto> liste = List.of(createDummyProfesseurDto());
        when(gestionnaireService.getProfesseursPourAssignation("Martin")).thenReturn(liste);

        // Act
        ResponseEntity<List<ProfesseurPourAssignationDto>> response = gestionnaireController.getProfesseursPourAssignation("Martin");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void assignerProfesseur_succes_shouldReturnOk() throws Exception {
        // Arrange
        AssignationProfesseurRequest request = new AssignationProfesseurRequest(1L, 10L, null);
        AssignationProfesseurResponseDto dto = createDummyAssignationResponseDto();
        when(gestionnaireService.assignerProfesseur(1L, 10L, null)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = gestionnaireController.assignerProfesseur(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void assignerProfesseur_erreur_shouldReturnBadRequest() throws Exception {
        // Arrange
        AssignationProfesseurRequest request = new AssignationProfesseurRequest(1L, 10L, null);
        when(gestionnaireService.assignerProfesseur(1L, 10L, null)).thenThrow(new Exception("Erreur assignation"));

        // Act
        ResponseEntity<?> response = gestionnaireController.assignerProfesseur(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur assignation", response.getBody());
    }

    @Test
    void modifierAssignationProfesseur_succes_shouldReturnOk() throws Exception {
        // Arrange
        AssignationProfesseurRequest request = new AssignationProfesseurRequest(1L, 20L, null);
        AssignationProfesseurResponseDto dto = createDummyAssignationResponseDto();
        when(gestionnaireService.assignerProfesseur(1L, 20L, null)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = gestionnaireController.modifierAssignationProfesseur(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void desassignerProfesseur_succes_shouldReturnOk() throws Exception {
        // Arrange
        EtudiantPourAssignationDto dto = createDummyEtudiantDto();
        when(gestionnaireService.desassignerProfesseur(1L)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = gestionnaireController.desassignerProfesseur(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void desassignerProfesseur_erreur_shouldReturnBadRequest() throws Exception {
        // Arrange
        when(gestionnaireService.desassignerProfesseur(1L)).thenThrow(new Exception("Étudiant non trouvé"));

        // Act
        ResponseEntity<?> response = gestionnaireController.desassignerProfesseur(1L);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Étudiant non trouvé", response.getBody());
    }
    @Test
    void getEtudiantsTrouveStage_avecAnnee_shouldReturnOk() {
        // ARRANGE
        int annee = 2026;
        List<RapportEtudiantDto> liste = List.of(createDummyRapportEtudiantDto());

        when(gestionnaireService.getEtudiantsTrouveStage(annee)).thenReturn(liste);

        // ACT
        ResponseEntity<List<RapportEtudiantDto>> response = gestionnaireController.getEtudiantsTrouveStage(annee);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }
}
