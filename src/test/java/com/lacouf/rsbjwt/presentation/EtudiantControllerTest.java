package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EtudiantControllerTest {
    @Mock
    private UserAppService userAppService;

    @Mock
    private EtudiantService etudiantService;

    @InjectMocks
    private EtudiantController etudiantController;

    @Test
    void signUpEtudiant_shouldReturnCreated() throws Exception {
//        ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Peter");
        request.put("lastName", "Parker");
        request.put("matricule", "12345");
        request.put("email", "test@gmail.com");
        request.put("discipline", "Informatique");
        request.put("password", "password");
        request.put("confirmPassword", "password");

        EtudiantDto etudiantDto = mock(EtudiantDto.class);

        when(userAppService.registerStudent(
                "Peter",
                "Parker",
                12345,
                "test@gmail.com",
                "Informatique",
                "password",
                "password"))
                .thenReturn(etudiantDto);

//        ACT
        ResponseEntity<Object> response = etudiantController.signUpEtudiant(request);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(etudiantDto, response.getBody());
    }

    @Test
    void signUpEtudiant_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Peter");
        request.put("lastName", "Parker");
        request.put("matricule", "12345");
        request.put("email", "testgmail.com");
        request.put("discipline", "Informatique");
        request.put("password", "password");
        request.put("confirmPassword", "password");

        when(userAppService.registerStudent(
                "Peter",
                "Parker",
                12345,
                "testgmail.com",
                "Informatique",
                "password",
                "password"))
                .thenThrow(new Exception("Le format de l'email est invalide"));

//        ACT
        ResponseEntity<Object> response = etudiantController.signUpEtudiant(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le format de l'email est invalide", response.getBody());
    }

    @Test
    void uploadCv_shouldReturnCreatedCv() throws Exception {
//        ARRANGE
        String email = "test@gmail.com";
        MultipartFile file = mock(MultipartFile.class);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        CvDto cvDto = new CvDto(10L, StatusAcceptation.EN_ATTENTE, null, 1L, "Prenom", "Nom", 12345);

        when(etudiantService.uploadCv(email, file))
                .thenReturn(cvDto);

//        ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(cvDto, response.getBody());
    }

    @Test
    void uploadCv_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        String email = "test@gmail.com";
        MultipartFile file = mock(MultipartFile.class);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        when(etudiantService.uploadCv(email, file))
                .thenThrow(new Exception("Veuillez sélectionner un fichier"));

//        ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Veuillez sélectionner un fichier", response.getBody());
    }

    @Test
    void uploadCv_shouldReturnForbiddenOnAccessDenied() throws Exception {
//        ARRANGE
        String emailHacker = "hacker@gmail.com";
        MultipartFile file = mock(MultipartFile.class);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(emailHacker);

        when(etudiantService.uploadCv(emailHacker, file))
                .thenThrow(new Exception("Accès refusé"));

//        ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

//        ASSERT
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Accès refusé", response.getBody());
    }

    @Test
    void getMatricule_shouldReturnOk() throws Exception {
//        ARRANGE
        EtudiantDto etudiantDto = mock(EtudiantDto.class);

        when(etudiantService.getEtudiantByMatricule(12345)).thenReturn(etudiantDto);

//        ACT
        ResponseEntity<?> response = etudiantController.getMatricule(12345);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(etudiantDto, response.getBody());
    }
    @Test
    void getMatricule_shouldReturnNotFoundOnException() throws Exception {
//        ARRANGE
        when(etudiantService.getEtudiantByMatricule(99999)).thenThrow(new Exception("Aucun étudiant trouvé avec ce matricule"));

//        ACT
        ResponseEntity<?> response = etudiantController.getMatricule(99999);

//        ASSERT
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Aucun étudiant trouvé avec ce matricule", response.getBody());
    }

}
