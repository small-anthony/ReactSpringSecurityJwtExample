package com.lacouf.rsbjwt.model;

import jakarta.persistence.*;

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

    public OffreStage() {}

    public OffreStage(String titre, String description, String nomEntreprise) {
        this.titre = titre;
        this.description = description;
        this.nomEntreprise = nomEntreprise;
    }

    private Long getId() {
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
}
