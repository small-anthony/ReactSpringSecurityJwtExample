package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"etudiant_id", "offre_stage_id"}))
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offre_stage_id")
    private OffreStage offreStage;

    private LocalDateTime dateCandidature = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    public Candidature() {}

    public Candidature(Etudiant etudiant, OffreStage offreStage) {
        this.etudiant = etudiant;
        this.offreStage = offreStage;
    }

    public Long getId() { return id; }
    public Etudiant getEtudiant() { return etudiant; }
    public OffreStage getOffreStage() { return offreStage; }
    public LocalDateTime getDateCandidature() { return dateCandidature; }
    public StatutCandidature getStatut() { return statut; }
    public void setStatut(StatutCandidature statut) { this.statut = statut; }
}