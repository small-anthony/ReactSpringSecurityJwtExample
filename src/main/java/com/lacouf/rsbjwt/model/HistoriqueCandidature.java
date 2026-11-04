package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class HistoriqueCandidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Candidature candidature;

    @Enumerated(EnumType.STRING)
    private StatutCandidature ancienStatut;

    @Enumerated(EnumType.STRING)
    private StatutCandidature nouveauStatut;

    @Column(length = 1000)
    private String message;

    private LocalDateTime dateDecision = LocalDateTime.now();

    private String auteurEmail;

    public HistoriqueCandidature() {}

    public HistoriqueCandidature(Candidature candidature, StatutCandidature ancienStatut,
                                 StatutCandidature nouveauStatut, String message, String auteurEmail) {
        this.candidature = candidature;
        this.ancienStatut = ancienStatut;
        this.nouveauStatut = nouveauStatut;
        this.message = message;
        this.auteurEmail = auteurEmail;
    }

    public Long getId() { return id; }
    public Candidature getCandidature() { return candidature; }
    public StatutCandidature getAncienStatut() { return ancienStatut; }
    public StatutCandidature getNouveauStatut() { return nouveauStatut; }
    public String getMessage() { return message; }
    public LocalDateTime getDateDecision() { return dateDecision; }
    public String getAuteurEmail() { return auteurEmail; }
}