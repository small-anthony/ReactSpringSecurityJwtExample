package com.lacouf.rsbjwt.presentation.RequestDto;

public class RefusConvocationRequest {
    private String motif;

    public RefusConvocationRequest() {}

    public RefusConvocationRequest(String motif) {
        this.motif = motif;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }
}
