package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.security.JwtTokenProvider;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserAppServiceTest {
    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAppService userAppService;


    @Test
    void registerStudent_shouldCreateStudent() throws Exception {

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("password123"))
                .thenReturn("passwordEncode");


        Credentials credentials = new Credentials("test@gmail.com", "passwordEncode", Role.ETUDIANT);

        Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiant.setId(1L);

        when(etudiantRepository.save(any(Etudiant.class)))
                .thenReturn(etudiant);

        EtudiantDto result = userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "password123");

        assertNotNull(result);

        verify(userAppRepository).findUserAppByEmail("test@gmail.com");
        verify(passwordEncoder).encode("password123");
        verify(etudiantRepository).save(any(Etudiant.class));
    }

    @Test
    void registerStudent_shouldRejectInvalidEmail() {

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "emailInvalide", "Informatique", "password123", "password123"));

        assertEquals("Le format de l'email est invalide", exception.getMessage());

        verify(userAppRepository, never()).findUserAppByEmail(anyString());
    }

    @Test
    void registerStudent_shouldRejectExistingEmail() {

        UserApp user = mock(UserApp.class);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "password123"));

        assertEquals("Un compte avec cet email existe déjà", exception.getMessage());

        verify(passwordEncoder, never()).encode(anyString());
        verify(etudiantRepository, never()).save(any(Etudiant.class));
    }

    @Test
    void registerStudent_shouldRejectDifferentPasswords() {

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "differentPassword"));

        assertEquals("Les mots de passe ne correspondent pas", exception.getMessage());

        verify(passwordEncoder, never()).encode(anyString());
        verify(etudiantRepository, never()).save(any(Etudiant.class));
    }

    @Test
    void registerStudent_shouldRejectShortPassword() {

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "abc", "abc"));

        assertEquals("Le mot de passe doit contenir au moins 8 caractères", exception.getMessage());

        verify(passwordEncoder, never()).encode(anyString());
        verify(etudiantRepository, never()).save(any(Etudiant.class));
    }
}
