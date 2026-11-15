package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;

import java.time.LocalDate;
import java.util.List;

public record EtudiantSuperviseDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        String statutStage,
        String entrepriseStage,
        String titreOffreStage,
        List<CandidatureDto> candidatures,
        Long candidatureStageId,
        Long contratId,
        String personneContact,
        String telephoneEntreprise,
        String dateDebutStage,
        String dateFinStage,
        boolean aStage,
        boolean milieuEvalue,
        Long evaluationMilieuId
) {
    public EtudiantSuperviseDto(
            Long id,
            String firstName,
            String lastName,
            String email,
            int matricule,
            String discipline,
            String statutStage,
            String entrepriseStage,
            String titreOffreStage,
            List<CandidatureDto> candidatures
    ) {
        this(
                id,
                firstName,
                lastName,
                email,
                matricule,
                discipline,
                statutStage,
                entrepriseStage,
                titreOffreStage,
                candidatures,
                null,
                null,
                null,
                null,
                null,
                null,
                !"EN_RECHERCHE".equals(statutStage),
                false,
                null
        );
    }

    public static EtudiantSuperviseDto create(
            Etudiant etudiant,
            List<Candidature> filtrees,
            Candidature stage,
            Contrat contrat,
            EvaluationMilieuStage evaluation
    ) {
        return new EtudiantSuperviseDto(
                etudiant.getId(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                stage != null ? stage.getStatut().name() : "EN_RECHERCHE",
                stage != null ? stage.getNomEntreprise() : "Non déterminé",
                stage != null ? stage.getTitreOffre() : "Aucun stage",
                CandidatureDto.create(filtrees),
                stage != null ? stage.getId() : null,
                contrat != null ? contrat.getId() : null,
                stage != null ? stage.nomContactEmployeur() : null,
                stage != null ? stage.telephoneEmployeur() : null,
                contrat != null && contrat.getDateDebut() != null ? contrat.getDateDebut().toString() : null,
                contrat != null && contrat.getDateFin() != null ? contrat.getDateFin().toString() : null,
                stage != null,
                evaluation != null,
                evaluation != null ? evaluation.getId() : null
        );
    }
}
