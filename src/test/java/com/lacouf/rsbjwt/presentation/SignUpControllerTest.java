package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SignUpControllerTest {
    @Mock
    private UserAppService userAppService;

    @InjectMocks
    private SignUpController signUpController;

    @Test
    void signUpEmployeur_shouldReturnCreated() throws Exception {
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
        ResponseEntity<Object> response = signUpController.signUpEtudiant(request);

//        ASSERT
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(etudiantDto, response.getBody());
    }

    @Test
    void signUpEmployeur_shouldReturnBadRequestOnException() throws Exception {
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
        ResponseEntity<Object> response = signUpController.signUpEtudiant(request);

//        ASSERT
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Le format de l'email est invalide", response.getBody());
    }
}
