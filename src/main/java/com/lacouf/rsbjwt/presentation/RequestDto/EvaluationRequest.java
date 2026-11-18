package com.lacouf.rsbjwt.presentation.RequestDto;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;

import java.util.Map;

public record EvaluationRequest(
        Map<CritereEvaluation, NiveauAccord> reponses,
        Map<SectionEvaluation, String> commentaires,
        AppreciationGlobale appreciationGlobale,
        String precisionAppreciation,
        boolean discuteAvecStagiaire,
        double heuresEncadrementParSemaine,
        AccueilProchainStage accueilProchainStage,
        String formationTechnique,
        String nomSignataire,
        String fonctionSignataire) {
}