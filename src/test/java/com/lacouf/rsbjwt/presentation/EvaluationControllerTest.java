package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationRequest;
import com.lacouf.rsbjwt.service.EvaluationService;
import com.lacouf.rsbjwt.service.dto.EvaluationDto;
import com.lacouf.rsbjwt.service.dto.StagiaireDto;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EvaluationControllerTest {
    private static final String EMAIL = "employeur@entreprise.com";

    @Mock
    private EvaluationService evaluationService;

    @InjectMocks
    private EvaluationController evaluationController;

    private Authentication authentification() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(EMAIL);
        return authentication;
    }

    private StagiaireDto stagiaire() {
        return new StagiaireDto(7L, "Stagiaire en informatique", "Sophie Martin", "info", "CGI",
                "Jimmy Donaldson", "514 111 1111", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 4, 30), false);
    }

    private EvaluationDto evaluationDto() {
        return new EvaluationDto(7L, Map.of(), Map.of(), AppreciationGlobale.DEPASSENT_LES_ATTENTES,
                "précision", true, 7.5, AccueilProchainStage.OUI, "formation",
                "Jean Tremblay", "Directeur", Instant.now());
    }

    private EvaluationRequest requete() {
        return new EvaluationRequest(Map.of(), Map.of(), AppreciationGlobale.DEPASSENT_LES_ATTENTES,
                "précision", true, 7.5, AccueilProchainStage.OUI, "formation",
                "Jean Tremblay", "Directeur");
    }

    @Test
    void getStagiaires_shouldReturnOkAndList() {
        Authentication authentication = authentification();
        List<StagiaireDto> stagiaires = List.of(stagiaire());
        when(evaluationService.getStagiaires(EMAIL)).thenReturn(stagiaires);

        ResponseEntity<List<StagiaireDto>> response = evaluationController.getStagiaires(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(stagiaires, response.getBody());
    }

    @Test
    void getStagiaires_sansAuthentification_shouldAppelerLeServiceAvecEmailNul() {
        when(evaluationService.getStagiaires(null)).thenReturn(List.of());

        ResponseEntity<List<StagiaireDto>> response = evaluationController.getStagiaires(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(List.of(), response.getBody());
    }

    @Test
    void getStagiaire_shouldReturnOkAndDto() throws Exception {
        Authentication authentication = authentification();
        StagiaireDto dto = stagiaire();
        when(evaluationService.getStagiaire(7L, EMAIL)).thenReturn(dto);

        ResponseEntity<?> response = evaluationController.getStagiaire(7L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void getStagiaire_shouldReturnNotFoundOnException() throws Exception {
        Authentication authentication = authentification();
        when(evaluationService.getStagiaire(7L, EMAIL)).thenThrow(new Exception("Stagiaire introuvable"));

        ResponseEntity<?> response = evaluationController.getStagiaire(7L, authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertInstanceOf(DataTransferObject.class, response.getBody());
    }

    @Test
    void getEvaluation_shouldReturnOkAndDto() throws Exception {
        Authentication authentication = authentification();
        EvaluationDto dto = evaluationDto();
        when(evaluationService.getEvaluation(7L, EMAIL)).thenReturn(dto);

        ResponseEntity<?> response = evaluationController.getEvaluation(7L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void getEvaluation_shouldReturnNotFoundOnException() throws Exception {
        Authentication authentication = authentification();
        when(evaluationService.getEvaluation(7L, EMAIL))
                .thenThrow(new Exception("Aucune évaluation pour ce stagiaire"));

        ResponseEntity<?> response = evaluationController.getEvaluation(7L, authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertInstanceOf(DataTransferObject.class, response.getBody());
    }

    @Test
    void evaluer_shouldReturnCreatedAndDto() throws Exception {
        Authentication authentication = authentification();
        EvaluationRequest requete = requete();
        EvaluationDto dto = evaluationDto();
        when(evaluationService.evaluer(7L, EMAIL, requete)).thenReturn(dto);

        ResponseEntity<?> response = evaluationController.evaluer(7L, requete, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(dto, response.getBody());
    }

    @Test
    void evaluer_shouldReturnBadRequestOnException() throws Exception {
        Authentication authentication = authentification();
        EvaluationRequest requete = requete();
        when(evaluationService.evaluer(7L, EMAIL, requete))
                .thenThrow(new Exception("Ce stagiaire a déjà été évalué"));

        ResponseEntity<?> response = evaluationController.evaluer(7L, requete, authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertInstanceOf(DataTransferObject.class, response.getBody());
    }
}