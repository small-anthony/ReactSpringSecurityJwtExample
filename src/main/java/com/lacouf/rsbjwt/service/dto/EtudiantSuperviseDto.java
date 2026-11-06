package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;

import java.util.List;

public record EtudiantSuperviseDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        int matricule,
        String discipline,
        String statutStage,
        String entrepriseStage,
        String titreOffreStage,
        List<CandidatureDto> candidatures
) {
    public static EtudiantSuperviseDto create(Etudiant etudiant) {
        if (etudiant == null) return null;

        List<Candidature> candidatures = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();

        Candidature candStage = candidatures.stream()
                .filter(c -> c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE)
                .findFirst()
                .orElse(null);

        String statut = candStage != null ? candStage.getStatut().name() : "EN_RECHERCHE";
        String titre = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getTitre() : "Aucun stage";
        String entreprise = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getNomEntreprise() : "Non déterminé";

        return new EtudiantSuperviseDto(
                etudiant.getId(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                statut,
                entreprise,
                titre,
                CandidatureDto.create(candidatures)
        );
    }

    public static EtudiantSuperviseDto createFilteredByAnnee(Etudiant etudiant, int annee) {
        if (etudiant == null) return null;

        List<Candidature> candidatures = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();

        List<Candidature> candidaturesFiltrees = candidatures.stream()
                .filter(c -> c.getOffreStage() != null && c.getOffreStage().getAnnee() == annee)
                .toList();

        Candidature candStage = candidaturesFiltrees.stream()
                .filter(c -> c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE)
                .findFirst()
                .orElse(null);

        String statut = candStage != null ? candStage.getStatut().name() : "EN_RECHERCHE";
        String titre = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getTitre() : "Aucun stage";
        String entreprise = (candStage != null && candStage.getOffreStage() != null) ? candStage.getOffreStage().getNomEntreprise() : "Non déterminé";

        return new EtudiantSuperviseDto(
                etudiant.getId(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                statut,
                entreprise,
                titre,
                CandidatureDto.create(candidaturesFiltrees)
        );
    }
}
