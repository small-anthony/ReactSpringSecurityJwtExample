package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.*;
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
		String reponseEtudiant,
		Long candidatureId,
		EtudiantDto etudiant,
		OffreStageDto offreStage
) implements DataTransferObject {

	public ConvocationDto(
			long id,
			String messageEmployeur,
			StatutConvocation statut,
			Instant dateLimite,
			List<RendezVousDto> rendezVousPossibles,
			RendezVousDto rendezVousSelection,
			String reponseEtudiant
	) {
		this(id, messageEmployeur, statut, dateLimite, rendezVousPossibles, rendezVousSelection, reponseEtudiant, null, null, null);
	}

	public static ConvocationDto create(Convocation convocation) {
		RendezVous rendezVousSelection = convocation.getRendezVousSelection();
		Candidature cand = convocation.getCandidature();
		OffreStage offre = cand != null ? cand.getOffreStage() : null;
		Etudiant etudiant = cand != null ? cand.getEtudiant() : null;

		return new ConvocationDto(
				convocation.getId(),
				convocation.getMessageEmployeur(),
				convocation.getStatut(),
				convocation.getDateLimite(),
				RendezVousDto.create(convocation.getRendezVousPossibles()),
				rendezVousSelection == null ? null : RendezVousDto.create(rendezVousSelection),
				convocation.getReponseEtudiant(),
				cand != null ? cand.getId() : null,
				etudiant != null ? EtudiantDto.create(etudiant) : null,
				offre != null ? OffreStageDto.create(offre) : null
		);
	}

	public static List<ConvocationDto> create(List<Convocation> convocations) {
		return convocations.stream().map(ConvocationDto::create).toList();
	}
}
