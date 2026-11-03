package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record CreationContratRequest(
        Long candidatureId,
        LocalDate dateDebut,
        LocalDate dateFin,
        String horaire,
        String salaire,
        String descriptionTaches,
        String conditions
) {
    public int getAnneeDebut() {
        return dateDebut != null ? dateDebut.getYear() : 0;
    }

    public long getNombreSemaines() {
        if (dateDebut == null || dateFin == null) return 1;
        return Math.max(1, ChronoUnit.WEEKS.between(dateDebut, dateFin));
    }
}