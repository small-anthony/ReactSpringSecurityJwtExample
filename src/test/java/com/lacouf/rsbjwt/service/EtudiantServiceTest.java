package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CvDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EtudiantServiceTest {
        @Mock
        UserAppRepository userAppRepository;

        @Mock
        EtudiantRepository etudiantRepository;

        @InjectMocks
        EtudiantService etudiantService;

        @Test
        void uploadCv_shouldUploadSuccessfully() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                                .thenReturn(Optional.of(etudiant));

                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(false);
                when(file.getContentType()).thenReturn("application/pdf");
                when(file.getBytes()).thenReturn(new byte[] { 1, 2, 3 });

                Etudiant etudiantSauvegarde = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiantSauvegarde.setId(1L);
                etudiantSauvegarde.setCv(new byte[] { 1, 2, 3 });
                etudiantSauvegarde.getCv().setId(10L);

                when(etudiantRepository.save(any(Etudiant.class))).thenReturn(etudiantSauvegarde);

                // ACT
                CvDto resultat = etudiantService.uploadCv("test@gmail.com", file);

                // ASSERT
                assertNotNull(resultat);
                assertEquals(10L, resultat.id());
        }

        @Test
        void uploadCv_shouldRejectIfUserNotFound() {
                // ARRANGE
                MultipartFile file = mock(MultipartFile.class);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                                .thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                                () -> etudiantService.uploadCv("test@gmail.com", file));

                // ASSERT
                assertEquals("Etudiant non trouvé", exception.getMessage());
        }

        @Test
        void uploadCv_shouldRejectIfFileIsEmpty() {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                                .thenReturn(Optional.of(etudiant));

                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(true);

                // ACT
                Exception exception = assertThrows(Exception.class,
                                () -> etudiantService.uploadCv("test@gmail.com", file));

                // ASSERT
                assertEquals("Veuillez sélectionner un fichier", exception.getMessage());
        }

        @Test
        void uploadCv_shouldRejectIfFileIsNotPdf() {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                                .thenReturn(Optional.of(etudiant));

                MultipartFile file = mock(MultipartFile.class);
                when(file.isEmpty()).thenReturn(false);
                when(file.getContentType()).thenReturn("image/png");

                // ACT
                Exception exception = assertThrows(Exception.class,
                                () -> etudiantService.uploadCv("test@gmail.com", file));

                // ASSERT
                assertEquals("Le fichier doit être un PDF", exception.getMessage());
        }
}
