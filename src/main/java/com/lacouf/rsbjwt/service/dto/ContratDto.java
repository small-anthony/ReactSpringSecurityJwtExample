package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record ContratDto(
        Long id,
        Long candidatureId,
        Long offreId,
        String titreOffre,
        String nomEntreprise,
        String employeurNom,
        String employeurEmail,
        String etudiantNom,
        String etudiantPrenom,
        String etudiantEmail,
        int etudiantMatricule,
        LocalDate dateDebut,
        LocalDate dateFin,
        String horaire,
        String salaire,
        String descriptionTaches,
        String conditions,
        StatutContrat statut,
        Instant dateCreation,
        boolean signeParEtudiant,
        boolean signeParEmployeur,
        boolean signeParGestionnaire) implements DataTransferObject {

    public static ContratDto create(Contrat c) {
        Etudiant etudiant = c.getEtudiant();
        Employeur employeur = c.getEmployeur();
        OffreStage offre = c.getOffreStage();

        boolean signeEtudiant = c.getSignatureEtudiant() != null && c.getSignatureEtudiant().isValid();
        boolean signeEmployeur = c.getSignatureEmployeur() != null && c.getSignatureEmployeur().isValid();
        boolean signeGestionnaire = c.getSignatureGestionnaire() != null && c.getSignatureGestionnaire().isValid();

        return new ContratDto(
                c.getId(),
                c.getCandidature() != null ? c.getCandidature().getId() : null,
                offre != null ? offre.getId() : null,
                offre != null ? offre.getTitre() : "N/A",
                employeur != null ? employeur.getEntreprise() : "N/A",
                employeur != null ? (employeur.getFirstName() + " " + employeur.getLastName()) : "N/A",
                employeur != null ? employeur.getEmail() : "N/A",
                etudiant != null ? etudiant.getLastName() : "N/A",
                etudiant != null ? etudiant.getFirstName() : "N/A",
                etudiant != null ? etudiant.getEmail() : "N/A",
                etudiant != null ? etudiant.getMatricule() : 0,
                c.getDateDebut(),
                c.getDateFin(),
                c.getHoraire(),
                c.getSalaire(),
                c.getDescriptionTaches(),
                c.getConditions(),
                c.getStatut(),
                c.getDateCreation(),
                signeEtudiant,
                signeEmployeur,
                signeGestionnaire);
    }

    public static List<ContratDto> create(List<Contrat> contrats) {
        return contrats.stream().map(ContratDto::create).toList();
    }
}
