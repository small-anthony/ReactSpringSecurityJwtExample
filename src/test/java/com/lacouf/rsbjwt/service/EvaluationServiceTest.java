package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Evaluation;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationRequest;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.EvaluationRepository;
import com.lacouf.rsbjwt.service.dto.EvaluationDto;
import com.lacouf.rsbjwt.service.dto.StagiaireDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {
    private static final String EMAIL = "employeur@test.com";

    @Mock
    private EvaluationRepository evaluationRepository;

    @Mock
    private ContratRepository contratRepository;

    @InjectMocks
    private EvaluationService evaluationService;

    private Contrat contrat(Long id, boolean complet) {
        Contrat contrat = mock(Contrat.class);
        lenient().when(contrat.getId()).thenReturn(id);
        lenient().when(contrat.estComplete()).thenReturn(complet);
        return contrat;
    }

    private Map<CritereEvaluation, NiveauAccord> toutesLesReponses() {
        Map<CritereEvaluation, NiveauAccord> reponses = new EnumMap<>(CritereEvaluation.class);
        for (CritereEvaluation critere : CritereEvaluation.values()) {
            reponses.put(critere, NiveauAccord.PLUTOT_EN_ACCORD);
        }
        return reponses;
    }

    private EvaluationRequest requeteValide() {
        return new EvaluationRequest(
                toutesLesReponses(),
                Map.of(SectionEvaluation.PRODUCTIVITE, "Bien"),
                AppreciationGlobale.DEPASSENT_LES_ATTENTES,
                "Très bon",
                true,
                7.5,
                AccueilProchainStage.OUI,
                "Suffisante",
                "Jean Tremblay",
                "Directeur");
    }

    private EvaluationRequest requeteAvec(Map<CritereEvaluation, NiveauAccord> reponses,
                                          AppreciationGlobale appreciation,
                                          AccueilProchainStage accueil,
                                          double heures,
                                          String nomSignataire,
                                          String fonctionSignataire) {
        return new EvaluationRequest(
                reponses,
                Map.of(SectionEvaluation.PRODUCTIVITE, "Bien"),
                appreciation,
                "Très bon",
                true,
                heures,
                accueil,
                "Suffisante",
                nomSignataire,
                fonctionSignataire);
    }

    private void preparerContratEvaluable() {
        Contrat contrat = contrat(7L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.existsByContratId(7L)).thenReturn(false);
    }

    private void assertEvaluationRefusee(EvaluationRequest requete, String messageAttendu) {
        Exception exception = assertThrows(Exception.class, () -> evaluationService.evaluer(7L, EMAIL, requete));

        assertEquals(messageAttendu, exception.getMessage());
        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void getStagiaires_neRetourneQueLesContratsComplets() {
        Contrat complet = contrat(1L, true);
        Contrat incomplet = contrat(2L, false);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(complet, incomplet));
        when(evaluationRepository.existsByContratId(1L)).thenReturn(false);

        List<StagiaireDto> stagiaires = evaluationService.getStagiaires(EMAIL);

        assertEquals(1, stagiaires.size());
        assertEquals(1L, stagiaires.get(0).contratId());
        assertFalse(stagiaires.get(0).evalue());
    }

    @Test
    void getStagiaires_indiqueQuUnStagiaireEstDejaEvalue() {
        Contrat contrat = contrat(1L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.existsByContratId(1L)).thenReturn(true);

        List<StagiaireDto> stagiaires = evaluationService.getStagiaires(EMAIL);

        assertTrue(stagiaires.get(0).evalue());
    }

    @Test
    void getStagiaire_existant_retourneLeStagiaire() throws Exception {
        Contrat contrat = contrat(7L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.existsByContratId(7L)).thenReturn(false);

        StagiaireDto stagiaire = evaluationService.getStagiaire(7L, EMAIL);

        assertEquals(7L, stagiaire.contratId());
        assertFalse(stagiaire.evalue());
    }

    @Test
    void getStagiaire_inconnu_lanceUneException() {
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of());

        Exception exception = assertThrows(Exception.class, () -> evaluationService.getStagiaire(7L, EMAIL));

        assertEquals("Stagiaire introuvable", exception.getMessage());
    }

    @Test
    void getEvaluation_existante_retourneLeDto() throws Exception {
        Contrat contrat = contrat(7L, true);
        Evaluation evaluation = new Evaluation(contrat, toutesLesReponses(), null,
                AppreciationGlobale.REPONDENT_PLEINEMENT_AUX_ATTENTES, "précision", false, 5,
                AccueilProchainStage.PEUT_ETRE, "formation", "Jean Tremblay", "Directeur");
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.findByContratId(7L)).thenReturn(Optional.of(evaluation));

        EvaluationDto dto = evaluationService.getEvaluation(7L, EMAIL);

        assertEquals(7L, dto.contratId());
        assertEquals(AppreciationGlobale.REPONDENT_PLEINEMENT_AUX_ATTENTES, dto.appreciationGlobale());
        assertEquals(AccueilProchainStage.PEUT_ETRE, dto.accueilProchainStage());
    }

    @Test
    void getEvaluation_absente_lanceUneException() {
        Contrat contrat = contrat(7L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.findByContratId(7L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () -> evaluationService.getEvaluation(7L, EMAIL));

        assertEquals("Aucune évaluation pour ce stagiaire", exception.getMessage());
    }

    @Test
    void evaluer_enregistreLEvaluationEtRetourneLeDto() throws Exception {
        Contrat contrat = contrat(7L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.existsByContratId(7L)).thenReturn(false);
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EvaluationDto dto = evaluationService.evaluer(7L, EMAIL, requeteValide());

        assertEquals(7L, dto.contratId());
        assertEquals(AppreciationGlobale.DEPASSENT_LES_ATTENTES, dto.appreciationGlobale());
        assertEquals(22, dto.reponses().size());
        assertEquals("Jean Tremblay", dto.nomSignataire());
        verify(evaluationRepository).save(any(Evaluation.class));
    }

    @Test
    void evaluer_dejaEvalue_lanceUneException() {
        Contrat contrat = contrat(7L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(contrat));
        when(evaluationRepository.existsByContratId(7L)).thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> evaluationService.evaluer(7L, EMAIL, requeteValide()));

        assertEquals("Ce stagiaire a déjà été évalué", exception.getMessage());
        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void evaluer_contratDUnAutreEmployeur_lanceUneException() {
        Contrat autreContrat = contrat(8L, true);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(autreContrat));

        Exception exception = assertThrows(Exception.class, () -> evaluationService.evaluer(7L, EMAIL, requeteValide()));

        assertEquals("Stagiaire introuvable", exception.getMessage());
        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void evaluer_contratIncomplet_lanceUneException() {
        Contrat incomplet = contrat(7L, false);
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail(EMAIL)).thenReturn(List.of(incomplet));
        when(evaluationRepository.existsByContratId(7L)).thenReturn(false);

        Exception exception = assertThrows(Exception.class, () -> evaluationService.evaluer(7L, EMAIL, requeteValide()));

        assertEquals("Le contrat doit être complété avant d'évaluer le stagiaire", exception.getMessage());
        verify(evaluationRepository, never()).save(any(Evaluation.class));
    }

    @Test
    void evaluer_critereManquant_lanceUneException() {
        preparerContratEvaluable();
        Map<CritereEvaluation, NiveauAccord> reponses = toutesLesReponses();
        reponses.remove(CritereEvaluation.PLANIFIER_ORGANISER);

        assertEvaluationRefusee(
                requeteAvec(reponses, AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                        "Jean Tremblay", "Directeur"),
                "Tous les critères doivent être évalués");
    }

    @Test
    void evaluer_reponsesNulles_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(null, AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                        "Jean Tremblay", "Directeur"),
                "Tous les critères doivent être évalués");
    }

    @Test
    void evaluer_appreciationGlobaleAbsente_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), null, AccueilProchainStage.OUI, 7.5, "Jean Tremblay", "Directeur"),
                "L'appréciation globale est obligatoire");
    }

    @Test
    void evaluer_accueilProchainStageAbsent_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), AppreciationGlobale.DEPASSENT_LES_ATTENTES, null, 7.5,
                        "Jean Tremblay", "Directeur"),
                "Veuillez indiquer si l'entreprise accueillerait cet élève pour un prochain stage");
    }

    @Test
    void evaluer_heuresNegatives_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI,
                        -1, "Jean Tremblay", "Directeur"),
                "Le nombre d'heures d'encadrement ne peut pas être négatif");
    }

    @Test
    void evaluer_nomSignataireVide_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI,
                        7.5, "   ", "Directeur"),
                "Le nom du signataire est obligatoire");
    }

    @Test
    void evaluer_nomSignataireNul_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI,
                        7.5, null, "Directeur"),
                "Le nom du signataire est obligatoire");
    }

    @Test
    void evaluer_fonctionSignataireVide_lanceUneException() {
        preparerContratEvaluable();

        assertEvaluationRefusee(
                requeteAvec(toutesLesReponses(), AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI,
                        7.5, "Jean Tremblay", ""),
                "La fonction du signataire est obligatoire");
    }

    @Test
    void evaluer_zeroHeureEncadrement_estAccepte() throws Exception {
        preparerContratEvaluable();
        when(evaluationRepository.save(any(Evaluation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EvaluationDto dto = evaluationService.evaluer(7L, EMAIL, requeteAvec(toutesLesReponses(),
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 0, "Jean Tremblay", "Directeur"));

        assertEquals(7L, dto.contratId());
        verify(evaluationRepository).save(any(Evaluation.class));
    }
}