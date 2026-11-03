package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;

import java.time.LocalDateTime;
import java.util.List;

public record CandidatureDto(int id,
                             StatutCandidature statut,
                             LocalDateTime dateCandidature,
                             EtudiantDto etudiant,
                             String messageReponse,
                             LocalDateTime dateDecision,
                             String titreOffre,
                             String nomEntreprise) {

    public static CandidatureDto create(Candidature candidature) {
        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();
        return new CandidatureDto(
                candidature.getId().intValue(),
                candidature.getStatut(),
                candidature.getDateCandidature(),
                EtudiantDto.create(etudiant),
                candidature.getMessageReponse(),
                candidature.getDateDecision(),
                offre.getTitre(),
                offre.getNomEntreprise()
        );
    }

    public static List<CandidatureDto> create(List<Candidature> candidatures) {
        return candidatures.stream().map(CandidatureDto::create).toList();
    }
}