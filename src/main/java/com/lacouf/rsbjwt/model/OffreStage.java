package com.lacouf.rsbjwt.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class OffreStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre;
    private String nomEntreprise;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    private Employeur employeur;

    @OneToMany(mappedBy = "offreStage", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private final List<Candidature> candidatures = new ArrayList<>();

    public OffreStage() {}

    public OffreStage(String titre, String description, String nomEntreprise) {
        this.titre = titre;
        this.description = description;
        this.nomEntreprise = nomEntreprise;
    }

    public Long getId() {
        return id;
    }
    public String getTitre() {
        return titre;
    }

    public String getNomEntreprise() {
        return nomEntreprise;
    }

    public String getDescription() {
        return description;
    }

    public List<Candidature> getCandidatures() {
        return candidatures;
    }

    public void addCandidature(Candidature candidature) {
        candidatures.add(candidature);
    }

    public void setEmployeur(Employeur employeur) {
        this.employeur = employeur;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
