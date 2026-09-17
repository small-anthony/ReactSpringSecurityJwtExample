package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.enums.CvStatus;
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

    @Enumerated(EnumType.STRING)
    private CvStatus cvStatus;

    @OneToOne
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    public Cv() {
    }

    public Cv(Long id, byte[] data, CvStatus cvStatus, Etudiant etudiant) {
        this.id = id;
        this.data = data;
        this.cvStatus = cvStatus;
        this.etudiant = etudiant;
    }

    public Long getId() {
        return id;
    }

    public byte[] getData() {
        return data;
    }

    public CvStatus getCvStatus() {
        return cvStatus;
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

    public void setCvStatus(CvStatus cvStatus) {
        this.cvStatus = cvStatus;
    }

    public void setEtudiant(Etudiant etudiant) {
        this.etudiant = etudiant;
    }
}
