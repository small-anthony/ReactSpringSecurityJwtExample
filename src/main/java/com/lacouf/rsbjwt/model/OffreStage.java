package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
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
    private String discipline;
    private String salaire;
    private String duree;
    private String exigences;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    private Employeur employeur;

    @ManyToMany(fetch = FetchType.LAZY)
    private List<Etudiant> etudiantsAutorises = new ArrayList<>();

    @Embedded
    private Approbation approbation = new Approbation();

    public OffreStage() {
    }

    public OffreStage(String titre, String description, String nomEntreprise) {
        this.titre = titre;
        this.description = description;
        this.nomEntreprise = nomEntreprise;
        this.etudiantsAutorises = new ArrayList<>();
    }

    public OffreStage(String titre, String description, String nomEntreprise, String discipline, String salaire,
            String duree, String exigences) {
        this.titre = titre;
        this.description = description;
        this.nomEntreprise = nomEntreprise;
        this.discipline = discipline;
        this.salaire = salaire;
        this.duree = duree;
        this.exigences = exigences;
        this.etudiantsAutorises = new ArrayList<>();
    }

    public OffreStage(String titre, String description, Employeur employeur,
            String discipline, String salaire, String duree, String exigences) {
        this.titre = titre;
        this.description = description;
        this.employeur = employeur;
        this.discipline = discipline;
        this.salaire = salaire;
        this.duree = duree;
        this.exigences = exigences;
    }

    public void accepter() throws Exception {
        if (!isEnAttente()) {
            throw new Exception("Cette offre a déjà été traitée.");
        }
        this.approbation.accepter();
    }

    public void refuser(String message) throws Exception {
        if (!isEnAttente()) {
            throw new Exception("Cette offre a déjà été traitée.");
        }
        this.approbation.refuser(message);
    }

    public void attribuerVisibilite(List<Etudiant> etudiants) {
        if (etudiants != null && !etudiants.isEmpty()) {
            this.etudiantsAutorises = etudiants;
        } else {
            this.etudiantsAutorises.clear();
        }
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

    public List<Etudiant> getEtudiantsAutorises() {
        return etudiantsAutorises;
    }

    public boolean isEnAttente() {
        return this.approbation.getStatus() == StatusAcceptation.EN_ATTENTE;
    }

    public StatusAcceptation getStatus() {
        return this.approbation.getStatus();
    }

    public String getMessageReponse() {
        return this.approbation.getMessageRefus();
    }

    public void setEmployeur(Employeur employeur) {
        this.employeur = employeur;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDiscipline() {
        return discipline;
    }

    public void setDiscipline(String discipline) {
        this.discipline = discipline;
    }

    public String getSalaire() {
        return salaire;
    }

    public void setSalaire(String salaire) {
        this.salaire = salaire;
    }

    public String getDuree() {
        return duree;
    }

    public void setDuree(String duree) {
        this.duree = duree;
    }

    public String getExigences() {
        return exigences;
    }

    public void setExigences(String exigences) {
        this.exigences = exigences;
    }
}
