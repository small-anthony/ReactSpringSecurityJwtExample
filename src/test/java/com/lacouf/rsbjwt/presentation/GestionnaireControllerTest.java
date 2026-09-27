package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.presentation.RequestDto.DecisionCvRequest;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.dto.CvDto;
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
}
