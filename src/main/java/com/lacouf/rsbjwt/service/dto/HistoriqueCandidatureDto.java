package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.HistoriqueCandidature;

import java.time.LocalDateTime;

public record HistoriqueCandidatureDto(Long candidatureId,
                                       String etudiantNom,
                                       String titreOffre,
                                       StatutCandidature ancienStatut,
                                       StatutCandidature nouveauStatut,
                                       String message,
                                       LocalDateTime dateDecision) {

    public static HistoriqueCandidatureDto create(HistoriqueCandidature historique) {
        Candidature candidature = historique.getCandidature();
        return new HistoriqueCandidatureDto(
                candidature.getId(),
                candidature.getEtudiant().getFirstName() + " " + candidature.getEtudiant().getLastName(),
                candidature.getOffreStage().getTitre(),
                historique.getAncienStatut(),
                historique.getNouveauStatut(),
                historique.getMessage(),
                historique.getDateDecision()
        );
    }
}