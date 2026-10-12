package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.Instant;
import java.util.List;

public record RendezVousDto(Instant date, String lieu) implements DataTransferObject {
	public static RendezVousDto create(RendezVous rendezVous) {
		return new RendezVousDto(rendezVous.getDate(), rendezVous.getLieu());
	}

	public static List<RendezVousDto> create(List<RendezVous> rendezVous) {}
}
