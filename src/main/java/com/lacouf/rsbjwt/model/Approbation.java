package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Embeddable
public class Approbation {

    @Enumerated(EnumType.STRING)
    private StatusAcceptation status = StatusAcceptation.EN_ATTENTE;

    private String messageReponse;

    public Approbation() {
    }

    public void refuser(String message){
        this.messageReponse = message;
        this.status = StatusAcceptation.REFUSE;
    }

    public void accepter(){
        this.messageReponse = null;
        this.status = StatusAcceptation.ACCEPTE;
    }

    public StatusAcceptation getStatus() {
        return status;
    }

    public void setStatus(StatusAcceptation status) {
        this.status = status;
    }

    public String getMessageRefus() {
        return messageReponse;
    }
}
