package com.lacouf.rsbjwt.model.auth;

import java.util.HashSet;
import java.util.Set;

public enum Role{
	GESTIONNAIRE("ROLE_GESTIONNAIRE"),
	PROFESSEUR("ROLE_PROFESSEUR"),
	ETUDIANT("ROLE_ETUDIANT"),
	;

	private final String string;
	private final Set<Role> managedRoles = new HashSet<>();

	static{
		GESTIONNAIRE.managedRoles.add(PROFESSEUR);
		GESTIONNAIRE.managedRoles.add(ETUDIANT);
	}

	Role(String string){
		this.string = string;
	}

	@Override
	public String toString(){
		return string;
	}

}
