package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;

public record OffreStageDto(int id, String titre, String description, String nomEntreprise) {

    public static OffreStageDto create(OffreStage offreStage) {
        return new OffreStageDto(
                offreStage.getId().intValue(),
                offreStage.getTitre(),
                offreStage.getDescription(),
                offreStage.getNomEntreprise()
        );
    }
}
