package com.lacouf.rsbjwt.presentation.RequestDto;

import com.lacouf.rsbjwt.model.ENUM.CapaciteAccueilStagiaires;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluationMilieu;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.StageCible;

import java.time.LocalDate;
import java.util.Map;

public record EvaluationMilieuStageRequest(
                String nomEntreprise,
                String personneContact,
                String adresse,
                String ville,
                String codePostal,
                String telephone,
                String telecopieur,
                String nomStagiaire,
                String dateStage,
                Integer numeroStage,
                Map<CritereEvaluationMilieu, NiveauAccord> reponses,
                Double heuresEncadrementMois1,
                Double heuresEncadrementMois2,
                Double heuresEncadrementMois3,
                String salaireHoraire,
                String commentaires,
                StageCible milieuAPrivilegier,
                CapaciteAccueilStagiaires nombreStagiairesAccueillis,
                Boolean accueillirMemeStagiaire,
                Boolean quartsTravailVariables,
                String quart1Debut,
                String quart1Fin,
                String quart2Debut,
                String quart2Fin,
                String quart3Debut,
                String quart3Fin,
                String signatureEnseignant,
                LocalDate dateEvaluation) {
}
