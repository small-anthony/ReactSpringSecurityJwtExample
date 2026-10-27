package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import java.time.Instant;
import java.time.LocalDate;

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
        boolean signeParGestionnaire
) {}
