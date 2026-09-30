package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EtudiantServiceTest {
        @Mock
        UserAppRepository userAppRepository;

        @Mock
        EtudiantRepository etudiantRepository;

        @Mock
        OffreStageRepository offreStageRepository;

        @Mock
        CandidatureRepository candidatureRepository;

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
        void postuler_shouldCreateCandidatureSuccessfully() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                OffreStage offre = new OffreStage("Développeur Web Junior", "Stage de quatre mois.", "TechCorp");
                offre.setId(10L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
                when(offreStageRepository.findById(10L)).thenReturn(Optional.of(offre));
                when(candidatureRepository.existsByEtudiantAndOffreStage(etudiant, offre)).thenReturn(false);
                when(candidatureRepository.save(any(Candidature.class))).thenAnswer(invocation -> {
                        Candidature candidature = invocation.getArgument(0);
                        ReflectionTestUtils.setField(candidature, "id", 100L);
                        return candidature;
                });

                // ACT
                OffreStageDto offreResultat = etudiantService.postuler(10L, "test@gmail.com");
                CandidatureDto candidatureResultat = offreResultat.candidatures().getFirst();
                EtudiantDto etudiantResultat = candidatureResultat.etudiant();

                // ASSERT
                assertEquals(100, candidatureResultat.id());
                assertEquals(10, offreResultat.id());
                assertEquals("Développeur Web Junior", offreResultat.titre());
                assertEquals("Peter", etudiantResultat.firstName());
                assertEquals("test@gmail.com", etudiantResultat.email());
                assertEquals("Informatique", etudiantResultat.discipline());
                assertEquals(StatutCandidature.EN_ATTENTE, candidatureResultat.statut());
                verify(candidatureRepository).save(any(Candidature.class));
        }

        @Test
        void postuler_shouldRejectIfAlreadyApplied() {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                OffreStage offre = new OffreStage("Développeur Web Junior", "Stage de quatre mois.", "TechCorp");
                offre.setId(10L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
                when(offreStageRepository.findById(10L)).thenReturn(Optional.of(offre));
                when(candidatureRepository.existsByEtudiantAndOffreStage(etudiant, offre)).thenReturn(true);

                // ACT
                Exception exception = assertThrows(Exception.class,
                        () -> etudiantService.postuler(10L, "test@gmail.com"));

                // ASSERT
                assertEquals("Vous avez déjà postulé à cette offre", exception.getMessage());
                verify(candidatureRepository, never()).save(any());
        }

        @Test
        void postuler_shouldRejectIfOffreNotFound() {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
                when(offreStageRepository.findById(99L)).thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                        () -> etudiantService.postuler(99L, "test@gmail.com"));

                // ASSERT
                assertEquals("Offre de stage introuvable", exception.getMessage());
                verify(candidatureRepository, never()).save(any());
        }

        @Test
        void postuler_shouldRejectIfUserIsNotAStudent() {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant utilisateur = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                utilisateur.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(utilisateur));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                        () -> etudiantService.postuler(10L, "test@gmail.com"));

                // ASSERT
                assertEquals("Etudiant non trouvé", exception.getMessage());
                verify(candidatureRepository, never()).save(any());
        }

        @Test
        void postuler_shouldRejectIfEmailUnknown() {
                // ARRANGE
                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                        () -> etudiantService.postuler(10L, "test@gmail.com"));

                // ASSERT
                assertEquals("Utilisateur non trouvé avec l'email : test@gmail.com", exception.getMessage());
                verify(candidatureRepository, never()).save(any());
        }

        @Test
        void getMesCandidatures_shouldReturnOffresWithMyCandidature() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                Credentials dummyCredentials = new Credentials("dummy@gmail.com", "password", Role.ETUDIANT);
                Etudiant dummyEtudiant = new Etudiant("John", "Bummet", dummyCredentials, 23456, "Something else");
                dummyEtudiant.setId(2L);

                OffreStage offre = new OffreStage("Développeur Web Junior", "Stage de quatre mois.", "TechCorp");
                offre.setId(10L);

                Candidature candidature = new Candidature(etudiant, offre);
                ReflectionTestUtils.setField(candidature, "id", 100L);
                offre.addCandidature(candidature);

                Candidature dummyCandidature = new Candidature(dummyEtudiant, offre);
                ReflectionTestUtils.setField(dummyCandidature, "id", 101L);
                offre.addCandidature(dummyCandidature);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
                when(offreStageRepository.findByEtudiant(etudiant)).thenReturn(List.of(offre));

                // ACT
                List<OffreStageDto> resultat = etudiantService.getMesCandidatures("test@gmail.com");

                // ASSERT
                assertEquals(1, resultat.size());
                OffreStageDto offreResultat = resultat.getFirst();

                assertEquals(1, offreResultat.candidatures().size());
                CandidatureDto candidatureResultat = offreResultat.candidatures().getFirst();
                assertEquals(StatutCandidature.EN_ATTENTE, candidatureResultat.statut());
                assertEquals(100, candidatureResultat.id());

                EtudiantDto etudiantResultat = candidatureResultat.etudiant();
                assertEquals(1, etudiantResultat.id());
                assertEquals("Peter", etudiantResultat.firstName());
        }

        @Test
        void getMesCandidatures_shouldReturnEmptyListIfNoCandidature() throws Exception {
                // ARRANGE
                Credentials credentials = new Credentials("test@gmail.com", "password", Role.ETUDIANT);
                Etudiant etudiant = new Etudiant("Peter", "Parker", credentials, 12345, "Informatique");
                etudiant.setId(1L);

                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.of(etudiant));
                when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
                when(offreStageRepository.findByEtudiant(etudiant)).thenReturn(List.of());

                // ACT
                List<OffreStageDto> resultat = etudiantService.getMesCandidatures("test@gmail.com");

                // ASSERT
                assertTrue(resultat.isEmpty());
        }

        @Test
        void getMesCandidatures_shouldRejectIfEmailUnknown() {
                // ARRANGE
                when(userAppRepository.findUserAppByEmail("test@gmail.com"))
                        .thenReturn(Optional.empty());

                // ACT
                Exception exception = assertThrows(Exception.class,
                        () -> etudiantService.getMesCandidatures("test@gmail.com"));

                // ASSERT
                assertEquals("Utilisateur non trouvé avec l'email : test@gmail.com", exception.getMessage());
        }
}