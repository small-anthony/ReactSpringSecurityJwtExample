package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import com.lacouf.rsbjwt.service.ProfesseurService;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import org.springframework.security.core.Authentication;
import static org.mockito.Mockito.mock;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfesseurControllerTest {

    @Mock
    private UserAppService userAppService;

    @Mock
    private OffreStageRepository offreStageRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private ProfesseurService professeurService;

    @InjectMocks
    private ProfesseurController professeurController;

    private EtudiantSuperviseDto createDummyEtudiantSuperviseDto() {
        return new EtudiantSuperviseDto(
                1L, "Sophie", "Martin", "sophie@test.com", 123456, "informatique",
                "EMBAUCHEE", "CGI", "Dev Web", List.of()
        );
    }

    @Test
    void signUpProfesseur_avecDonneesValides_retourne201EtLeDto() throws Exception {
        // Arrange
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "jean.tremblay@cegep.ca");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "motdepasse123");

        ProfesseurDto professeurDto = new ProfesseurDto(
                1, "Jean", "Tremblay", "jean.tremblay@cegep.ca", Role.PROFESSEUR
        );

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "jean.tremblay@cegep.ca", "motdepasse123", "motdepasse123"
        )).thenReturn(professeurDto);

        // Act
        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(professeurDto, response.getBody());
    }

    @Test
    void signUpProfesseur_avecEmailInvalide_retourne400AvecMessage() throws Exception {
        // Arrange
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "pas-un-email");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "motdepasse123");

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "pas-un-email", "motdepasse123", "motdepasse123"
        )).thenThrow(new Exception("Le format du courriel n'est pas valide."));

        // Act
        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le format du courriel n'est pas valide.", response.getBody());
    }

    @Test
    void signUpProfesseur_avecEmailDejaExistant_retourne400AvecMessage() throws Exception {
//        Arrange
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "jean.tremblay@cegep.ca");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "motdepasse123");

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "jean.tremblay@cegep.ca", "motdepasse123", "motdepasse123"
        )).thenThrow(new Exception("Un compte avec cet email existe deja"));

//        Act
        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

//        Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Un compte avec cet email existe deja", response.getBody());
    }

    @Test
    void signUpProfesseur_avecMotsDePasseDifferents_retourne400AvecMessage() throws Exception {
//        Arrange
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "jean.tremblay@cegep.ca");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "autreMotDePasse");

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "jean.tremblay@cegep.ca", "motdepasse123", "autreMotDePasse"
        )).thenThrow(new Exception("Les mots de passe ne correspondent pas"));

//        Act
        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

//        Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Les mots de passe ne correspondent pas", response.getBody());
    }

    @Test
    void getOffres_avecAnnee_retourneOffresAnnee() throws Exception {
//        Arrange
        OffreStage offre = new OffreStage("Stage Dev", "Desc", "CGI", "info", "25$/h", "15 semaines", "Java", 2025);
        offre.setId(1L);
        offre.accepter();

        when(offreStageRepository.findByApprobationStatusAndAnnee(StatusAcceptation.ACCEPTE, 2025))
                .thenReturn(List.of(offre));

//        Act
        ResponseEntity<List<OffreStageDto>> response = professeurController.getOffres(2025);

//        Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(2025, response.getBody().getFirst().annee());
    }

    @Test
    void getCandidatures_avecAnnee_retourneCandidaturesAnnee() {
//        Arrange
        Etudiant etudiant = new Etudiant("Sophie", "Martin",
                new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);

        OffreStage offre = new OffreStage("Stage Dev", "Desc", "CGI", "info", "25$/h", "15 semaines", "Java", 2025);
        offre.setId(10L);

        Candidature cand = new Candidature(etudiant, offre);
        ReflectionTestUtils.setField(cand, "id", 100L);

        when(candidatureRepository.findByAnnee(2025)).thenReturn(List.of(cand));

//        Act
        ResponseEntity<List<CandidatureDto>> response = professeurController.getCandidatures(2025);

//        Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getMesEtudiants_succes_retourneListe() throws Exception {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("martin@test.com");
        List<EtudiantSuperviseDto> liste = List.of(createDummyEtudiantSuperviseDto());
        when(professeurService.getEtudiantsAssignes("martin@test.com", 2026)).thenReturn(liste);

        // Act
        ResponseEntity<?> response = professeurController.getMesEtudiants(auth, 2026);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(liste, response.getBody());
    }

    @Test
    void getMesEtudiants_erreur_retourneBadRequest() throws Exception {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("martin@test.com");
        when(professeurService.getEtudiantsAssignes("martin@test.com", 2026)).thenThrow(new Exception("Erreur"));

        // Act
        ResponseEntity<?> response = professeurController.getMesEtudiants(auth, 2026);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Erreur", response.getBody());
    }

    @Test
    void getMonEtudiantDetail_succes_retourneEtudiant() throws Exception {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("martin@test.com");
        EtudiantSuperviseDto dto = createDummyEtudiantSuperviseDto();
        when(professeurService.getEtudiantDetail(1L, "martin@test.com")).thenReturn(dto);

        // Act
        ResponseEntity<?> response = professeurController.getMonEtudiantDetail(1L, auth);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void getMonEtudiantDetail_erreur_retourneBadRequest() throws Exception {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("martin@test.com");
        when(professeurService.getEtudiantDetail(1L, "martin@test.com")).thenThrow(new Exception("Non trouvé"));

        // Act
        ResponseEntity<?> response = professeurController.getMonEtudiantDetail(1L, auth);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Non trouvé", response.getBody());
    }

    @Test
    void getAnnees_retourneAnneesTriees() {
//        Arrange
        when(offreStageRepository.findDistinctAnnees()).thenReturn(List.of(2025));

//        Act
        ResponseEntity<Object> response = professeurController.getAnnees();

//        Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertInstanceOf(List.class, response.getBody());
    }
}