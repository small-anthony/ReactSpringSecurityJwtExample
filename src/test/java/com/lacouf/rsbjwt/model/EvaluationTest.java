package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;
import org.junit.jupiter.api.Test;

import java.util.EnumMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class EvaluationTest {

    private Contrat contrat(boolean complet) {
        Contrat contrat = mock(Contrat.class);
        when(contrat.estComplete()).thenReturn(complet);
        return contrat;
    }

    private Map<CritereEvaluation, NiveauAccord> toutesLesReponses() {
        Map<CritereEvaluation, NiveauAccord> reponses = new EnumMap<>(CritereEvaluation.class);
        for (CritereEvaluation critere : CritereEvaluation.values()) {
            reponses.put(critere, NiveauAccord.TOTALEMENT_EN_ACCORD);
        }
        return reponses;
    }

    private Evaluation creer(Contrat contrat,
                             Map<CritereEvaluation, NiveauAccord> reponses,
                             Map<SectionEvaluation, String> commentaires,
                             AppreciationGlobale appreciation,
                             AccueilProchainStage accueil,
                             double heures,
                             String nom,
                             String fonction) throws Exception {
        return new Evaluation(contrat, reponses, commentaires, appreciation, "précision", true,
                heures, accueil, "formation", nom, fonction);
    }

    private Evaluation creerValide() throws Exception {
        return creer(contrat(true), toutesLesReponses(), Map.of(SectionEvaluation.PRODUCTIVITE, "  Très bien  "),
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur");
    }

    @Test
    void constructeur_valide_conserveLesDonnees() throws Exception {
        Evaluation evaluation = creerValide();

        assertEquals(22, evaluation.getReponses().size());
        assertEquals("Très bien", evaluation.getCommentaires().get(SectionEvaluation.PRODUCTIVITE));
        assertEquals(AppreciationGlobale.DEPASSENT_LES_ATTENTES, evaluation.getAppreciationGlobale());
        assertEquals("précision", evaluation.getPrecisionAppreciation());
        assertTrue(evaluation.isDiscuteAvecStagiaire());
        assertEquals(7.5, evaluation.getHeuresEncadrementParSemaine());
        assertEquals(AccueilProchainStage.OUI, evaluation.getAccueilProchainStage());
        assertEquals("formation", evaluation.getFormationTechnique());
        assertEquals("Jean Tremblay", evaluation.getNomSignataire());
        assertEquals("Directeur", evaluation.getFonctionSignataire());
    }

    @Test
    void constructeur_commentairesAbsents_remplisParDesTextesVides() throws Exception {
        Evaluation evaluation = creer(contrat(true), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur");

        assertEquals(SectionEvaluation.values().length, evaluation.getCommentaires().size());
        assertEquals("", evaluation.getCommentaires().get(SectionEvaluation.QUALITE_TRAVAIL));
    }

    @Test
    void constructeur_contratIncomplet_refuse() {
        Exception exception = assertThrows(Exception.class, () -> creer(contrat(false), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur"));

        assertEquals("Le contrat doit être complété avant d'évaluer le stagiaire", exception.getMessage());
    }

    @Test
    void constructeur_contratNul_refuse() {
        assertThrows(Exception.class, () -> creer(null, toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur"));
    }

    @Test
    void constructeur_critereManquant_refuse() {
        Map<CritereEvaluation, NiveauAccord> reponses = toutesLesReponses();
        reponses.remove(CritereEvaluation.INITIATIVE);

        Exception exception = assertThrows(Exception.class, () -> creer(contrat(true), reponses, null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur"));

        assertEquals("Tous les critères doivent être évalués", exception.getMessage());
    }

    @Test
    void constructeur_reponsesNulles_refuse() {
        assertThrows(Exception.class, () -> creer(contrat(true), null, null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5,
                "Jean Tremblay", "Directeur"));
    }

    @Test
    void constructeur_appreciationNulle_refuse() {
        Exception exception = assertThrows(Exception.class, () -> creer(contrat(true), toutesLesReponses(), null,
                null, AccueilProchainStage.OUI, 7.5, "Jean Tremblay", "Directeur"));

        assertEquals("L'appréciation globale est obligatoire", exception.getMessage());
    }

    @Test
    void constructeur_accueilProchainStageNul_refuse() {
        assertThrows(Exception.class, () -> creer(contrat(true), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, null, 7.5, "Jean Tremblay", "Directeur"));
    }

    @Test
    void constructeur_heuresNegatives_refuse() {
        assertThrows(Exception.class, () -> creer(contrat(true), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, -1,
                "Jean Tremblay", "Directeur"));
    }

    @Test
    void constructeur_nomSignataireVide_refuse() {
        Exception exception = assertThrows(Exception.class, () -> creer(contrat(true), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5, "   ", "Directeur"));

        assertEquals("Le nom du signataire est obligatoire", exception.getMessage());
    }

    @Test
    void constructeur_fonctionSignataireNulle_refuse() {
        Exception exception = assertThrows(Exception.class, () -> creer(contrat(true), toutesLesReponses(), null,
                AppreciationGlobale.DEPASSENT_LES_ATTENTES, AccueilProchainStage.OUI, 7.5, "Jean Tremblay", null));

        assertEquals("La fonction du signataire est obligatoire", exception.getMessage());
    }

    @Test
    void getReponses_nonModifiable() throws Exception {
        Evaluation evaluation = creerValide();

        assertThrows(UnsupportedOperationException.class,
                () -> evaluation.getReponses().put(CritereEvaluation.INITIATIVE, NiveauAccord.NON_APPLICABLE));
    }
}