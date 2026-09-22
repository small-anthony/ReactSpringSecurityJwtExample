package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("P")
public class Professeur extends UserApp {

    public Professeur() {
        super();
    }

    public Professeur(String firstName, String lastName, Credentials credentials) {
        super(firstName, lastName, credentials);
    }
}
