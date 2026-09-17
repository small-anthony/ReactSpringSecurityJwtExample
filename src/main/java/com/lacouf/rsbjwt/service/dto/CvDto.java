package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.enums.CvStatus;

public record CvDto(Long id, CvStatus status) {
    public static CvDto create(Cv cv) {
        return new CvDto(cv.getId(), cv.getCvStatus());
    }
}
