package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.Instant;
import java.util.List;

public record ConvocationDto (
		long id,
		String messageEmployeur,
		StatutConvocation statut,
		Instant dateLimite,
		List<RendezVousDto> rendezVousPossibles,
		RendezVousDto rendezVousSelection,
		String reponseEtudiant
) implements DataTransferObject {
	public static ConvocationDto create(Convocation convocation) {
		RendezVous rendezVousSelection = convocation.getRendezVousSelection();
		return new ConvocationDto(
				convocation.getId(),
				convocation.getMessageEmployeur(),
				convocation.getStatut(),
				convocation.getDateLimite(),
				RendezVousDto.create(convocation.getRendezVousPossibles()),
				rendezVousSelection == null ? null : RendezVousDto.create(convocation.getRendezVousSelection()),
				convocation.getReponseEtudiant()
		);
	}

	public static List<ConvocationDto> create(List<Convocation> convocations) {
		return convocations.stream().map(ConvocationDto::create).toList();
	}
}
