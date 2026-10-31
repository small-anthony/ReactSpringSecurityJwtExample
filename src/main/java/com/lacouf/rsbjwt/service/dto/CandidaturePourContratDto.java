package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.util.Optional;

public record CandidaturePourContratDto(
        Long candidatureId,
        Long offreId,
        String titreOffre,
        String nomEntreprise,
        String employeurNom,
        String employeurEmail,
        Long etudiantId,
        String etudiantNom,
        String etudiantPrenom,
        String etudiantEmail,
        int etudiantMatricule,
        boolean contratExiste,
        Long contratId
) implements DataTransferObject {

    public static CandidaturePourContratDto create(Candidature c, Optional<Contrat> contratOpt) {
        Etudiant etudiant = c.getEtudiant();
        OffreStage offre = c.getOffreStage();
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        return new CandidaturePourContratDto(
                c.getId(),
                offre != null ? offre.getId() : null,
                offre != null ? offre.getTitre() : "N/A",
                employeur != null ? employeur.getEntreprise() : "N/A",
                employeur != null ? (employeur.getFirstName() + " " + employeur.getLastName()) : "N/A",
                employeur != null ? employeur.getEmail() : "N/A",
                etudiant != null ? etudiant.getId() : null,
                etudiant != null ? etudiant.getLastName() : "N/A",
                etudiant != null ? etudiant.getFirstName() : "N/A",
                etudiant != null ? etudiant.getEmail() : "N/A",
                etudiant != null ? etudiant.getMatricule() : 0,
                contratOpt.isPresent(),
                contratOpt.map(Contrat::getId).orElse(null)
        );
    }
}
