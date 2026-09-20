package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
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
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAppService userAppService;


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
        //ARRANGE
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

    @Test
    void uploadCv_shouldUploadSuccessfully() throws Exception {
//        ARRANGE
        Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiant.setId(1L);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(etudiant));

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});

        Etudiant etudiantSauvegarde = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiantSauvegarde.setId(1L);
        etudiantSauvegarde.setCv(new byte[]{1, 2, 3});
        etudiantSauvegarde.getCv().setId(10L);

        when(etudiantRepository.save(any(Etudiant.class))).thenReturn(etudiantSauvegarde);

//        ACT
        CvDto resultat = userAppService.uploadCv("test@gmail.com", file);

//        ASSERT
        assertNotNull(resultat);
        assertEquals(10L, resultat.id());
    }

    @Test
    void uploadCv_shouldRejectIfUserNotFound() {
//        ARRANGE
        MultipartFile file = mock(MultipartFile.class);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.uploadCv("test@gmail.com", file));

//        ASSERT
        assertEquals("Utilisateur non trouvé", exception.getMessage());
    }

    @Test
    void uploadCv_shouldRejectIfFileIsEmpty() {
//        ARRANGE
        Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiant.setId(1L);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(etudiant));

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.uploadCv("test@gmail.com", file));

//        ASSERT
        assertEquals("Veuillez sélectionner un fichier", exception.getMessage());
    }

    @Test
    void uploadCv_shouldRejectIfFileIsNotPdf() {
//        ARRANGE
        Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
        Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
        etudiant.setId(1L);

        when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                .thenReturn(Optional.of(etudiant));

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.uploadCv("test@gmail.com", file));

//        ASSERT
        assertEquals("Le fichier doit être un PDF", exception.getMessage());
    }

    @Test
    void uploadCv_shouldRejectIfUserIsNotEtudiant() {
//        ARRANGE
        UserApp utilisateurEtudiant = mock(UserApp.class);

        when(userAppRepository.findUserAppByEmail("hacker@gmail.com"))
                .thenReturn(Optional.of(utilisateurEtudiant));

        MultipartFile file = mock(MultipartFile.class);

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                userAppService.uploadCv("hacker@gmail.com", file));

//        ASSERT
        assertEquals("Accès refusé", exception.getMessage());
    }
}
