package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("E")
public class Employeur extends UserApp {
    private String entreprise;
    private String posteOccupe;
    private String telephone;

    public Employeur() {
        super();
    }

    public Employeur(String firstName, String lastName, Credentials credentials, String entreprise, String posteOccupe, String telephone) {
        super(firstName, lastName, credentials);
        this.entreprise = entreprise;
        this.posteOccupe = posteOccupe;
        this.telephone = telephone;
    }

    public String getEntreprise() {
        return entreprise;
    }

    public String getPosteOccupe() {
        return posteOccupe;
    }

    public String getTelephone() {
        return telephone;
    }
}
