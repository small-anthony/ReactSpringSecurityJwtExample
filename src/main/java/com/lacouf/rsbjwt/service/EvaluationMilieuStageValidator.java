package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluationMilieu;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationMilieuStageRequest;

import java.time.LocalDate;
import java.util.Map;
import java.util.regex.Pattern;

public final class EvaluationMilieuStageValidator {
    private static final Pattern CODE_POSTAL_CANADIEN = Pattern.compile("^[A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d$");
    private static final int MAX_COMMENTAIRES_LENGTH = 2000;

    private EvaluationMilieuStageValidator() {
    }

    public static void validerRequeteEvaluation(EvaluationMilieuStageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Le formulaire d'évaluation est vide.");
        }
        exigerNonVide(request.nomEntreprise(), "Le nom de l'entreprise est obligatoire.");
        exigerNonVide(request.personneContact(), "La personne contact est obligatoire.");
        exigerNonVide(request.adresse(), "L'adresse de l'entreprise est obligatoire.");
        exigerNonVide(request.ville(), "La ville est obligatoire.");
        exigerNonVide(request.codePostal(), "Le code postal est obligatoire.");
        if (!CODE_POSTAL_CANADIEN.matcher(request.codePostal().trim()).matches()) {
            throw new IllegalArgumentException("Le code postal doit être au format canadien (ex. H1A 1A1).");
        }
        exigerNonVide(request.telephone(), "Le numéro de téléphone est obligatoire.");
        exigerNonVide(request.nomStagiaire(), "Le nom du stagiaire est obligatoire.");
        exigerNonVide(request.dateStage(), "La date du stage est obligatoire.");
        if (request.numeroStage() == null || (request.numeroStage() != 1 && request.numeroStage() != 2)) {
            throw new IllegalArgumentException("Le numéro du stage doit être 1 ou 2.");
        }

        validerReponsesCriteres(request.reponses(), request.commentaires());
        validerHeures(request.heuresEncadrementMois1(), "premier mois");
        validerHeures(request.heuresEncadrementMois2(), "deuxième mois");
        validerHeures(request.heuresEncadrementMois3(), "troisième mois");
        exigerNonVide(request.salaireHoraire(), "Le salaire horaire offert est obligatoire.");

        if (request.commentaires() != null && request.commentaires().trim().length() > MAX_COMMENTAIRES_LENGTH) {
            throw new IllegalArgumentException("Les commentaires ne peuvent pas dépasser 2000 caractères.");
        }
        if (request.milieuAPrivilegier() == null) {
            throw new IllegalArgumentException("Veuillez préciser si le milieu est à privilégier pour le 1er ou le 2e stage.");
        }
        if (request.nombreStagiairesAccueillis() == null) {
            throw new IllegalArgumentException("Veuillez indiquer le nombre de stagiaires que le milieu peut accueillir.");
        }
        if (request.accueillirMemeStagiaire() == null) {
            throw new IllegalArgumentException("Veuillez indiquer si le milieu désire accueillir le même stagiaire pour un prochain stage.");
        }
        if (request.quartsTravailVariables() == null) {
            throw new IllegalArgumentException("Veuillez indiquer si le milieu offre des quarts de travail variables.");
        }
        if (Boolean.TRUE.equals(request.quartsTravailVariables())) {
            if (estVide(request.quart1Debut()) || estVide(request.quart1Fin())) {
                throw new IllegalArgumentException("Veuillez préciser au moins la première plage horaire pour les quarts variables.");
            }
            validerPaireQuart(request.quart2Debut(), request.quart2Fin());
            validerPaireQuart(request.quart3Debut(), request.quart3Fin());
        }
        exigerNonVide(request.signatureEnseignant(), "La signature de l'enseignant responsable est obligatoire.");
    }

    public static EvaluationMilieuStage construireEntite(
            Candidature stage,
            Etudiant etudiant,
            Professeur professeur,
            EvaluationMilieuStageRequest request
    ) {
        boolean variables = Boolean.TRUE.equals(request.quartsTravailVariables());
        return new EvaluationMilieuStage(
                stage,
                etudiant,
                professeur,
                request.nomEntreprise(),
                request.personneContact(),
                request.adresse(),
                request.ville(),
                request.codePostal().trim().toUpperCase(),
                request.telephone(),
                request.telecopieur(),
                request.nomStagiaire(),
                request.dateStage(),
                request.numeroStage(),
                request.reponses(),
                request.heuresEncadrementMois1(),
                request.heuresEncadrementMois2(),
                request.heuresEncadrementMois3(),
                request.salaireHoraire(),
                request.commentaires(),
                request.milieuAPrivilegier(),
                request.nombreStagiairesAccueillis(),
                request.accueillirMemeStagiaire(),
                request.quartsTravailVariables(),
                variables ? request.quart1Debut() : "",
                variables ? request.quart1Fin() : "",
                variables ? request.quart2Debut() : "",
                variables ? request.quart2Fin() : "",
                variables ? request.quart3Debut() : "",
                variables ? request.quart3Fin() : "",
                request.signatureEnseignant(),
                request.dateEvaluation() != null ? request.dateEvaluation() : LocalDate.now()
        );
    }

    private static void validerReponsesCriteres(Map<CritereEvaluationMilieu, NiveauAccord> reponses, String commentaires) {
        if (reponses == null) {
            throw new IllegalArgumentException("Tous les critères d'évaluation doivent être complétés.");
        }
        boolean aReponseNegative = false;
        for (CritereEvaluationMilieu critere : CritereEvaluationMilieu.values()) {
            NiveauAccord niveau = reponses.get(critere);
            if (niveau == null) {
                throw new IllegalArgumentException("Tous les critères d'évaluation doivent être complétés.");
            }
            if (niveau == NiveauAccord.PLUTOT_EN_DESACCORD || niveau == NiveauAccord.TOTALEMENT_EN_DESACCORD) {
                aReponseNegative = true;
            }
        }
        if (aReponseNegative && estVide(commentaires)) {
            throw new IllegalArgumentException("Veuillez expliquer les réponses négatives dans la section commentaires.");
        }
    }

    private static void validerHeures(Double heures, String libelleMois) {
        if (heures == null || Double.isNaN(heures) || Double.isInfinite(heures) || heures < 0) {
            throw new IllegalArgumentException("Veuillez saisir un nombre d'heures valide pour le " + libelleMois + ".");
        }
    }

    private static void validerPaireQuart(String debut, String fin) {
        if (estVide(debut) != estVide(fin)) {
            throw new IllegalArgumentException("Chaque plage horaire renseignée doit indiquer l'heure de début et l'heure de fin.");
        }
    }

    private static void exigerNonVide(String valeur, String message) {
        if (estVide(valeur)) {
            throw new IllegalArgumentException(message);
        }
    }

    private static boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }
}

