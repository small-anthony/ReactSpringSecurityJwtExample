package com.lacouf.rsbjwt.service.dto;

public record JWTAuthResponse(String accessToken, String tokenType) {
    public JWTAuthResponse(String accessToken) {
        this(accessToken, "BEARER");
    }

    public JWTAuthResponse() {
        this(null, "BEARER");
    }
}
