package com.lacouf.rsbjwt.model;

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

    /// Date limite avant que la convocation n'ait plus valide
    private Instant dateLimite = Instant.now().plus(MINIMUM_REPONSE_LIMIT); // TODO implement @Scheduled

    @ElementCollection
    @CollectionTable(
            name = "rendez_vous_possibles",
            joinColumns = @JoinColumn(name = "rendez_vous_id")
    )
    private List<RendezVous> rendezVousPossibles;

    @Embedded
    private RendezVous rendezVousSelection = null;

    /// Si ça s'applique, la réponse donnée par l'étudiant
    @Column(length = 1000)
    private String reponseEtudiant = null;

    public Convocation(List<RendezVous> rendezVousPossibles) {
        if(rendezVousPossibles == null || rendezVousPossibles.isEmpty()) {
            throw new IllegalArgumentException("rendezvous must have at least one entry");
        }
        this.rendezVousPossibles = rendezVousPossibles;
    }

    public Convocation(List<RendezVous> rendezVousPossibles, String messageEmployeur) {
        this(rendezVousPossibles);
        this.messageEmployeur = messageEmployeur;
    }

    public boolean estPassee() {
        return dateLimite.isAfter(Instant.now());
    }

    public boolean estResolu() {
        return statut != StatutConvocation.EN_ATTENTE;
    }

    /**
     * Accepter un rendez-vous
     * @param rendezVous Le rendez-vous
     * @param message La réponse de l'étudiant, optionnellement
     */
    public void accepter(RendezVous rendezVous, String message) {
        if(estResolu()) {
            throw new IllegalStateException("convocation already resolved");
        }
        if(!rendezVousPossibles.contains(rendezVous)) {
            throw new IllegalArgumentException("tried to select rendezvous we don't have");
        }

        this.statut = StatutConvocation.ACCEPTEE;
        this.rendezVousSelection = rendezVous;
        this.reponseEtudiant = message;
    }

    /**
     * Refuser un rendez-vous
     * @param motif La raison donnée par l'étudiant, nullable
     */
    public void refuser(String motif) {
        if(estResolu()) {
            throw new IllegalStateException("convocation already resolved");
        }
        this.statut = StatutConvocation.REFUSEE;
        this.reponseEtudiant = motif;
    }

    public void annuler() {
        if(estResolu()) {
            throw new IllegalStateException("convocation already resolved");
        }
        this.statut = StatutConvocation.ANNULEE;
    }

    public void updateDetails(List<RendezVous> rendezVousPossibles, String messageEmployeur)  {
        if(estResolu()) {
            throw new IllegalStateException("convocation already resolved");
        }
        if(rendezVousPossibles == null || rendezVousPossibles.isEmpty()) {
            throw new IllegalArgumentException("rendezvous must have at least one entry");
        }
        this.rendezVousPossibles = rendezVousPossibles;
        this.messageEmployeur = messageEmployeur;
    }

    public Long getId() {
        return id;
    }

    public StatutConvocation getStatut() {
        return statut;
    }

    public Instant getDateLimite() {
        return dateLimite;
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
}
