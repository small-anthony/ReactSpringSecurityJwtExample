package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.EmployeurDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserAppServiceTest {
    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAppService userAppService;

    // --- Tests Étudiant ---

    @Test
    void registerStudent_shouldCreateStudent() throws Exception {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("password123"))
                .thenReturn("passwordEncode");

        Credentials credentials = new Credentials("test@gmail.com", "passwordEncode", Role.ETUDIANT);

        Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiant.setId(1L);

        when(etudiantRepository.save(any(Etudiant.class)))
                .thenReturn(etudiant);

        //ACT
        EtudiantDto result = userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "password123");

        //ASSERT
        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals("Peter", result.firstName());
        assertEquals("Parker", result.lastName());
        assertEquals("test@gmail.com", result.email());
        assertEquals(Role.ETUDIANT, result.role());
        assertEquals(12345, result.matricule());
        assertEquals("Informatique", result.discipline());
    }

    @Test
    void registerStudent_shouldRejectInvalidEmail() {
        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "emailInvalide", "Informatique", "password123", "password123"));

        //ASSERT
        assertEquals("Le format de l'email est invalide", exception.getMessage());
    }

    @Test
    void registerStudent_shouldRejectExistingEmail() {
        //ARRANGE
        UserApp user = mock(UserApp.class);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "password123"));

        //ASSERT
        assertEquals("Un compte avec cet email existe déjà", exception.getMessage());
    }

    @Test
    void registerStudent_shouldRejectDifferentPasswords() {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "password123", "differentPassword"));

        //ASSERT
        assertEquals("Les mots de passe ne correspondent pas", exception.getMessage());
    }

    @Test
    void registerStudent_shouldRejectShortPassword() {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerStudent("Peter", "Parker", 12345, "test@gmail.com", "Informatique", "abc", "abc"));

        //ASSERT
        assertEquals("Le mot de passe doit contenir au moins 8 caractères", exception.getMessage());
    }

    // --- Tests Employeur ---

    @Test
    void registerEmployeur_shouldCreateEmployeur() throws Exception {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("password"))
                .thenReturn("encodedPassword");

        Credentials credentials = new Credentials("test@gmail.com", "encodedPassword", Role.EMPLOYEUR);

        Employeur employeur = new Employeur("Jimmy", "Donaldson", credentials, "Entreprise", "514 111 1111");
        employeur.setId(1L);

        when(employeurRepository.save(any(Employeur.class)))
                .thenReturn(employeur);

        //ACT
        EmployeurDto resultat = userAppService.registerEmployeur("Jimmy", "Donaldson", "test@gmail.com", "Entreprise", "514 111 1111", "password", "password");

        //ASSERT
        assertNotNull(resultat);
        assertEquals(1, resultat.id());
        assertEquals("Jimmy", resultat.firstName());
        assertEquals("Donaldson", resultat.lastName());
        assertEquals("test@gmail.com", resultat.email());
        assertEquals("Entreprise", resultat.entreprise());
        assertEquals("514 111 1111", resultat.telephone());
        assertEquals(Role.EMPLOYEUR, resultat.role());
    }

    @Test
    void registerEmployeur_shouldRejectInvalidEmail() {
        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerEmployeur("Jimmy", "Donaldson", "testgmail.com", "Entreprise", "514 111 1111", "password", "password"));

        //ASSERT
        assertEquals("Le format du courriel n'est pas valide", exception.getMessage());
    }

    @Test
    void registerEmployeur_shouldRejectExistingEmail() {
        //ARRANGE
        UserApp userApp = mock(UserApp.class);
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(userApp));

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerEmployeur("Jimmy", "Donaldson", "test@gmail.com", "Entreprise", "514 111 1111", "password", "password"));

        //ASSERT
        assertEquals("Un compte avec cet email existe déjà", exception.getMessage());
    }

    @Test
    void registerEmployeur_shouldRejectShortPassword() {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerEmployeur("Jimmy", "Donaldson", "test@gmail.com", "Entreprise", "514 111 1111", "abc", "abc"));

        //ASSERT
        assertEquals("Le mot de passe doit contenir au moins 8 caractères", exception.getMessage());
    }

    @Test
    void registerEmployeur_shouldRejectDifferentPasswords() {
        //ARRANGE
        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

        //ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.registerEmployeur("Jimmy", "Donaldson", "test@gmail.com", "Entreprise", "514 111 1111", "password", "anotherPassword"));

        //ASSERT
        assertEquals("Les mots de passe ne correspondent pas", exception.getMessage());
    }
}
