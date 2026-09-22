package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("S")
public class Etudiant extends UserApp {
    private int matricule;
    private String discipline;

    public Etudiant(String firstName, String lastName, Credentials credentials, int matricule, String discipline) {
        super( firstName, lastName, credentials);
        this.matricule = matricule;
        this.discipline = discipline;
    }

    public Etudiant () {}

    public int getMatricule() {
        return matricule;
    }

    public String getDiscipline() {
        return discipline;
    }
}
