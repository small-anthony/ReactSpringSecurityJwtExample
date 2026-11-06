package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;

import java.time.Instant;
import java.util.List;

public record ConvocationResumeDto(
        long id,
        StatutConvocation statut,
        Instant dateLimite,
        String messageEmployeur,
        List<RendezVousDto> rendezVousPossibles,
        RendezVousDto rendezVousSelection
) {

    public static ConvocationResumeDto create(Convocation convocation) {
        RendezVous rendezVousSelection = convocation.getRendezVousSelection();
        return new ConvocationResumeDto(
                convocation.getId(),
                convocation.getStatut(),
                convocation.getDateLimite(),
                convocation.getMessageEmployeur(),
                RendezVousDto.create(convocation.getRendezVousPossibles()),
                rendezVousSelection == null ? null : RendezVousDto.create(rendezVousSelection)
        );
    }
}