package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;

public record StatutCvDto(boolean hasCv, StatusAcceptation status, String messageRefus) {
}
