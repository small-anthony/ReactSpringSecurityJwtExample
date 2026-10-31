package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;

import java.time.LocalDateTime;
import java.util.List;

public record CandidatureDto(int id,
                             StatutCandidature statut,
                             LocalDateTime dateCandidature,
                             EtudiantDto etudiant,
                             ContratDto contrat,
                             String messageReponse,
                             LocalDateTime dateDecision) {

    public static CandidatureDto create(Candidature candidature) {
        Etudiant etudiant = candidature.getEtudiant();
        Contrat contrat = candidature.getContrat();
        return new CandidatureDto(
                candidature.getId().intValue(),
                candidature.getStatut(),
                candidature.getDateCandidature(),
                EtudiantDto.create(etudiant),
                contrat != null ? ContratDto.create(contrat) : null,
                candidature.getMessageReponse(),
                candidature.getDateDecision()
        );
    }

    public static List<CandidatureDto> create(List<Candidature> candidatures) {
        return candidatures.stream().map(CandidatureDto::create).toList();
    }
}