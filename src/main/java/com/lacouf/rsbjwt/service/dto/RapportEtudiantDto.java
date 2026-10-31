package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Etudiant;
import java.util.List;

public record RapportEtudiantDto(
        int id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        List<CandidatureDto> candidatures
) {
    public static RapportEtudiantDto create(Etudiant etudiant) {
        return new RapportEtudiantDto(
                etudiant.getId().intValue(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                CandidatureDto.create(etudiant.getCandidatures())
        );
    }
}