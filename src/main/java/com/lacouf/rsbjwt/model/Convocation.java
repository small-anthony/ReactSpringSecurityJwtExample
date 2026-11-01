package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.Period;
import java.util.List;

@Entity
public class Convocation {
    public Convocation() {}

    private static final Period MINIMUM_REPONSE_LIMIT = Period.ofDays(3);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String messageEmployeur = null;

    @Enumerated(EnumType.STRING)
    private StatutConvocation statut = StatutConvocation.EN_ATTENTE;

    private Instant dateLimite = Instant.now().plus(MINIMUM_REPONSE_LIMIT);

    @ElementCollection
    @CollectionTable(
            name = "rendez_vous_possibles",
            joinColumns = @JoinColumn(name = "rendez_vous_id")
    )
    private List<RendezVous> rendezVousPossibles;

    @Embedded
    private RendezVous rendezVousSelection = null;

    @Column(length = 1000)
    private String reponseEtudiant = null;

    @ManyToOne(optional = false, fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    private Candidature candidature;

    public Convocation(List<RendezVous> rendezVousPossibles) throws Exception {
        if(rendezVousPossibles == null || rendezVousPossibles.isEmpty()) {
            throw new Exception("rendezvous must have at least one entry");
        }
        this.rendezVousPossibles = rendezVousPossibles;
    }

    public Convocation(List<RendezVous> rendezVousPossibles, String messageEmployeur) throws Exception {
        this(rendezVousPossibles);
        this.messageEmployeur = messageEmployeur;
    }

    public boolean estPassee() {
        return !dateLimite.isAfter(Instant.now());
    }

    public boolean estResolu() {
        return getStatut() != StatutConvocation.EN_ATTENTE;
    }

    public void accepter(RendezVous rendezVous, String message) throws Exception {
        if(estResolu()) {
            throw new Exception("convocation already resolved");
        }
        if(!rendezVousPossibles.contains(rendezVous)) {
            throw new Exception("tried to select rendezvous we don't have");
        }

        this.statut = StatutConvocation.ACCEPTEE;
        this.candidature.setStatut(StatutCandidature.ACCEPTEE);
        this.rendezVousSelection = rendezVous;
        this.reponseEtudiant = message;
    }

    public void refuser(String motif) throws Exception {
        if(estResolu()) {
            throw new Exception("convocation already resolved");
        }
        this.statut = StatutConvocation.REFUSEE;
        this.candidature.setStatut(StatutCandidature.REFUSEE);
        this.reponseEtudiant = motif;
    }

    public void annuler() throws Exception {
        if(estResolu()) {
            throw new Exception("convocation already resolved");
        }
        this.statut = StatutConvocation.ANNULEE;
    }

    public void updateDetails(List<RendezVous> rendezVousPossibles, String messageEmployeur) throws Exception {
        if(estResolu()) {
            throw new Exception("convocation already resolved");
        }
        if(rendezVousPossibles == null || rendezVousPossibles.isEmpty()) {
            throw new Exception("rendezvous must have at least one entry");
        }
        this.rendezVousPossibles = rendezVousPossibles;
        this.messageEmployeur = messageEmployeur;
    }

    public Long getId() {
        return id;
    }

    public StatutConvocation getStatut() {
        if(statut == StatutConvocation.EN_ATTENTE && estPassee()) {
            return StatutConvocation.EXPIREE;
        }
        return statut;
    }

    public Instant getDateLimite() {
        return dateLimite;
    }

    public void setDateLimite(Instant dateLimite) {
        this.dateLimite = dateLimite;
    }

    public String getMessageEmployeur() {
        return messageEmployeur;
    }

    public List<RendezVous> getRendezVousPossibles() {
        return rendezVousPossibles;
    }

    public RendezVous getRendezVousSelection() {
        return rendezVousSelection;
    }

    public String getReponseEtudiant() {
        return reponseEtudiant;
    }

    public Candidature getCandidature() {
        return candidature;
    }

    public void setCandidature(Candidature candidature) {
        this.candidature = candidature;
    }

    public Etudiant getEtudiant() {
        return candidature.getEtudiant();
    }

    public Employeur getEmployeur() {
        return candidature.getOffreStage().getEmployeur();
    }
}
