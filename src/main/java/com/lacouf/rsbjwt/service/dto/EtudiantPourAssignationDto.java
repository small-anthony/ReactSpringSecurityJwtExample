package com.lacouf.rsbjwt.service.dto;

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
) {}
