package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.util.List;

public record OffreStageDto
        (int id, String titre, String description, String nomEntreprise,
         StatusAcceptation status, String messageReponse, List<CandidatureDto> candidatures)
        implements DataTransferObject {

    public static OffreStageDto create(OffreStage offreStage) {
        return new OffreStageDto(
                offreStage.getId().intValue(),
                offreStage.getTitre(),
                offreStage.getDescription(),
                offreStage.getNomEntreprise(),
                offreStage.getStatus(),
                offreStage.getMessageReponse(),
                CandidatureDto.create(offreStage.getCandidatures())
        );
    }

    public static List<OffreStageDto> create(List<OffreStage> offreStages) {
        return offreStages.stream().map(OffreStageDto::create).toList();
    }

    public static OffreStageDto createFilteredByEtudiant(OffreStage offreStage, Etudiant etudiant) {
        return new OffreStageDto(
                offreStage.getId().intValue(),
                offreStage.getTitre(),
                offreStage.getDescription(),
                offreStage.getNomEntreprise(),
                offreStage.getStatus(),
                offreStage.getMessageReponse(),
                CandidatureDto.create(
                        offreStage.getCandidatures().stream()
                                .filter(candidat -> candidat.getEtudiant().equals(etudiant))
                                .toList()
                )
        );
    }

    public static List<OffreStageDto> createFilteredByEtudiant(List<OffreStage> offreStages, Etudiant etudiant) {
        return offreStages.stream()
                .map(offre -> createFilteredByEtudiant(offre, etudiant)).toList();

    }
}