package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;
import com.lacouf.rsbjwt.model.Professeur;

import java.time.LocalDate;

public record DossierStageProfesseurDto(
        Long etudiantId,
        Long candidatureId,
        Long contratId,
        String nomEntreprise,
        String personneContact,
        String telephoneEntreprise,
        String adresseEntreprise,
        String villeEntreprise,
        String codePostalEntreprise,
        String emailEntreprise,
        String nomStagiaire,
        String discipline,
        String titreOffre,
        String dateDebut,
        String dateFin,
        String dateStage,
        String salaireHoraire,
        String nomProfesseur,
        boolean milieuEvalue,
        Long evaluationMilieuId
) {
    public static DossierStageProfesseurDto create(
            Professeur professeur,
            Etudiant etudiant,
            Candidature stage,
            Contrat contrat,
            EvaluationMilieuStage evaluation
    ) {
        String dateDebut = contrat != null && contrat.getDateDebut() != null
                ? contrat.getDateDebut().toString()
                : null;
        String dateFin = contrat != null && contrat.getDateFin() != null
                ? contrat.getDateFin().toString()
                : null;
        String dateStage = (dateDebut != null && dateFin != null) ? dateDebut + " → " + dateFin : "";
        String salaire = (contrat != null && contrat.getSalaire() != null && !contrat.getSalaire().isBlank())
                ? contrat.getSalaire()
                : stage.getSalaireOffre();

        return new DossierStageProfesseurDto(
                etudiant.getId(),
                stage.getId(),
                contrat != null ? contrat.getId() : null,
                stage.getNomEntreprise(),
                stage.nomContactEmployeur(),
                stage.telephoneLieuStage(),
                stage.getAdresseOffre(),
                stage.getVilleOffre(),
                stage.getCodePostalOffre(),
                stage.emailEmployeur(),
                etudiant.nomComplet(),
                etudiant.getDiscipline(),
                stage.getTitreOffre(),
                dateDebut,
                dateFin,
                dateStage,
                salaire,
                professeur.nomComplet(),
                evaluation != null,
                evaluation != null ? evaluation.getId() : null
        );
    }
}
