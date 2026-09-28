package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;

import java.time.LocalDateTime;

public record CandidatureDto(int id, int offreId, String offreTitre,
                             int etudiantId, String firstName, String lastName,
                             String email, int matricule, String discipline,
                             boolean cvDisponible, StatutCandidature statut,
                             LocalDateTime dateCandidature) {

    public static CandidatureDto create(Candidature candidature) {
        Etudiant etudiant = candidature.getEtudiant();
        return new CandidatureDto(
                candidature.getId().intValue(),
                candidature.getOffreStage().getId().intValue(),
                candidature.getOffreStage().getTitre(),
                etudiant.getId().intValue(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                etudiant.getCv() != null,
                candidature.getStatut(),
                candidature.getDateCandidature()
        );
    }
}