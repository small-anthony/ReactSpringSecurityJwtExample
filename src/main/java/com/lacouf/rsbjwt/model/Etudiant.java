package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;

@Entity
@DiscriminatorValue("S")
public class Etudiant extends UserApp {
    private int matricule;
    private String discipline;

    @OneToOne(mappedBy = "etudiant", cascade = CascadeType.ALL)
    private Cv cv;

    public Etudiant(String firstName, String lastName, Credentials credentials, int matricule, String discipline) {
        super(firstName, lastName, credentials);
        this.matricule = matricule;
        this.discipline = discipline;
    }

    public void setCv(byte[] fichierData) {
        if (this.cv == null) {
            cv = new Cv();
            cv.setEtudiant(this);
        }
        cv.mettreAJour(fichierData);
    }

    public Etudiant () {}

    public int getMatricule() {
        return matricule;
    }

    public String getDiscipline() {
        return discipline;
    }

    public Cv getCv() {
        return cv;
    }

    public void setCv(Cv cv) {
        this.cv = cv;
    }
}
