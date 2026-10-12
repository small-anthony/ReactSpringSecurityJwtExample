package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import jakarta.persistence.*;

@Entity
public class Cv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "bytea")
    private byte[] data;

    @OneToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @Embedded
    private Approbation approbation = new Approbation();

    public Cv() {
    }

    public void mettreAJour(byte[] nouvelData) {
        this.data = nouvelData;
        approbation.setStatus(StatusAcceptation.EN_ATTENTE);
    }

    public void accepterApprobation() {
        this.approbation.accepter();
    }

    public void refuserApprobation(String message) {
        this.approbation.refuser(message);
    }

    public Long getId() {
        return id;
    }

    public byte[] getData() {
        return data;
    }

    public Etudiant getEtudiant() {
        return etudiant;
    }

    public String getEtudiantFirstName() {
        return this.etudiant != null ? etudiant.getFirstName() : null;
    }

    public String getEtudiantLastName() {
        return this.etudiant != null ? this.etudiant.getLastName() : null;
    }

    public int getEtudiantMatricule() {
        return this.etudiant != null ? this.etudiant.getMatricule() : 0;
    }

    public StatusAcceptation getStatusAcceptation() {
        return this.approbation.getStatus();
    }

    public String getMessageRefusApprobation() {
        return this.approbation.getMessageRefus();
    }

    public Long getEtudiantId() {
        return this.etudiant != null ? this.etudiant.getId() : null;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public void setEtudiant(Etudiant etudiant) {
        this.etudiant = etudiant;
    }
}
