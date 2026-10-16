package com.lacouf.rsbjwt.presentation.RequestDto;

import com.lacouf.rsbjwt.service.dto.RendezVousDto;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.util.List;

public record CreationConvocationRequest (
        String messageEmployeur,
        List<RendezVousDto> rendezVousPossibles
) implements DataTransferObject { }
