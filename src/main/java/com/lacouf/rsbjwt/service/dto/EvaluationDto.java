package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;
import com.lacouf.rsbjwt.model.Evaluation;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.Instant;
import java.util.Map;

public record EvaluationDto(
        Long contratId,
        Map<CritereEvaluation, NiveauAccord> reponses,
        Map<SectionEvaluation, String> commentaires,
        AppreciationGlobale appreciationGlobale,
        String precisionAppreciation,
        boolean discuteAvecStagiaire,
        double heuresEncadrementParSemaine,
        AccueilProchainStage accueilProchainStage,
        String formationTechnique,
        String nomSignataire,
        String fonctionSignataire,
        Instant dateEvaluation) implements DataTransferObject {

    public static EvaluationDto create(Evaluation evaluation) {
        return new EvaluationDto(
                evaluation.getContratId(),
                evaluation.getReponses(),
                evaluation.getCommentaires(),
                evaluation.getAppreciationGlobale(),
                evaluation.getPrecisionAppreciation(),
                evaluation.isDiscuteAvecStagiaire(),
                evaluation.getHeuresEncadrementParSemaine(),
                evaluation.getAccueilProchainStage(),
                evaluation.getFormationTechnique(),
                evaluation.getNomSignataire(),
                evaluation.getFonctionSignataire(),
                evaluation.getDateEvaluation());
    }
}