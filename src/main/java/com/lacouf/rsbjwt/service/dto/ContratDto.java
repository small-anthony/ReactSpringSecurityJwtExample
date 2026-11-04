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
        boolean signeParGestionnaire,
        boolean refuseParEtudiant,
        boolean refuseParEmployeur,
        boolean refuseParGestionnaire) implements DataTransferObject {

    public ContratDto(
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
            boolean signeParGestionnaire) {
        this(
                id, candidatureId, offreId, titreOffre, nomEntreprise,
                employeurNom, employeurEmail, etudiantNom, etudiantPrenom,
                etudiantEmail, etudiantMatricule, dateDebut, dateFin,
                horaire, salaire, descriptionTaches, conditions,
                statut, dateCreation,
                signeParEtudiant, signeParEmployeur, signeParGestionnaire,
                false, false, false);
    }

    public static ContratDto create(Contrat c) {
        Etudiant etudiant = c.getEtudiant();
        Employeur employeur = c.getEmployeur();
        OffreStage offre = c.getOffreStage();

        return new ContratDto(
                c.getId(),
                c.getCandidatureId(),
                offre.getId(),
                offre.getTitre(),
                employeur.getEntreprise(),
                employeur.getFirstName() + " " + employeur.getLastName(),
                employeur.getEmail(),
                etudiant.getLastName(),
                etudiant.getFirstName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                c.getDateDebut(),
                c.getDateFin(),
                c.getHoraire(),
                c.getSalaire(),
                c.getDescriptionTaches(),
                c.getConditions(),
                c.getStatut(),
                c.getDateCreation(),
                c.isSigneParEtudiant(),
                c.isSigneParEmployeur(),
                c.isSigneParGestionnaire(),
                c.isRefuseParEtudiant(),
                c.isRefuseParEmployeur(),
                c.isRefuseParGestionnaire());
    }

    public static List<ContratDto> create(List<Contrat> contrats) {
        return contrats.stream().map(ContratDto::create).toList();
    }
}
