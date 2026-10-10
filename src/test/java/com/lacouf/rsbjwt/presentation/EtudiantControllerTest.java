package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.service.EtudiantService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.StatutCvDto;
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
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
        // ARRANGE
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

        // ACT
        ResponseEntity<Object> response = etudiantController.signUpEtudiant(request);

        // ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(etudiantDto, response.getBody());
    }

    @Test
    void signUpEtudiant_shouldReturnBadRequestOnException() throws Exception {
        // ARRANGE
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

        // ACT
        ResponseEntity<Object> response = etudiantController.signUpEtudiant(request);

        // ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le format de l'email est invalide", response.getBody());
    }

    @Test
    void uploadCv_shouldReturnCreatedCv() throws Exception {
        // ARRANGE
        String email = "test@gmail.com";
        MultipartFile file = mock(MultipartFile.class);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        CvDto cvDto = new CvDto(10L, StatusAcceptation.EN_ATTENTE, null, 1L, "Prenom", "Nom", 12345);

        when(etudiantService.uploadCv(email, file))
                .thenReturn(cvDto);

        // ACT
        ResponseEntity<Object> response = etudiantController.uploadCv(file, authentication);

        // ASSERT
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

    @Test
    void getStatutCv_shouldReturnOk() {
        // ARRANGE
        String email = "etudiant@gmail.com";
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        StatutCvDto statutCvDto = new StatutCvDto(true, StatusAcceptation.ACCEPTE, null);
        when(etudiantService.getStatutCv(email)).thenReturn(statutCvDto);

        // ACT
        ResponseEntity<StatutCvDto> response = etudiantController.getStatutCv(authentication);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(statutCvDto, response.getBody());
    }

    @Test
    void getOffresDisponibles_shouldReturnOk() {
        // ARRANGE
        String email = "etudiant@gmail.com";
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        OffreStageDto offreDto = mock(OffreStageDto.class);
        when(etudiantService.getOffresDisponibles(email)).thenReturn(List.of(offreDto));

        // ACT
        ResponseEntity<List<OffreStageDto>> response = etudiantController.getOffresDisponibles(authentication);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getOffreDetail_shouldReturnOk() {
        // ARRANGE
        String email = "etudiant@gmail.com";
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(email);

        OffreStageDto offreDto = mock(OffreStageDto.class);
        when(etudiantService.getOffreDetail(1L, email)).thenReturn(offreDto);

        // ACT
        ResponseEntity<OffreStageDto> response = etudiantController.getOffreDetail(1L, authentication);

        // ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void postuler_shouldReturnCreated() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("etudiant@test.com");

        OffreStageDto offreDto = mock(OffreStageDto.class);
        when(etudiantService.postuler(10L, "etudiant@test.com")).thenReturn(offreDto);
//        ACT
        ResponseEntity<Object> response = etudiantController.postuler(10L, authentication);
//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void postuler_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("etudiant@test.com");

        when(etudiantService.postuler(10L, "etudiant@test.com")).thenThrow(new Exception("Déjà postulé"));
//        ACT
        ResponseEntity<Object> response = etudiantController.postuler(10L, authentication);
//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Déjà postulé", response.getBody());
    }

    @Test
    void getMesCandidatures_shouldReturnOk() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("etudiant@test.com");

        List<OffreStageDto> list = List.of();
        when(etudiantService.getMesCandidatures("etudiant@test.com")).thenReturn(list);
//        ACT
        ResponseEntity<Object> response = etudiantController.getMesCandidatures(authentication);
//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(list, response.getBody());
    }

    @Test
    void getMesCandidatures_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("etudiant@test.com");

        when(etudiantService.getMesCandidatures("etudiant@test.com")).thenThrow(new Exception("Erreur"));
//        ACT
        ResponseEntity<Object> response = etudiantController.getMesCandidatures(authentication);
//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur", response.getBody());
    }

    @Test
    void rechercherEtudiants_shouldReturnOk() {
        //ARRANGE
        EtudiantDto etudiantDto = mock (EtudiantDto.class);
        when(etudiantService.rechercherEtudiants("Peter")).thenReturn(List.of(etudiantDto));

        //ACT
        ResponseEntity<List<EtudiantDto>> response = etudiantController.rechercherEtudiants("Peter");

        //ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(etudiantDto, response.getBody().getFirst());
    }
}

