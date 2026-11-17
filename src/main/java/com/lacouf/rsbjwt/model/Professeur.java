package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("P")
public class Professeur extends UserApp {

    @OneToMany(mappedBy = "professeur")
    private List<Etudiant> etudiants = new ArrayList<>();

    public Professeur() {
        super();
    }

    public Professeur(String firstName, String lastName, Credentials credentials) {
        super(firstName, lastName, credentials);
    }

    public List<Etudiant> getEtudiants() {
        return etudiants;
    }

    public void setEtudiants(List<Etudiant> etudiants) {
        this.etudiants = etudiants;
    }
}
