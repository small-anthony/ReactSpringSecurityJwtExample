package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CvControllerTest {
        @Mock
        private EtudiantService etudiantService;

        @InjectMocks
        private EtudiantController etudiantController;

        @Test
        void uploadCv_shouldReturnCreatedCv() throws Exception {
                // ARRANGE
                String email = "test@gmail.com";
                MultipartFile file = mock(MultipartFile.class);

                Authentication authentication = mock(Authentication.class);
                when(authentication.getName()).thenReturn(email);

                CvDto cvDto = new CvDto(10L);

                when(etudiantService.uploadCv(email, file))
                                .thenReturn(cvDto);

                // ACT
                ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

                // ARRANGE
                assertEquals(HttpStatus.CREATED, response.getStatusCode());
                assertEquals(cvDto, response.getBody());
        }

        @Test
        void uploadCv_shouldReturnBadRequestOnException() throws Exception {
                // ARRANGE
                String email = "test@gmail.com";
                MultipartFile file = mock(MultipartFile.class);

                Authentication authentication = mock(Authentication.class);
                when(authentication.getName()).thenReturn(email);

                when(etudiantService.uploadCv(email, file))
                                .thenThrow(new Exception("Veuillez sélectionner un fichier"));

                // ACT
                ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

                // ASSERT
                assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
                assertEquals("Veuillez sélectionner un fichier", response.getBody());
        }

        @Test
        void uploadCv_shouldReturnForbiddenOnAccessDenied() throws Exception {
                // ARRANGE
                String emailHacker = "hacker@gmail.com";
                MultipartFile file = mock(MultipartFile.class);

                Authentication authentication = mock(Authentication.class);
                when(authentication.getName()).thenReturn(emailHacker);

                when(etudiantService.uploadCv(emailHacker, file))
                                .thenThrow(new Exception("Accès refusé"));

                // ACT
                ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

                // ASSERT
                assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
                assertEquals("Accès refusé", response.getBody());
        }
}
