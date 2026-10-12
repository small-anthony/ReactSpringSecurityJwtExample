package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDateTime;

public class ConflitHoraireRequest {
    private LocalDateTime nouvelleDate;
    private String motif;

    public ConflitHoraireRequest() {}

    public ConflitHoraireRequest(LocalDateTime nouvelleDate, String motif) {
        this.nouvelleDate = nouvelleDate;
        this.motif = motif;
    }

    public LocalDateTime getNouvelleDate() {
        return nouvelleDate;
    }

    public void setNouvelleDate(LocalDateTime nouvelleDate) {
        this.nouvelleDate = nouvelleDate;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }
}
