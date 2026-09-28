package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;

public record CvDto(Long id, StatusAcceptation status, String message, Long etudiantId, String etudiantFirstName, String etudiantLastName, int etudiantMatricule) {
    public static CvDto create(Cv cv) {
        return new CvDto(
                cv.getId(),
                cv.getStatusAcceptation(),
                cv.getMessageRefusApprobation(),
                cv.getEtudiantId(),
                cv.getEtudiantFirstName(),
                cv.getEtudiantLastName(),
                cv.getEtudiantMatricule());
    }
}
