package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EmployeurServiceTest {
    @Mock
    private UserAppRepository userAppRepository;
    @Mock
    private EmployeurRepository employeurRepository;
    @Mock
    private OffreStageRepository offreStageRepository;
    @InjectMocks
    private EmployeurService employeurService;

    @Test
    void testCreerOffre_succes() throws Exception {
        //ARRANGE
        String email = "employeur@entreprise.com";
        String titre = "Stagiaire en informatique";
        String nomEntreprise = "CGI";
        String description = "Développement d'applications web avec Spring Boot et React";

        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(1L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));

        Credentials credentials = new Credentials(email, "password123", Role.EMPLOYEUR);
        Employeur employeur = new Employeur("Jean", "Tremblay", credentials, nomEntreprise, "514-555-1234");
        employeur.setId(1L);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));

        OffreStage offreEnregistree = new OffreStage(titre, description, nomEntreprise);
        offreEnregistree.setId(1L);
        offreEnregistree.setEmployeur(employeur);
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offreEnregistree);

        //ACT
        OffreStageDto resultat = employeurService.createOffreStage(titre, nomEntreprise, description, email);

       //ASSERT
        assertNotNull(resultat);
        assertEquals(1, resultat.id());
        assertEquals(titre, resultat.titre());
        assertEquals(nomEntreprise, resultat.nomEntreprise());
        assertEquals(description, resultat.description());
    }

    @Test
    void testCreerOffre_titreVide_lanceException() {
//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("", "CGI", "Description valide", "employeur@entreprise.com"));

//      Assert
        assertEquals("Le titre est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_nomEntrepriseVide_lanceException() {
//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("Stagiaire en informatique", "", "Description valide", "employeur@entreprise.com"));

//      ASSERT
        assertEquals("Le nom de l'entreprise est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_descriptionVide_lanceException() {
//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("Stagiaire en informatique", "CGI", "", "employeur@entreprise.com"));

//      ASSERT
        assertEquals("La description est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_emailVide_lanceException() {
//      ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description valide", ""));

//      ASSERT
        assertEquals("Le courriel de l'employeur est obligatoire", exception.getMessage());
    }

    @Test
    void testCreerOffre_utilisateurIntrouvable_lanceException() {
//        ARRANGE
        String emailInexistant = "inconnu@entreprise.com";
        when(userAppRepository.findUserAppByEmail(emailInexistant)).thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description", emailInexistant));

//        Assert
        assertEquals("Utilisateur non trouvé avec l'email : " + emailInexistant, exception.getMessage());
    }

    @Test
    void testCreerOffre_employeurIntrouvable_lanceException() {
//        ARRANGE
        String email = "utilisateur@entreprise.com";
        UserApp userMock = mock(UserApp.class);
        when(userMock.getId()).thenReturn(99L);
        when(userAppRepository.findUserAppByEmail(email)).thenReturn(Optional.of(userMock));
        when(employeurRepository.findById(99L)).thenReturn(Optional.empty());

//        ACT
        Exception exception = assertThrows(Exception.class, () ->
                employeurService.createOffreStage("Stagiaire en informatique", "CGI", "Description", email));

//        ASSeRT
        assertEquals("Employeur non trouvé avec cette id", exception.getMessage());
    }
}