package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Convocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "candidature_id")
    private Candidature candidature;

    private LocalDateTime dateHeure;

    private String lieu;

    @Column(length = 1000)
    private String messageEmployeur;

    @Enumerated(EnumType.STRING)
    private StatutConvocation statut = StatutConvocation.EN_ATTENTE;

    private LocalDateTime dateProposeeEtudiant;

    @Column(length = 1000)
    private String motifEtudiant;

    private LocalDateTime dateCreation = LocalDateTime.now();

    public Convocation() {}

    public Convocation(Candidature candidature, LocalDateTime dateHeure, String lieu, String messageEmployeur) {
        this.candidature = candidature;
        this.dateHeure = dateHeure;
        this.lieu = lieu;
        this.messageEmployeur = messageEmployeur;
        this.statut = StatutConvocation.EN_ATTENTE;
        this.dateCreation = LocalDateTime.now();
    }

    public boolean estPassee() {
        return dateHeure != null && dateHeure.isBefore(LocalDateTime.now());
    }

    public void accepter() {
        this.statut = StatutConvocation.ACCEPTEE;
    }

    public void refuser(String motif) {
        this.statut = StatutConvocation.REFUSEE;
        this.motifEtudiant = motif;
    }

    public void proposerAutreDate(LocalDateTime nouvelleDate, String motif) {
        this.statut = StatutConvocation.CONFLIT_HORAIRE;
        this.dateProposeeEtudiant = nouvelleDate;
        this.motifEtudiant = motif;
    }

    public void marquerEnAttenteReponse() {
        this.statut = StatutConvocation.EN_ATTENTE_REPONSE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Candidature getCandidature() {
        return candidature;
    }

    public void setCandidature(Candidature candidature) {
        this.candidature = candidature;
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public String getMessageEmployeur() {
        return messageEmployeur;
    }

    public void setMessageEmployeur(String messageEmployeur) {
        this.messageEmployeur = messageEmployeur;
    }

    public StatutConvocation getStatut() {
        return statut;
    }

    public void setStatut(StatutConvocation statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateProposeeEtudiant() {
        return dateProposeeEtudiant;
    }

    public void setDateProposeeEtudiant(LocalDateTime dateProposeeEtudiant) {
        this.dateProposeeEtudiant = dateProposeeEtudiant;
    }

    public String getMotifEtudiant() {
        return motifEtudiant;
    }

    public void setMotifEtudiant(String motifEtudiant) {
        this.motifEtudiant = motifEtudiant;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
