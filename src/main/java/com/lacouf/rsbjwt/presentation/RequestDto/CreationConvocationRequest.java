package com.lacouf.rsbjwt.presentation.RequestDto;

import java.time.LocalDateTime;

public class CreationConvocationRequest {
    private Long candidatureId;
    private LocalDateTime dateHeure;
    private String lieu;
    private String messageEmployeur;

    public CreationConvocationRequest() {}

    public CreationConvocationRequest(Long candidatureId, LocalDateTime dateHeure, String lieu, String messageEmployeur) {
        this.candidatureId = candidatureId;
        this.dateHeure = dateHeure;
        this.lieu = lieu;
        this.messageEmployeur = messageEmployeur;
    }

    public Long getCandidatureId() {
        return candidatureId;
    }

    public void setCandidatureId(Long candidatureId) {
        this.candidatureId = candidatureId;
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public String getMessageEmployeur() {
        return messageEmployeur;
    }

    public void setMessageEmployeur(String messageEmployeur) {
        this.messageEmployeur = messageEmployeur;
    }
}
