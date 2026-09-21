package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfesseurControllerTest {

    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private ProfesseurController professeurController;

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
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "jean.tremblay@cegep.ca");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "motdepasse123");

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "jean.tremblay@cegep.ca", "motdepasse123", "motdepasse123"
        )).thenThrow(new Exception("Un compte avec cet email existe deja"));

        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Un compte avec cet email existe deja", response.getBody());
    }

    @Test
    void signUpProfesseur_avecMotsDePasseDifferents_retourne400AvecMessage() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("firstName", "Jean");
        request.put("lastName", "Tremblay");
        request.put("email", "jean.tremblay@cegep.ca");
        request.put("password", "motdepasse123");
        request.put("passwordConfirmation", "autreMotDePasse");

        when(userAppService.registerProfesseur(
                "Jean", "Tremblay", "jean.tremblay@cegep.ca", "motdepasse123", "autreMotDePasse"
        )).thenThrow(new Exception("Les mots de passe ne correspondent pas"));

        ResponseEntity<Object> response = professeurController.signUpProfesseur(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Les mots de passe ne correspondent pas", response.getBody());
    }
}