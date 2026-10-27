package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDate;

public record CreationContratRequest(
        Long candidatureId,
        LocalDate dateDebut,
        LocalDate dateFin,
        String horaire,
        String salaire,
        String descriptionTaches,
        String conditions
) {}
