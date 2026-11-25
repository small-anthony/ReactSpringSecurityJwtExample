package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDate;

public record ModifierOffreRequest(Long id,
                                   String titre,
                                   String nomEntreprise,
                                   String description,
                                   String discipline,
                                   String salaire,
                                   String exigences,
                                   String adresse,
                                   String ville,
                                   String codePostal,
                                   String telephone,
                                   LocalDate dateDebut,
                                   LocalDate dateFin) {
}
