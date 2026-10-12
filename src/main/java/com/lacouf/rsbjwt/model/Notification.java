package com.lacouf.rsbjwt.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "destinataire_id")
    private UserApp destinataire;

    private String titre;

    @Column(length = 1000)
    private String message;

    private String type;

    private Long referenceId;

    private boolean lu = false;

    private LocalDateTime dateCreation = LocalDateTime.now();

    public Notification() {}

    public Notification(UserApp destinataire, String titre, String message, String type, Long referenceId) {
        this.destinataire = destinataire;
        this.titre = titre;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.lu = false;
        this.dateCreation = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserApp getDestinataire() {
        return destinataire;
    }

    public void setDestinataire(UserApp destinataire) {
        this.destinataire = destinataire;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public boolean isLu() {
        return lu;
    }

    public void setLu(boolean lu) {
        this.lu = lu;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
