package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Etudiant;

import java.util.List;

public record RapportEtudiantDto(
        int id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        String statutStage,
        List<CandidatureDto> candidatures
) {
    public static RapportEtudiantDto create(Etudiant etudiant, Integer annee) {
        List<Candidature> cands = etudiant.getCandidatures();

        if (annee != null) {
            cands = cands.stream()
                    .filter(c -> c.getOffreStage().getAnnee() == annee)
                    .toList();
        }

        return new RapportEtudiantDto(
                etudiant.getId().intValue(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                determinerStatut(cands),
                CandidatureDto.create(cands)
        );
    }

    private static String determinerStatut(List<Candidature> candidatures) {
        if (candidatures.isEmpty()) {
            return "AUCUNE_CANDIDATURE";
        }
        boolean stageTrouve = candidatures.stream().anyMatch(c ->
                c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE
        );
        if (stageTrouve) {
            return "STAGE_TROUVE";
        }

        boolean attenteReponse = candidatures.stream().anyMatch(c ->
                c.getStatut() == StatutCandidature.EN_ATTENTE_REPONSE
        );
        if (attenteReponse) {
            return "EN_ATTENTE_REPONSE";
        }

        boolean attenteEntrevue = candidatures.stream().anyMatch(c ->
                c.getConvocations().stream().anyMatch(conv ->
                        conv.getStatut() == StatutConvocation.EN_ATTENTE
                )
        );
        if (attenteEntrevue) {
            return "EN_ATTENTE_ENTREVUE";
        }

        return "SANS_CONVOCATION";
    }
}