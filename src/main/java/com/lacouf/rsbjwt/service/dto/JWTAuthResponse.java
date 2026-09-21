package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

public record JWTAuthResponse(String accessToken, String tokenType) implements DataTransferObject {
    public JWTAuthResponse(String accessToken) {
        this(accessToken, "BEARER");
    }

    public JWTAuthResponse() {
        this(null, "BEARER");
    }
}
