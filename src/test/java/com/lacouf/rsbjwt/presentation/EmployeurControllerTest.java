
package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.service.EmployeurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmployeurControllerTest {
    @Mock
    private UserAppService userAppService;

    @Mock
    private EmployeurService employeurService;

    @InjectMocks
    private EmployeurController employeurController;

    @Test
    void signUpEmployeur_shouldReturnCreated() throws Exception {
//        ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jimmy");
        request.put("lastName", "Donaldson");
        request.put("email", "test@gmail.com");
        request.put("entreprise", "Entreprise");
        request.put("telephone", "514 111 1111");
        request.put("password", "password");
        request.put("passwordConfirmation", "password");

        EmployeurDto employeurDto = mock(EmployeurDto.class);

        when(userAppService.registerEmployeur(
                        "Jimmy",
                        "Donaldson",
                        "test@gmail.com",
                        "Entreprise",
                        "514 111 1111",
                        "password",
                        "password"))
                        .thenReturn(employeurDto);

//        ACT
        ResponseEntity<Object> response = employeurController.signUpEmployeur(request);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(employeurDto, response.getBody());
    }

    @Test
    void signUpEmployeur_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jimmy");
        request.put("lastName", "Donaldson");
        request.put("email", "testgmail.com");
        request.put("entreprise", "Entreprise");
        request.put("telephone", "514 111 1111");
        request.put("password", "password");
        request.put("passwordConfirmation", "password");

        when(userAppService.registerEmployeur(
                "Jimmy",
                "Donaldson",
                "testgmail.com",
                "Entreprise",
                "514 111 1111",
                "password",
                "password"))
                .thenThrow(new Exception("Le format du courriel n'est pas valide"));

//        ACT
        ResponseEntity<Object> response = employeurController.signUpEmployeur(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le format du courriel n'est pas valide", response.getBody());
    }

    @Test
    void testCreerOffre_succes() throws Exception {
//        ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("titre", "Stagiaire en informatique");
        request.put("nomEntreprise", "CGI");
        request.put("description", "Développement web React et Spring Boot");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        OffreStageDto offreDto = new OffreStageDto(1, "Stagiaire en informatique", "Développement web React et Spring Boot", "CGI", StatusAcceptation.EN_ATTENTE, null, new ArrayList<>());
        when(employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Développement web React et Spring Boot", "employeur@entreprise.com"))
                .thenReturn(offreDto);

//        ACT
        ResponseEntity<Object> response = employeurController.creerOffre(request, authentication);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void testCreerOffre_erreur_retourneBadRequest() throws Exception {

//      ARRANGE
        Map<String, String> request = new HashMap<>();
        request.put("titre", "");
        request.put("nomEntreprise", "CGI");
        request.put("description", "Développement web React et Spring Boot");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        when(employeurService.createOffreStage("", "CGI", "Développement web React et Spring Boot", "employeur@entreprise.com"))
                .thenThrow(new Exception("Le titre est obligatoire"));

//        ACT
        ResponseEntity<Object> response = employeurController.creerOffre(request, authentication);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le titre est obligatoire", response.getBody());
    }

    @Test
    void testGetOffres_succes() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        List<OffreStageDto> offres = List.of(
                        new OffreStageDto(1, "Titre", "Desc", "Ent", StatusAcceptation.EN_ATTENTE, ""));
        when(employeurService.getOffres("employeur@entreprise.com")).thenReturn(offres);

//        ACT
        ResponseEntity<Object> response = employeurController.getOffres(authentication);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offres, response.getBody());
    }

    @Test
    void testGetOffres_erreur_retourneBadRequest() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        when(employeurService.getOffres("employeur@entreprise.com"))
                        .thenThrow(new Exception("Utilisateur non trouvé"));

//        ACT
        ResponseEntity<Object> response = employeurController.getOffres(authentication);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Utilisateur non trouvé", response.getBody());
    }

    @Test
    void getCandidatures_shouldReturnOkAndList() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        List<CandidatureDto> list = List.of();
        when(employeurService.getCandidatures(1L, "employeur@entreprise.com")).thenReturn(list);
//        ACT
        ResponseEntity<Object> response = employeurController.getCandidatures(1L, authentication);
//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(list, response.getBody());
    }

    @Test
    void getCandidatures_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        when(employeurService.getCandidatures(1L, "employeur@entreprise.com")).thenThrow(new Exception("Erreur"));
//        ACT
        ResponseEntity<Object> response = employeurController.getCandidatures(1L, authentication);
//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur", response.getBody());
    }

    @Test
    void getCvCandidat_shouldReturnPdf() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        byte[] fakePdf = new byte[]{1, 2, 3};
        when(employeurService.getCvCandidat(1L, "employeur@entreprise.com")).thenReturn(fakePdf);
//        ACT
        ResponseEntity<Object> response = employeurController.getCvCandidat(1L, authentication);
//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(fakePdf, response.getBody());
    }

    @Test
    void getCvCandidat_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        when(employeurService.getCvCandidat(1L, "employeur@entreprise.com")).thenThrow(new Exception("CV introuvable"));
//        ACT
        ResponseEntity<Object> response = employeurController.getCvCandidat(1L, authentication);
//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("CV introuvable", response.getBody());
    }
}
