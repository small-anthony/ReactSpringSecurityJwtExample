package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;

public record CvDto(Long id, StatusAcceptation status, String message, Long etudiantId) {
    public static CvDto create(Cv cv) {
        return new CvDto(
                cv.getId(),
                cv.getStatusAcceptation(),
                cv.getMessageRefusApprobation(),
                cv.getEtudiantId());
    }
}
