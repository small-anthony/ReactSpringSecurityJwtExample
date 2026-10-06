package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.util.List;

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
        String exigences,
        List<CandidatureDto> candidatures
) implements DataTransferObject {

    // Constructeurs de compatibilite : evitent de casser le code et les tests
    // qui utilisaient les anciennes formes du DTO.

    // Ancienne forme (id, titre, description, entreprise, statut, message)
    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                null, null, null, null, List.of());
    }

    // Forme avec candidatures, sans les nouveaux champs d'offre
    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse,
                         List<CandidatureDto> candidatures) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                null, null, null, null, candidatures);
    }

    // Forme avec les nouveaux champs d'offre, sans candidatures
    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse,
                         String discipline, String salaire, String duree, String exigences) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                discipline, salaire, duree, exigences, List.of());
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
                offreStage.getExigences(),
                CandidatureDto.create(offreStage.getCandidatures())
        );
    }

    public static List<OffreStageDto> create(List<OffreStage> offreStages) {
        return offreStages.stream().map(OffreStageDto::create).toList();
    }

    public static OffreStageDto createFilteredByEtudiant(OffreStage offreStage, Etudiant etudiant) {
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
                offreStage.getExigences(),
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