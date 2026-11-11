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
                             String messageRefusConvocation,
                             Integer anneeOffre,
                             ConvocationResumeDto convocation) {

    public CandidatureDto(int id,
                          StatutCandidature statut,
                          LocalDateTime dateCandidature,
                          EtudiantDto etudiant,
                          String messageReponse,
                          LocalDateTime dateDecision) {
        this(id, statut, dateCandidature, etudiant, messageReponse, dateDecision, null, null, null, null, null);
    }

    public CandidatureDto(int id,
                          StatutCandidature statut,
                          LocalDateTime dateCandidature,
                          EtudiantDto etudiant,
                          String messageReponse,
                          LocalDateTime dateDecision,
                          String titreOffre,
                          String nomEntreprise) {
        this(id, statut, dateCandidature, etudiant, messageReponse, dateDecision, titreOffre, nomEntreprise, null, null, null);
    }

    public CandidatureDto(int id,
                          StatutCandidature statut,
                          LocalDateTime dateCandidature,
                          EtudiantDto etudiant,
                          String messageReponse,
                          LocalDateTime dateDecision,
                          String titreOffre,
                          String nomEntreprise,
                          String messageRefusConvocation) {
        this(id, statut, dateCandidature, etudiant, messageReponse, dateDecision, titreOffre, nomEntreprise, messageRefusConvocation, null, null);
    }

    public static CandidatureDto create(Candidature candidature) {
        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();

        String messageRefus = candidature.derniereConvocation()
                .filter(conv -> conv.getStatut() == StatutConvocation.REFUSEE)
                .map(Convocation::getReponseEtudiant)
                .orElse(null);

        ConvocationResumeDto convocation = candidature.derniereConvocation()
                .map(ConvocationResumeDto::create)
                .orElse(null);

        return new CandidatureDto(
                candidature.getId() != null ? candidature.getId().intValue() : 0,
                candidature.getStatut(),
                candidature.getDateCandidature(),
                EtudiantDto.create(etudiant),
                candidature.getMessageReponse(),
                candidature.getDateDecision(),
                offre != null ? offre.getTitre() : null,
                offre != null ? offre.getNomEntreprise() : null,
                messageRefus,
                candidature.getAnneeOffre(),
                convocation
        );
    }

    public static List<CandidatureDto> create(List<Candidature> candidatures) {
        return candidatures.stream().map(CandidatureDto::create).toList();
    }
}