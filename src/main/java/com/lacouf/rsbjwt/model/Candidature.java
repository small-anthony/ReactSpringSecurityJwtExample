package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"etudiant_id", "offre_stage_id"}))
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offre_stage_id")
    private OffreStage offreStage;

    private LocalDateTime dateCandidature = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    @Column(length = 1000)
    private String messageReponse;

    private LocalDateTime dateDecision;

    @OneToMany(mappedBy = "candidature", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Convocation> convocations = new ArrayList<>();

    public Candidature() {}

    public Candidature(Etudiant etudiant, OffreStage offreStage) {
        this.etudiant = etudiant;
        this.offreStage = offreStage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Etudiant getEtudiant() { return etudiant; }
    public Employeur getEmployeur() { return offreStage.getEmployeur(); }
    public OffreStage getOffreStage() { return offreStage; }
    public LocalDateTime getDateCandidature() { return dateCandidature; }
    public StatutCandidature getStatut() { return statut; }
    public void setStatut(StatutCandidature statut) { this.statut = statut; }

    public String getMessageReponse() { return messageReponse; }
    public void setMessageReponse(String messageReponse) { this.messageReponse = messageReponse; }

    public LocalDateTime getDateDecision() { return dateDecision; }
    public void setDateDecision(LocalDateTime dateDecision) { this.dateDecision = dateDecision; }

    public List<Convocation> getConvocations() {
        return convocations;
    }

    public void addConvocation(Convocation convocation) {
        convocation.setCandidature(this);
        convocations.add(convocation);
    }

    public boolean appartientAEmployeur(String courriel) {
        return getEmployeur().aPourCourriel(courriel);
    }

    public boolean appartientAEtudiant(String courriel) {
        return etudiant.aPourCourriel(courriel);
    }

    public Convocation getDerniereConvocation() {
        try {
            if (convocations == null || convocations.isEmpty()) {
                return null;
            }
            return convocations.get(convocations.size() - 1);
        } catch (Exception e) {
            return null;
        }
    }

    public String getMessageRefusConvocation() {
        Convocation derniere = getDerniereConvocation();
        if (derniere != null && derniere.getStatut() == StatutConvocation.REFUSEE) {
            return derniere.getReponseEtudiant() != null ? derniere.getReponseEtudiant() : "";
        }
        return null;
    }
}