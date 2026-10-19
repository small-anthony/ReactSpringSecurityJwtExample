package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.presentation.RequestDto.ModifierOffreRequest;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.EmployeurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.HistoriqueCandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.*; //?

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*; //?

@ExtendWith(MockitoExtension.class)
public class EmployeurControllerTest {
    @Mock
    private UserAppService userAppService;

    @Mock
    private EmployeurService employeurService;

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private OffreStageRepository offreStageRepository;

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

    @Test
    void refuserCandidature_avecMessage_shouldReturnOkAndDto() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        Map<String, String> request = new HashMap<>();
        request.put("message", "Profil non retenu");

        CandidatureDto dto = new CandidatureDto(1, StatutCandidature.REFUSEE, LocalDateTime.now(), null, "Profil non retenu", LocalDateTime.now());
        when(employeurService.refuserCandidature(1L, "Profil non retenu", "employeur@entreprise.com")).thenReturn(dto);
//        ACT
        ResponseEntity<Object> response = employeurController.refuserCandidature(1L, request, authentication);
//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

	@Test
	void refuserCandidature_sansCorps_shouldAppelerLeServiceAvecMessageNul() throws Exception {
//        ARRANGE
		Authentication authentication = mock(Authentication.class);
		when(authentication.getName()).thenReturn("employeur@entreprise.com");

		CandidatureDto dto = new CandidatureDto(1, StatutCandidature.REFUSEE, LocalDateTime.now(), null, null, LocalDateTime.now());
		when(employeurService.refuserCandidature(1L, null, "employeur@entreprise.com")).thenReturn(dto);
//        ACT
		ResponseEntity<Object> response = employeurController.refuserCandidature(1L, null, authentication);
//        ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void refuserCandidature_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
		Authentication authentication = mock(Authentication.class);
		when(authentication.getName()).thenReturn("employeur@entreprise.com");

		when(employeurService.refuserCandidature(1L, null, "employeur@entreprise.com"))
				.thenThrow(new Exception("Candidature introuvable pour cet employeur"));
//        ACT
		ResponseEntity<Object> response = employeurController.refuserCandidature(1L, null, authentication);
//        ASSERT
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals("Candidature introuvable pour cet employeur", response.getBody());
	}

	@Test
	void getHistorique_shouldReturnOkAndList() {
//        ARRANGE
		Authentication authentication = mock(Authentication.class);
		when(authentication.getName()).thenReturn("employeur@entreprise.com");

		List<HistoriqueCandidatureDto> historique = List.of(
				new HistoriqueCandidatureDto(1L, "Sophie Martin", "Stagiaire en informatique",
						StatutCandidature.EN_ATTENTE, StatutCandidature.ACCEPTEE, null, LocalDateTime.now()));
		when(employeurService.getHistorique("employeur@entreprise.com")).thenReturn(historique);
//        ACT
		ResponseEntity<Object> response = employeurController.getHistorique(authentication);
//        ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(historique, response.getBody());
	}

    @Test
    void deleteOffre_shouldReturnNoContent() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);

        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        doNothing().when(employeurService).deleteOffre(1L, "employeur@entreprise.com");

//        ACT
        ResponseEntity<Object> response = employeurController.deleteOffre(1L, authentication);

//        ASSERT
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }
    @Test
    void deleteOffre_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);

        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        doThrow(new Exception("Offre introuvable pour cet employeur"))
                .when(employeurService).deleteOffre(1L, "employeur@entreprise.com");

//        ACT
        ResponseEntity<Object> response = employeurController.deleteOffre(1L, authentication);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Offre introuvable pour cet employeur", response.getBody());
    }

    @Test
    void updateOffre_shouldReturnOk() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);

        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        ModifierOffreRequest request = new ModifierOffreRequest(1L, "Stagiaire en informatique", "CGI",
                "Développement web React et Spring Boot", "info", "15 semaines", "25$/h", "Java et React");

        OffreStageDto offreDto = new OffreStageDto(1, "Stagiaire en informatique", "Développement web React et Spring Boot",
                "CGI", StatusAcceptation.EN_ATTENTE, null, "info", "25$/h", "15 semaines", "Java et React");

        when(employeurService.updateOffreStage(1L, "Stagiaire en informatique", "CGI",
                "Développement web React et Spring Boot", "info", "15 semaines", "25$/h", "Java et React",
                "employeur@entreprise.com"))
                .thenReturn(offreDto);

//        ACT
        ResponseEntity<Object> response = employeurController.updateOffre(request, authentication);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }
    @Test
    void updateOffre_shouldReturnBadRequestOnException() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);

        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        ModifierOffreRequest request = new ModifierOffreRequest(1L, "", "CGI",
                "Développement web React et Spring Boot", "info", "15 semaines", "25$/h", "Java et React");

        when(employeurService.updateOffreStage(1L, "", "CGI",
                "Développement web React et Spring Boot", "info", "15 semaines", "25$/h", "Java et React",
                "employeur@entreprise.com"))
                .thenThrow(new Exception("Le titre est obligatoire"));
//        ACT
        ResponseEntity<Object> response = employeurController.updateOffre(request, authentication);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le titre est obligatoire", response.getBody());
    }
}
