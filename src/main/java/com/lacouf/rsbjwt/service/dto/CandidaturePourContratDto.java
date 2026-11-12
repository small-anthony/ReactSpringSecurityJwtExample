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
        Long contratId,
        String salaireOffre,
        String descriptionOffre
) implements DataTransferObject {

    public CandidaturePourContratDto(
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
    ) {
        this(candidatureId, offreId, titreOffre, nomEntreprise, employeurNom, employeurEmail,
                etudiantId, etudiantNom, etudiantPrenom, etudiantEmail, etudiantMatricule,
                contratExiste, contratId, null, null);
    }

    public static CandidaturePourContratDto create(Candidature c, Optional<Contrat> contratOpt) {
        Etudiant etudiant = c.getEtudiant();
        OffreStage offre = c.getOffreStage();
        Employeur employeur = c.getEmployeur();

        return new CandidaturePourContratDto(
                c.getId(),
                offre != null ? offre.getId() : null,
                c.getTitreOffre(),
                employeur != null ? employeur.getEntreprise() : null,
                employeur != null ? (employeur.getFirstName() + " " + employeur.getLastName()) : null,
                employeur != null ? employeur.getEmail() : null,
                etudiant != null ? etudiant.getId() : null,
                etudiant != null ? etudiant.getLastName() : null,
                etudiant != null ? etudiant.getFirstName() : null,
                etudiant != null ? etudiant.getEmail() : null,
                etudiant != null ? etudiant.getMatricule() : 0,
                contratOpt.isPresent(),
                contratOpt.map(Contrat::getId).orElse(null),
                c.getSalaireOffre(),
                c.getDescriptionOffre()
        );
    }
}
