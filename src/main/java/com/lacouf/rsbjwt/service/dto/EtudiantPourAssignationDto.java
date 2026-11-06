package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;

import java.util.List;

public record EtudiantPourAssignationDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        boolean aTrouveStage,
        String titreOffreStage,
        String nomEntreprise,
        ProfesseurDto professeurAssigne,
        boolean estAssigne,
        List<CandidatureDto> candidatures
) {
    public static EtudiantPourAssignationDto create(Etudiant etudiant) {
        if (etudiant == null) return null;

        List<Candidature> candidatures = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();

        Candidature candStage = candidatures.stream()
                .filter(c -> c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE)
                .findFirst()
                .orElse(null);

        boolean aTrouve = candStage != null;
        String titre = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getTitre() : null;
        String entreprise = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getNomEntreprise() : null;

        ProfesseurDto profDto = etudiant.getProfesseur() != null
                ? ProfesseurDto.create(etudiant.getProfesseur())
                : null;

        return new EtudiantPourAssignationDto(
                etudiant.getId(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                aTrouve,
                titre,
                entreprise,
                profDto,
                profDto != null,
                CandidatureDto.create(candidatures)
        );
    }
}
