package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;

import java.time.LocalDate;
import java.util.ArrayList;
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
        String exigences,
        List<CandidatureDto> candidatures,
        int annee,
        String adresse,
        String telephone,
        String ville,
        String codePostal,
        LocalDate dateDebut,
        LocalDate dateFin
) implements DataTransferObject {
    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                null, null, null, List.of(), AcademicSessionUtils.getAnneeActuelle());
    }

    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse,
                         List<CandidatureDto> candidatures) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                null, null, null, candidatures, AcademicSessionUtils.getAnneeActuelle());
    }

    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse,
                         String discipline, String salaire, String exigences) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                discipline, salaire, exigences, List.of(), AcademicSessionUtils.getAnneeActuelle());
    }

    public OffreStageDto(int id, String titre, String description, String nomEntreprise,
                         StatusAcceptation status, String messageReponse,
                         String discipline, String salaire, String exigences,
                         List<CandidatureDto> candidatures, int annee) {
        this(id, titre, description, nomEntreprise, status, messageReponse,
                discipline, salaire, exigences, candidatures, annee, null, null, null, null, null, null);
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
                offreStage.getExigences(),
                offreStage.getCandidatures() != null ? CandidatureDto.create(offreStage.getCandidatures()) : new ArrayList<>(),
                offreStage.getAnnee(),
                offreStage.getAdresse(),
                offreStage.getTelephone(),
                offreStage.getVille(),
                offreStage.getCodePostal(),
                offreStage.getDateDebut(),
                offreStage.getDateFin()
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
                offreStage.getExigences(),
                CandidatureDto.create(
                        offreStage.getCandidatures() != null ?
                        offreStage.getCandidatures().stream()
                                .filter(candidat -> candidat.getEtudiant().equals(etudiant))
                                .toList() : List.of()
                ),
                offreStage.getAnnee(),
                offreStage.getAdresse(),
                offreStage.getTelephone(),
                offreStage.getVille(),
                offreStage.getCodePostal(),
                offreStage.getDateDebut(),
                offreStage.getDateFin()
        );
    }

    public static List<OffreStageDto> createFilteredByEtudiant(List<OffreStage> offreStages, Etudiant etudiant) {
        return offreStages.stream()
                .map(offre -> createFilteredByEtudiant(offre, etudiant)).toList();
    }
}
