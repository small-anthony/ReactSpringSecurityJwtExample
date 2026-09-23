package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Cv;

public record CvDto(Long id) {
    public static CvDto create(Cv cv) {
        return new CvDto(cv.getId());
    }
}
