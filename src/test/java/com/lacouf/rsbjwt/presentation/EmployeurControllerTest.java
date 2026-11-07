package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.auth.Role;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.presentation.RequestDto.ModifierOffreRequest;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationConvocationRequest;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import java.time.Instant;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.ConvocationService;
import com.lacouf.rsbjwt.service.EmployeurService;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import java.time.LocalDateTime;
import java.util.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeurControllerTest {
    @Mock
    private UserAppService userAppService;

    @Mock
    private EmployeurService employeurService;

    @Mock
    private ConvocationService convocationService;

    @InjectMocks
    private EmployeurController employeurController;

    private ConvocationDto createDummyConvocationDto() {
        return new ConvocationDto(
                1L, "Message", StatutConvocation.EN_ATTENTE, Instant.now().plusSeconds(3600),
                List.of(), null, null
        );
    }

    private EmployeurDto createDummyEmployeurDto() {
        return new EmployeurDto(1, "Valentin", "Dimitrov", "employeur@test.com", Role.EMPLOYEUR, "CGI Inc.", "514-555-1234");
    }

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

        EmployeurDto employeurDto = createDummyEmployeurDto();

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
        ResponseEntity<Object> response = employeurController.getOffres(null, authentication);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offres, response.getBody());
    }

    @Test
    void testGetOffres_avecAnnee_succes() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        List<OffreStageDto> offres = List.of(
                new OffreStageDto(1, "Titre 2025", "Desc", "Ent", StatusAcceptation.ACCEPTE, "",
                        "info", "25$/h", "15 semaines", "Java", List.of(), 2025));

        when(employeurService.getOffres("employeur@entreprise.com", 2025)).thenReturn(offres);

