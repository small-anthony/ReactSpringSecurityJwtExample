package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.security.JwtTokenProvider;
import com.lacouf.rsbjwt.service.dto.ProfesseurDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAppServiceTest {

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAppService userAppService;

    private final String firstName = "Jean";
    private final String lastName = "Tremblay";
    private final String email = "jean.tremblay@cegep.ca";
    private final String password = "motdepasse123";

    @Test
    void registerProfesseur_avecDonneesValides_creeLeProfesseur() throws Exception {
        // Arrange
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");

        Professeur professeurSauvegarde = new Professeur(
                firstName, lastName,
                new Credentials(email, "hashedPassword", com.lacouf.rsbjwt.model.auth.Role.PROFESSEUR)
        );

       professeurSauvegarde.setId(1L);

        when(professeurRepository.save(any(Professeur.class))).thenReturn(professeurSauvegarde);

        // Act
        ProfesseurDto result = userAppService.registerProfesseur(
                firstName, lastName, email, password, password
        );

        // Assert
        assertNotNull(result);
        assertEquals(firstName, result.firstName());
        assertEquals(lastName, result.lastName());
        assertEquals(email, result.email());

        verify(passwordEncoder).encode(password);
        verify(professeurRepository).save(any(Professeur.class));
    }

    @Test
    void registerProfesseur_avecEmailInvalide_lanceUneException() {
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerProfesseur(firstName, lastName, "pas-un-email", password, password)
        );

        assertEquals("Le format du courriel n'est pas valide.", exception.getMessage());
        verifyNoInteractions(professeurRepository);
    }

    @Test
    void registerProfesseur_avecEmailDejaExistant_lanceUneException() {
        when(userAppRepository.findUserAppByEmail(email))
                .thenReturn(Optional.of(mock(com.lacouf.rsbjwt.model.UserApp.class)));

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerProfesseur(firstName, lastName, email, password, password)
        );

        assertEquals("Un compte avec cet email existe déjà", exception.getMessage());
        verify(professeurRepository, never()).save(any());
    }

    @Test
    void registerProfesseur_avecMotDePasseTropCourt_lanceUneException() {
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.empty());
        String motDePasseCourt = "abc123";

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerProfesseur(firstName, lastName, email, motDePasseCourt, motDePasseCourt)
        );

        assertEquals("Le mot de passe doit contenir au moins 8 caractères.", exception.getMessage());
        verify(professeurRepository, never()).save(any());
    }

    @Test
    void registerProfesseur_avecMotsDePasseDifferents_lanceUneException() {
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerProfesseur(firstName, lastName, email, password, "autreMotDePasse")
        );

        assertEquals("Les mots de passe ne correspondent pas", exception.getMessage());
        verify(professeurRepository, never()).save(any());
    }
}