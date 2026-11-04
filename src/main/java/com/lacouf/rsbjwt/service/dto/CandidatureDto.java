package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
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
                             String nomEntreprise,
                             String messageRefusConvocation) {

    public CandidatureDto(int id,
                          StatutCandidature statut,
                          LocalDateTime dateCandidature,
                          EtudiantDto etudiant,
                          String messageReponse,
                          LocalDateTime dateDecision) {
        this(id, statut, dateCandidature, etudiant, messageReponse, dateDecision, null, null, null);
    }

    public CandidatureDto(int id,
                          StatutCandidature statut,
                          LocalDateTime dateCandidature,
                          EtudiantDto etudiant,
                          String messageReponse,
                          LocalDateTime dateDecision,
                          String titreOffre,
                          String nomEntreprise) {
        this(id, statut, dateCandidature, etudiant, messageReponse, dateDecision, titreOffre, nomEntreprise, null);
    }

    public static CandidatureDto create(Candidature candidature) {
        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();

        String messageRefus = null;
        if (candidature.getConvocations() != null) {
            for (Convocation conv : candidature.getConvocations()) {
                if (conv.getStatut() == StatutConvocation.REFUSEE) {
                    messageRefus = conv.getReponseEtudiant();
                }
            }
        }

        return new CandidatureDto(
                candidature.getId().intValue(),
                candidature.getStatut(),
                candidature.getDateCandidature(),
                EtudiantDto.create(etudiant),
                candidature.getMessageReponse(),
                candidature.getDateDecision(),
                offre != null ? offre.getTitre() : null,
                offre != null ? offre.getNomEntreprise() : null,
                messageRefus
        );
    }

    public static List<CandidatureDto> create(List<Candidature> candidatures) {
        return candidatures.stream().map(CandidatureDto::create).toList();
    }
}
