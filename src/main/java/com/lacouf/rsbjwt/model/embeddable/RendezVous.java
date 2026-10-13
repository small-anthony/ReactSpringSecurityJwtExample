package com.lacouf.rsbjwt.model.embeddable;

import com.lacouf.rsbjwt.service.dto.RendezVousDto;
import jakarta.persistence.Embeddable;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

/// Representation d'un rendez-vous en n'importe quel contexte
@Embeddable
public class RendezVous {
	protected RendezVous() {}

	private Instant date;
	private String lieu;

	private RendezVous(String lieu, Instant date) {
		this.date = date;
		this.lieu = lieu;
	}

	public static RendezVous create(String lieu, Instant date) {
		if(lieu.isBlank()) {
			throw new IllegalArgumentException("lieu doit être spécifié");
		}
		if(!date.isAfter(Instant.now())) {
			throw new IllegalArgumentException("date doit être dans le futur");
		}

		return new RendezVous(lieu, date);
	}

	public static RendezVous create(RendezVousDto dto) {
		return create(dto.lieu(), dto.date());
	}

	public static List<RendezVous> create(List<RendezVousDto> dtos) {
		return dtos.stream().map(RendezVous::create).toList();
	}

	public static RendezVous read(String lieu, Instant date) {
		return new RendezVous(lieu, date);
	}

	public static RendezVous read(RendezVousDto dto) {
		return read(dto.lieu(), dto.date());
	}
	public static List<RendezVous> read(List<RendezVousDto> dtos) {
		return dtos.stream().map(RendezVous::read).toList();
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
