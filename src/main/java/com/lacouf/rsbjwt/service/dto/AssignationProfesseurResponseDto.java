package com.lacouf.rsbjwt.service.dto;

public record AssignationProfesseurResponseDto(
        EtudiantPourAssignationDto etudiant,
        ProfesseurDto professeur,
        String message,
        String avertissement,
        boolean success
) {
    public static AssignationProfesseurResponseDto succes(EtudiantPourAssignationDto etudiant, ProfesseurDto professeur, String message, String avertissement) {
        return new AssignationProfesseurResponseDto(etudiant, professeur, message, avertissement, true);
    }
}
