package com.lacouf.rsbjwt.model.embeddable;

import jakarta.persistence.Embeddable;

import java.time.Instant;
import java.util.Objects;

/// Representation d'un rendez-vous en n'importe quel contexte
@Embeddable
public class RendezVous {
	protected RendezVous() {}

	private Instant date;
	private String lieu;

	public RendezVous(String lieu, Instant date) {
		this.date = date;
		this.lieu = lieu;
	}

	public Instant getDate() {
		return date;
	}

	public String getLieu() {
		return lieu;
	}

	@Override
	public boolean equals(Object obj) {
		if(this == obj) return true;
		if(!(obj instanceof RendezVous that)) return false;

		return this.date.equals(that.date) && this.lieu.equals(that.lieu);
	}

	@Override
	public int hashCode() {
		return Objects.hash(date, lieu);
	}
}
