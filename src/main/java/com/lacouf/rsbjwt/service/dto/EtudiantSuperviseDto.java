package com.lacouf.rsbjwt.service.dto;

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
        List<CandidatureDto> candidatures
) {}
