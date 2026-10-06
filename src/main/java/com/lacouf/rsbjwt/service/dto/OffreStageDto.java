package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.OffreStage;

public record OffreStageDto(
        int id,
        String titre,
        String description,
        String nomEntreprise,
        StatusAcceptation status,
        String messageReponse,
        String discipline,
        String salaire,
        String duree,
        String exigences
) {

    public OffreStageDto(int id, String titre, String description, String nomEntreprise, StatusAcceptation status, String messageReponse) {
        this(id, titre, description, nomEntreprise, status, messageReponse, null, null, null, null);
    }

    public static OffreStageDto create(OffreStage offreStage) {
        return new OffreStageDto(
                offreStage.getId() != null ? offreStage.getId().intValue() : 0,
                offreStage.getTitre(),
                offreStage.getDescription(),
                offreStage.getNomEntreprise(),
                offreStage.getStatus(),
                offreStage.getMessageReponse(),
                offreStage.getDiscipline(),
                offreStage.getSalaire(),
                offreStage.getDuree(),
                offreStage.getExigences()
        );
    }
}
