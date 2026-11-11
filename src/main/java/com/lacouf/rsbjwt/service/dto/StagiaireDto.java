package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.LocalDate;

public record StagiaireDto(
        Long contratId,
        String titreOffre,
        String nomEtudiant,
        String discipline,
        String entreprise,
        String nomSuperviseur,
        String telephone,
        LocalDate dateDebut,
        LocalDate dateFin,
        boolean evalue) implements DataTransferObject {

    public static StagiaireDto create(Contrat contrat, boolean evalue) {
        return new StagiaireDto(
                contrat.getId(),
                contrat.titreOffre(),
                contrat.nomEtudiant(),
                contrat.disciplineEtudiant(),
                contrat.nomEntreprise(),
                contrat.nomSuperviseur(),
                contrat.telephoneSuperviseur(),
                contrat.getDateDebut(),
                contrat.getDateFin(),
                evalue);
    }
}