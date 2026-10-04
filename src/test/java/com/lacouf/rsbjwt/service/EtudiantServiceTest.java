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
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.StatutCvDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EtudiantServiceTest {
        @Mock
        UserAppRepository userAppRepository;

        @Mock
        EtudiantRepository etudiantRepository;

        @Mock
        OffreStageRepository offreStageRepository;

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

        @Test
        void getEtudiantByMatricule_succes() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");

                etudiant.setId(1L);

                when(etudiantRepository.findByMatricule(12345)).thenReturn(Optional.of(etudiant));

                // ACT
                EtudiantDto resultat = etudiantService.getEtudiantByMatricule(12345);

                // ASSERT
                assertNotNull(resultat);
                assertEquals(12345, resultat.matricule());
                assertEquals("Peter", resultat.firstName());
        }

        @Test
        void getEtudiantByMatricule_introuvable_lanceException() {
                // ARRANGE
                when(etudiantRepository.findByMatricule(99999)).thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                                () -> etudiantService.getEtudiantByMatricule(99999));

                // ASSERT
                assertEquals("Aucun étudiant trouvé avec ce matricule", exception.getMessage());
        }

        // ==========================================
        // Tests pour getStatutCv
        // ==========================================

        @Test
        void getStatutCv_sansCv_retourneHasCvFalse() {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                // ACT
                StatutCvDto resultat = etudiantService.getStatutCv("etudiant@gmail.com");

                // ASSERT
                assertNotNull(resultat);
                assertFalse(resultat.hasCv());
                assertNull(resultat.status());
        }

        @Test
        void getStatutCv_avecCvApprouve_retourneStatusAccepte() {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);
                etudiant.setCv(new byte[] { 1, 2, 3 });
                etudiant.getCv().accepterApprobation();

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                // ACT
                StatutCvDto resultat = etudiantService.getStatutCv("etudiant@gmail.com");

                // ASSERT
                assertNotNull(resultat);
                assertTrue(resultat.hasCv());
                assertEquals(StatusAcceptation.ACCEPTE, resultat.status());
        }

        // ==========================================
        // Tests pour getOffresDisponibles
        // ==========================================

        @Test
        void getOffresDisponibles_cvNonApprouve_lanceExceptionForbidden() {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);
                etudiant.setCv(new byte[] { 1, 2, 3 });

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                // ACT & ASSERT
                ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                                () -> etudiantService.getOffresDisponibles("etudiant@gmail.com"));

                assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
                assertTrue(exception.getReason().contains("Accès refusé"));
        }

        @Test
        void getOffresDisponibles_cvApprouve_retourneOffresFiltrees() {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);
                etudiant.setCv(new byte[] { 1, 2, 3 });
                etudiant.getCv().accepterApprobation();

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                OffreStage offrePublique = new OffreStage("Stage Dev", "Desc", "CGI", "Informatique", "25$/h",
                                "15 semaines", "Java");
                offrePublique.setId(10L);
                offrePublique.getEtudiantsAutorises().clear(); // Publique

                when(offreStageRepository.findByApprobationStatus(StatusAcceptation.ACCEPTE))
                                .thenReturn(List.of(offrePublique));

                // ACT
                List<OffreStageDto> resultat = etudiantService.getOffresDisponibles("etudiant@gmail.com");

                // ASSERT
                assertNotNull(resultat);
                assertEquals(1, resultat.size());
                assertEquals("Stage Dev", resultat.get(0).titre());
        }

        // ==========================================
        // Tests pour getOffreDetail
        // ==========================================

        @Test
        void getOffreDetail_succes_retourneDetailOffre() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);
                etudiant.setCv(new byte[] { 1, 2, 3 });
                etudiant.getCv().accepterApprobation();

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                OffreStage offre = new OffreStage("Stage Dev", "Desc", "CGI", "Informatique", "25$/h", "15 semaines",
                                "Java");
                offre.setId(10L);
                offre.accepter();
                offre.getEtudiantsAutorises().clear();

                when(offreStageRepository.findById(10L)).thenReturn(Optional.of(offre));

                // ACT
                OffreStageDto resultat = etudiantService.getOffreDetail(10L, "etudiant@gmail.com");

                // ASSERT
                assertNotNull(resultat);
                assertEquals("Stage Dev", resultat.titre());
                assertEquals("CGI", resultat.nomEntreprise());
        }

        @Test
        void getOffreDetail_offreInexistante_lanceExceptionNotFound() {
                // ARRANGE
                Credentials credentials = new Credentials("etudiant@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);
                etudiant.setCv(new byte[] { 1, 2, 3 });
                etudiant.getCv().accepterApprobation();

                when(userAppRepository.findUserAppByEmail("etudiant@gmail.com")).thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

                when(offreStageRepository.findById(999L)).thenReturn(Optional.empty());

                // ACT & ASSERT
                ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                                () -> etudiantService.getOffreDetail(999L, "etudiant@gmail.com"));

                assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        }
}
