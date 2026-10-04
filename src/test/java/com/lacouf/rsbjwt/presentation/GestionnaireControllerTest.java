package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.AcceptationOffreDto;
import com.lacouf.rsbjwt.presentation.RequestDto.RejetOffreDto;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireControllerTest {
    @Mock
    private GestionnaireService gestionnaireService;

    @InjectMocks
    private GestionnaireController gestionnaireController;

    @Test
    void accepterCv_shouldReturnCreatedCv() throws Exception {
//        ARRANGE
        DecisionCvRequest request = new DecisionCvRequest(1L, null);
        CvDto cvDto = mock(CvDto.class);

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
        CvDto cvDto = mock(CvDto.class);

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
        List<CvDto> cvList = List.of(mock(CvDto.class), mock(CvDto.class));

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
        assertEquals(null, response.getBody());
    }

    @Test
    void accepterOffreStage_shouldReturnOk() throws Exception {
//        ARRANGE
        AcceptationOffreDto request = new AcceptationOffreDto(1L, List.of(2L));
        OffreStageDto offreDto = mock(OffreStageDto.class);

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
        List<OffreStageDto> liste = List.of(mock(OffreStageDto.class));

        when(gestionnaireService.getOffresEnAttente()).thenReturn(liste);

//        ACT
        ResponseEntity<List<OffreStageDto>> response = gestionnaireController.getOffresEnAttente();

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void refuserOffreStage_shouldReturnOk() throws Exception {
//        ARRANGE
        RejetOffreDto request = new RejetOffreDto(1L, "Refusé");
        OffreStageDto offreDto = mock(OffreStageDto.class);

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
}