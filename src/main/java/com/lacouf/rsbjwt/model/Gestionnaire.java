package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.auth.Credentials;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("G")
public class Gestionnaire extends UserApp {
	public Gestionnaire(String firstName, String lastName, Credentials credentials) {
		super(firstName, lastName, credentials);
	}

	public Gestionnaire() {

	}
}