//        ACT
        ResponseEntity<Object> response = employeurController.getOffres(2025, authentication);

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
        ResponseEntity<Object> response = employeurController.getOffres(null, authentication);

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
	void embaucherCandidature_shouldReturnOkAndDto() throws Exception {
		Authentication authentication = mock(Authentication.class);
		when(authentication.getName()).thenReturn("employeur@entreprise.com");

		CandidatureDto dto = new CandidatureDto(1, StatutCandidature.EMBAUCHEE, LocalDateTime.now(), null, null, LocalDateTime.now());
		when(employeurService.embaucherCandidature(1L, "employeur@entreprise.com")).thenReturn(dto);

		ResponseEntity<Object> response = employeurController.embaucherCandidature(1L, authentication);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(dto, response.getBody());
	}

	@Test
	void embaucherCandidature_shouldReturnBadRequestOnException() throws Exception {
		Authentication authentication = mock(Authentication.class);
		when(authentication.getName()).thenReturn("employeur@entreprise.com");

		when(employeurService.embaucherCandidature(1L, "employeur@entreprise.com"))
				.thenThrow(new Exception("L'entrevue doit être confirmée par l'étudiant avant l'embauche"));

		ResponseEntity<Object> response = employeurController.embaucherCandidature(1L, authentication);

		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertEquals("L'entrevue doit être confirmée par l'étudiant avant l'embauche", response.getBody());
	}

    @Test
    void getAnnees_shouldReturnOkAndList() throws Exception {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        List<Integer> annees = List.of(2026, 2025);
        when(employeurService.getAnnees("employeur@entreprise.com")).thenReturn(annees);

//        ACT
        ResponseEntity<Object> response = employeurController.getAnnees(authentication);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(annees, response.getBody());
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

    @Test
    void getConvocationsEmployeur_avecAnnee_shouldReturnOk() {
//        ARRANGE
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        List<ConvocationDto> convocations = List.of();
        when(convocationService.getConvocationsEmployeur("employeur@entreprise.com", 2025))
                .thenReturn(convocations);

//        ACT
        ResponseEntity<Object> response = employeurController.getConvocationsEmployeur(2025, authentication);

//        ASSERT
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(convocations, response.getBody());
    }

    @Test
    void convoquerCandidat_succes() throws Exception {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        CreationConvocationRequest request = new CreationConvocationRequest("Bienvenue", List.of());
        ConvocationDto convocationDto = createDummyConvocationDto();

        when(convocationService.creerConvocation("employeur@entreprise.com", 1L, request.rendezVousPossibles(), request.messageEmployeur()))
                .thenReturn(convocationDto);

        // Act
        ResponseEntity<Object> response = employeurController.convoquerCandidat(1L, request, authentication);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(convocationDto, response.getBody());
    }

    @Test
    void convoquerCandidat_erreur_retourneBadRequest() throws Exception {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        CreationConvocationRequest request = new CreationConvocationRequest("Bienvenue", List.of());

        when(convocationService.creerConvocation("employeur@entreprise.com", 1L, request.rendezVousPossibles(), request.messageEmployeur()))
                .thenThrow(new Exception("Erreur de convocation"));

        // Act
        ResponseEntity<Object> response = employeurController.convoquerCandidat(1L, request, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(Map.of("message", "Erreur de convocation"), response.getBody());
    }

    @Test
    void getConvocationsEmployeur_sansAnnee_shouldReturnOk() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        List<ConvocationDto> convocations = List.of(createDummyConvocationDto());
        when(convocationService.getConvocationsEmployeur("employeur@entreprise.com")).thenReturn(convocations);

        // Act
        ResponseEntity<Object> response = employeurController.getConvocationsEmployeur(null, authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(convocations, response.getBody());
    }

    @Test
    void getConvocationsEmployeur_erreur_shouldReturnBadRequest() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        when(convocationService.getConvocationsEmployeur("employeur@entreprise.com"))
                .thenThrow(new RuntimeException("Erreur convocations"));

        // Act
        ResponseEntity<Object> response = employeurController.getConvocationsEmployeur(null, authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur convocations", response.getBody());
    }

    @Test
    void getOffres_surchargeSansAnnee() throws Exception {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        List<OffreStageDto> offres = List.of(
                new OffreStageDto(1, "Titre", "Desc", "Ent", StatusAcceptation.EN_ATTENTE, "")
        );
        when(employeurService.getOffres("employeur@entreprise.com")).thenReturn(offres);

        // Act
        ResponseEntity<Object> response = employeurController.getOffres(authentication);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(offres, response.getBody());
    }

    @Test
    void getAnnees_erreur_retourneBadRequest() throws Exception {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");
        when(employeurService.getAnnees("employeur@entreprise.com")).thenThrow(new Exception("Erreur annees"));

        // Act
        ResponseEntity<Object> response = employeurController.getAnnees(authentication);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur annees", response.getBody());
    }

    @Test
    void testCreerOffre_avecAnnee_succes() throws Exception {
        // Arrange
        Map<String, String> request = new HashMap<>();
        request.put("titre", "Stagiaire");
        request.put("nomEntreprise", "CGI");
        request.put("description", "Dev web");
        request.put("discipline", "info");
        request.put("duree", "15 sem");
        request.put("salaire", "25$/h");
        request.put("exigences", "Java");
        request.put("annee", "2026");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        OffreStageDto offreDto = new OffreStageDto(1, "Stagiaire", "Dev web", "CGI", StatusAcceptation.EN_ATTENTE, null, new ArrayList<>());
        when(employeurService.createOffreStage("Stagiaire", "CGI", "Dev web", "info", "15 sem", "25$/h", "Java", "employeur@entreprise.com", 2026))
                .thenReturn(offreDto);

        // Act
        ResponseEntity<Object> response = employeurController.creerOffre(request, authentication);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void testCreerOffre_avecChampsOptionnelsSansAnnee_succes() throws Exception {
        // Arrange
        Map<String, String> request = new HashMap<>();
        request.put("titre", "Stagiaire");
        request.put("nomEntreprise", "CGI");
        request.put("description", "Dev web");
        request.put("discipline", "info");
        request.put("duree", "15 sem");
        request.put("salaire", "25$/h");
        request.put("exigences", "Java");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        OffreStageDto offreDto = new OffreStageDto(1, "Stagiaire", "Dev web", "CGI", StatusAcceptation.EN_ATTENTE, null, new ArrayList<>());
        when(employeurService.createOffreStage("Stagiaire", "CGI", "Dev web", "info", "15 sem", "25$/h", "Java", "employeur@entreprise.com"))
                .thenReturn(offreDto);

        // Act
        ResponseEntity<Object> response = employeurController.creerOffre(request, authentication);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }

    @Test
    void testCreerOffre_avecAnneeInvalide_succes() throws Exception {
        // Arrange
        Map<String, String> request = new HashMap<>();
        request.put("titre", "Stagiaire");
        request.put("nomEntreprise", "CGI");
        request.put("description", "Dev web");
        request.put("annee", "non-nombre");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("employeur@entreprise.com");

        OffreStageDto offreDto = new OffreStageDto(1, "Stagiaire", "Dev web", "CGI", StatusAcceptation.EN_ATTENTE, null, new ArrayList<>());
        when(employeurService.createOffreStage("Stagiaire", "CGI", "Dev web", "employeur@entreprise.com"))
                .thenReturn(offreDto);

        // Act
        ResponseEntity<Object> response = employeurController.creerOffre(request, authentication);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(offreDto, response.getBody());
    }
}