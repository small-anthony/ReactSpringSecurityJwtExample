package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.enums.CvStatus;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CvControllerTest {
    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private EtudiantController etudiantController;

    @Test
    void uploadCv_shouldReturnCreatedCv() throws Exception {
//        ARRANGE
        Long etudiantId = 1L;
        MultipartFile file = mock(MultipartFile.class);
        CvDto cvDto = new CvDto(10L, CvStatus.EN_ATTENTE);

        when(userAppService.uploadCv(etudiantId, file))
                .thenReturn(cvDto);

//        ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(etudiantId, file);

//        ARRANGE
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(cvDto, response.getBody());
    }

    @Test
    void uploadCv_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Long etudiantId = 1L;
        MultipartFile file = mock(MultipartFile.class);

        when(userAppService.uploadCv(etudiantId, file))
                .thenThrow(new Exception("Veuillez sélectionner un fichier"));

//        ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(etudiantId, file);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Veuillez sélectionner un fichier", response.getBody());
    }
}
