package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDate;

public record ModifierOffreRequest(Long id,
                                   String titre,
                                   String nomEntreprise,
                                   String description,
                                   String discipline,
                                   String duree,
                                   String salaire,
                                   String exigences,
                                   String adresse,
                                   String ville,
                                   String codePostal,
                                   String telephone,
                                   LocalDate dateDebut,
                                   LocalDate dateFin) {
    public ModifierOffreRequest(Long id,
                                String titre,
                                String nomEntreprise,
                                String description,
                                String discipline,
                                String duree,
                                String salaire,
                                String exigences,
                                String adresse,
                                String ville,
                                String codePostal,
                                String telephone) {
        this(id, titre, nomEntreprise, description, discipline, duree, salaire, exigences, adresse, ville, codePostal, telephone, null, null);
    }
}
