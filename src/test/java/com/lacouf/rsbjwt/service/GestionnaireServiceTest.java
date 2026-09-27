package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GestionnaireServiceTest {

    @Mock
    private OffreStageRepository offreStageRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    public void accepterOffreStage_succes() throws Exception{
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1l);

        Etudiant etudiant = new Etudiant();
        etudiant.setId(2L);

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(etudiantRepository.findAllById(List.of(2L))).thenReturn(List.of(etudiant));
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offre);

        // ACT
        OffreStageDto resultat = gestionnaireService.accepterOffreStage(1L, List.of(2L));

        // ASSERT
        assertNotNull(resultat);
        assertEquals(StatusAcceptation.ACCEPTE, resultat.status());
        assertEquals(1, offre.getEtudiantsAutorises().size());
    }

    @Test
    void accepterOffreStage_offreIntrouvable_lanceException() {
        // ARRANGE
        when(offreStageRepository.findById(99L)).thenReturn(Optional.empty());

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.accepterOffreStage(99L, null));

        // ASSERT
        assertEquals("Offre de stage non trouvée", exception.getMessage());
    }

    @Test
    void accepterOffreStage_offreDejaTraitee_lanceException() throws Exception {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Desc", "CGI");
        offre.setId(1L);

        offre.accepter();

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));

        // ACT
        Exception exception = assertThrows(Exception.class, () ->
                gestionnaireService.accepterOffreStage(1L, null));

        // ASSERT
        assertEquals("Cette offre a déjà été traitée.", exception.getMessage());
    }

    @Test
    void refuserOffreStage_succes() throws Exception {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1L);

        when(offreStageRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreStageRepository.save(any(OffreStage.class))).thenReturn(offre);

        // ACT
        OffreStageDto resultat = gestionnaireService.refuserOffreStage(1L, "Refusé");

        // ASSERT
        assertNotNull(resultat);
        assertEquals(StatusAcceptation.REFUSE, resultat.status());
        assertEquals("Refusé", resultat.messageReponse());
    }

    @Test
    void getOffresEnAttente_succes() {
        // ARRANGE
        OffreStage offre = new OffreStage("Titre", "Description", "CGI");
        offre.setId(1L);

        when(offreStageRepository.findByApprobationStatus(StatusAcceptation.EN_ATTENTE))
                .thenReturn(List.of(offre));

        // ACT
        List<OffreStageDto> resultat = gestionnaireService.getOffresEnAttente();

        // ASSERT
        assertEquals(1, resultat.size());
        assertEquals(1, resultat.get(0).id());
    }

}
