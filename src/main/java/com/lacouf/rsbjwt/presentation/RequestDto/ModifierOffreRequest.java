package com.lacouf.rsbjwt.presentation.RequestDto;

public record ModifierOffreRequest(Long id,
                                   String titre,
                                   String nomEntreprise,
                                   String description,
                                   String discipline,
                                   String duree,
                                   String salaire,
                                   String exigences) {
}
