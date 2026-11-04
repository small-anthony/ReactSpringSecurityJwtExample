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
        Employeur employeur = c.getEmployeur();

        return new CandidaturePourContratDto(
                c.getId(),
                offre.getId(),
                offre.getTitre(),
                employeur.getEntreprise(),
                employeur.getFirstName() + " " + employeur.getLastName(),
                employeur.getEmail(),
                etudiant.getId(),
                etudiant.getLastName(),
                etudiant.getFirstName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                contratOpt.isPresent(),
                contratOpt.map(Contrat::getId).orElse(null)
        );
    }
}
