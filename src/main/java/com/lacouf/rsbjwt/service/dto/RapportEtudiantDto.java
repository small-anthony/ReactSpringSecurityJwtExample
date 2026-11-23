package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Etudiant;

import java.util.List;
import java.util.function.Predicate;

public record RapportEtudiantDto(
        int id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        String statutStage,
        List<CandidatureDto> candidatures,
        boolean milieuEvalue,
        Long evaluationMilieuId
) {
    public RapportEtudiantDto(
            int id,
            String firstName,
            String lastName,
            String email,
            int matricule,
            String discipline,
            List<CandidatureDto> candidatures
    ) {
        this(id, firstName, lastName, email, matricule, discipline, null, candidatures, false, null);
    }

    public RapportEtudiantDto(
            int id,
            String firstName,
            String lastName,
            String email,
            int matricule,
            String discipline,
            String statutStage,
            List<CandidatureDto> candidatures
    ) {
        this(id, firstName, lastName, email, matricule, discipline, statutStage, candidatures, false, null);
    }

    public RapportEtudiantDto(
            int id,
            String firstName,
            String lastName,
            String email,
            int matricule,
            String discipline,
            List<CandidatureDto> candidatures,
            boolean milieuEvalue,
            Long evaluationMilieuId
    ) {
        this(id, firstName, lastName, email, matricule, discipline, null, candidatures, milieuEvalue, evaluationMilieuId);
    }

    public static RapportEtudiantDto create(Etudiant etudiant) {
        return create(etudiant, false, null);
    }

    public static RapportEtudiantDto create(Etudiant etudiant, Integer annee) {
        return create(etudiant, annee, false, null);
    }

    public static RapportEtudiantDto create(Etudiant etudiant, boolean milieuEvalue, Long evaluationMilieuId) {
        return create(etudiant, null, milieuEvalue, evaluationMilieuId);
    }

    public static RapportEtudiantDto create(
            Etudiant etudiant,
            Integer annee,
            boolean milieuEvalue,
            Long evaluationMilieuId
    ) {
        return create(etudiant, annee, milieuEvalue, evaluationMilieuId, null);
    }

    public static RapportEtudiantDto create(
            Etudiant etudiant,
            Integer annee,
            boolean milieuEvalue,
            Long evaluationMilieuId,
            Predicate<Candidature> aContratSigne
    ) {
        List<Candidature> cands = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();
        if (annee != null) {
            cands = cands.stream()
                    .filter(c -> c.getOffreStage() != null && c.getOffreStage().getAnnee() == annee)
                    .toList();
        }
        return new RapportEtudiantDto(
                etudiant.getId().intValue(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                determinerStatut(cands, aContratSigne),
                CandidatureDto.create(cands),
                milieuEvalue,
                evaluationMilieuId
        );
    }

    public static RapportEtudiantDto createFilteredByAnnee(Etudiant etudiant, int annee) {
        return create(etudiant, annee, false, null, null);
    }

    public static RapportEtudiantDto createFilteredByAnnee(
            Etudiant etudiant,
            int annee,
            boolean milieuEvalue,
            Long evaluationMilieuId
    ) {
        return create(etudiant, annee, milieuEvalue, evaluationMilieuId, null);
    }

    public static RapportEtudiantDto createFilteredByAnnee(
            Etudiant etudiant,
            int annee,
            boolean milieuEvalue,
            Long evaluationMilieuId,
            Predicate<Candidature> aContratSigne
    ) {
        return create(etudiant, annee, milieuEvalue, evaluationMilieuId, aContratSigne);
    }

    private static String determinerStatut(List<Candidature> candidatures, Predicate<Candidature> aContratSigne) {
        if (candidatures == null || candidatures.isEmpty()) {
            return "AUCUNE_CANDIDATURE";
        }
        boolean stageTrouve = (aContratSigne != null && candidatures.stream().anyMatch(aContratSigne))
                || candidatures.stream().anyMatch(c -> c.getStatut() == StatutCandidature.EMBAUCHEE);
        if (stageTrouve) {
            return "STAGE_TROUVE";
        }
        if (candidatures.stream().anyMatch(c -> c.getStatut() == StatutCandidature.EN_ATTENTE_SIGNATURE)) {
            return "EN_ATTENTE_SIGNATURE";
        }
        if (candidatures.stream().anyMatch(c -> c.getStatut() == StatutCandidature.EN_ATTENTE_CHOIX_STAGE)) {
            return "EN_ATTENTE_CHOIX_STAGE";
        }
        if (candidatures.stream().anyMatch(c -> c.getStatut() == StatutCandidature.EN_ATTENTE_ENTREVUE)) {
            return "EN_ATTENTE_ENTREVUE";
        }
        boolean attenteConfirmation = candidatures.stream().anyMatch(c ->
                c.getStatut() == StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE
                        || (c.getConvocations() != null && c.getConvocations().stream().anyMatch(conv ->
                                conv.getStatut() == StatutConvocation.EN_ATTENTE
                        ))
        );
        if (attenteConfirmation) {
            return "EN_ATTENTE_CONFIRMATION_ENTREVUE";
        }
        return "SANS_CONVOCATION";
    }
}