package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
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
		return new ConvocationDto(
				convocation.getId(),
				convocation.getMessageEmployeur(),
				convocation.getStatut(),
				convocation.getDateLimite(),
				RendezVousDto.create(convocation.getRendezVousPossibles()),
				RendezVousDto.create(convocation.getRendezVousSelection()),
				convocation.getReponseEtudiant()
		);
	}
}
