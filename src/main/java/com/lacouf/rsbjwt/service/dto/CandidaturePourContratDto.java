package com.lacouf.rsbjwt.service.dto;

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
) {}
