package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Professeur;

public record ProfesseurPourAssignationDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        long nombreEtudiantsAssignes,
        boolean tropEtudiants,
        int seuilMax
) {
    public static final int SEUIL_MAX_RECOMMANDE = 5;

    public static ProfesseurPourAssignationDto create(Professeur professeur, long count) {
        if (professeur == null) return null;
        return new ProfesseurPourAssignationDto(
                professeur.getId(),
                professeur.getFirstName(),
                professeur.getLastName(),
                professeur.getEmail(),
                count,
                count >= SEUIL_MAX_RECOMMANDE,
                SEUIL_MAX_RECOMMANDE
        );
    }
}
