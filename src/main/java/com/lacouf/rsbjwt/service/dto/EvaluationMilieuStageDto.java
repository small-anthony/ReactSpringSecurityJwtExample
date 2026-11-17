package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.CapaciteAccueilStagiaires;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluationMilieu;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.StageCible;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;

import java.time.LocalDate;
import java.util.Map;

public record EvaluationMilieuStageDto(
        Long id,
        Long etudiantId,
        Long candidatureId,
        Long professeurId,
        String nomProfesseur,
        String nomEntreprise,
        String personneContact,
        String adresse,
        String ville,
        String codePostal,
        String telephone,
        String telecopieur,
        String nomStagiaire,
        String dateStage,
        int numeroStage,
        Map<CritereEvaluationMilieu, NiveauAccord> reponses,
        double heuresEncadrementMois1,
        double heuresEncadrementMois2,
        double heuresEncadrementMois3,
        String salaireHoraire,
        String commentaires,
        StageCible milieuAPrivilegier,
        CapaciteAccueilStagiaires nombreStagiairesAccueillis,
        boolean accueillirMemeStagiaire,
        boolean quartsTravailVariables,
        String quart1Debut,
        String quart1Fin,
        String quart2Debut,
        String quart2Fin,
        String quart3Debut,
        String quart3Fin,
        String signatureEnseignant,
        LocalDate dateEvaluation) {
    public static EvaluationMilieuStageDto create(EvaluationMilieuStage evaluation) {
        return new EvaluationMilieuStageDto(
                evaluation.getId(),
                evaluation.getEtudiantId(),
                evaluation.getCandidatureId(),
                evaluation.getProfesseurId(),
                evaluation.getNomProfesseur(),
                evaluation.getNomEntreprise(),
                evaluation.getPersonneContact(),
                evaluation.getAdresse(),
                evaluation.getVille(),
                evaluation.getCodePostal(),
                evaluation.getTelephone(),
                evaluation.getTelecopieur(),
                evaluation.getNomStagiaire(),
                evaluation.getDateStage(),
                evaluation.getNumeroStage(),
                evaluation.getReponses(),
                evaluation.getHeuresEncadrementMois1(),
                evaluation.getHeuresEncadrementMois2(),
                evaluation.getHeuresEncadrementMois3(),
                evaluation.getSalaireHoraire(),
                evaluation.getCommentaires(),
                evaluation.getMilieuAPrivilegier(),
                evaluation.getNombreStagiairesAccueillis(),
                evaluation.isAccueillirMemeStagiaire(),
                evaluation.isQuartsTravailVariables(),
                evaluation.getQuart1Debut(),
                evaluation.getQuart1Fin(),
                evaluation.getQuart2Debut(),
                evaluation.getQuart2Fin(),
                evaluation.getQuart3Debut(),
                evaluation.getQuart3Fin(),
                evaluation.getSignatureEnseignant(),
                evaluation.getDateEvaluation());
    }
}
