package com.lacouf.rsbjwt.model;

import jakarta.persistence.*;

@Entity
public class Cv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
//    Si c'est pas H2, utiliser
//    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;

    @OneToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    public Cv() {
    }

    public void mettreAJour(byte[] nouvelData) {
        this.data = nouvelData;
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
