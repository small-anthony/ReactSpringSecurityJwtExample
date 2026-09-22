package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("E")
public class Employeur extends UserApp {
    private String entreprise;
    private String telephone;

    @OneToMany(mappedBy = "employeur", cascade = CascadeType.ALL)
    private List<OffreStage> offres = new ArrayList<>();

    public Employeur() {
        super();
    }

    public Employeur(String firstName, String lastName, Credentials credentials, String entreprise, String telephone) {
        super(firstName, lastName, credentials);
        this.entreprise = entreprise;
        this.telephone = telephone;
    }

    public void ajouterOffre(OffreStage nouvelleOffre) {
        offres.add(nouvelleOffre);
        nouvelleOffre.setEmployeur(this);
    }

    public String getEntreprise() {
        return entreprise;
    }

    public String getTelephone() {
        return telephone;
    }
}
