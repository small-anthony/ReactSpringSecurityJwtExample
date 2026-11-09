package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.AccueilProchainStage;
import com.lacouf.rsbjwt.model.ENUM.AppreciationGlobale;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.SectionEvaluation;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "contrat_id", unique = true)
    private Contrat contrat;

    @ElementCollection
    @CollectionTable(name = "evaluation_reponse", joinColumns = @JoinColumn(name = "evaluation_id"))
    @MapKeyColumn(name = "critere")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "niveau")
    @Enumerated(EnumType.STRING)
    private Map<CritereEvaluation, NiveauAccord> reponses = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "evaluation_commentaire", joinColumns = @JoinColumn(name = "evaluation_id"))
    @MapKeyColumn(name = "section")
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "commentaire", length = 2000)
    private Map<SectionEvaluation, String> commentaires = new HashMap<>();

    @Enumerated(EnumType.STRING)
    private AppreciationGlobale appreciationGlobale;

    @Column(length = 2000)
    private String precisionAppreciation;

    private boolean discuteAvecStagiaire;

    private double heuresEncadrementParSemaine;

    @Enumerated(EnumType.STRING)
    private AccueilProchainStage accueilProchainStage;

    @Column(length = 2000)
    private String formationTechnique;

    private String nomSignataire;

    private String fonctionSignataire;

    private Instant dateEvaluation = Instant.now();

    protected Evaluation() {}

    public Evaluation(Contrat contrat,
                      Map<CritereEvaluation, NiveauAccord> reponses,
                      Map<SectionEvaluation, String> commentairesSections,
                      AppreciationGlobale appreciationGlobale,
                      String precisionAppreciation,
                      boolean discuteAvecStagiaire,
                      double heuresEncadrementParSemaine,
                      AccueilProchainStage accueilProchainStage,
                      String formationTechnique,
                      String nomSignataire,
                      String fonctionSignataire) throws Exception {
        if (contrat == null || !contrat.estComplete()) {
            throw new Exception("Le contrat doit être complété avant d'évaluer le stagiaire");
        }
        verifierReponsesCompletes(reponses);
        if (appreciationGlobale == null) {
            throw new Exception("L'appréciation globale est obligatoire");
        }
        if (accueilProchainStage == null) {
            throw new Exception("Veuillez indiquer si l'entreprise accueillerait cet élève pour un prochain stage");
        }
        if (heuresEncadrementParSemaine < 0) {
            throw new Exception("Le nombre d'heures d'encadrement ne peut pas être négatif");
        }
        this.contrat = contrat;
        this.reponses.putAll(reponses);
        for (SectionEvaluation section : SectionEvaluation.values()) {
            this.commentaires.put(section, nettoyer(commentairesSections == null ? null : commentairesSections.get(section)));
        }
        this.appreciationGlobale = appreciationGlobale;
        this.precisionAppreciation = nettoyer(precisionAppreciation);
        this.discuteAvecStagiaire = discuteAvecStagiaire;
        this.heuresEncadrementParSemaine = heuresEncadrementParSemaine;
        this.accueilProchainStage = accueilProchainStage;
        this.formationTechnique = nettoyer(formationTechnique);
        this.nomSignataire = exigerTexte(nomSignataire, "Le nom du signataire est obligatoire");
        this.fonctionSignataire = exigerTexte(fonctionSignataire, "La fonction du signataire est obligatoire");
    }

    private void verifierReponsesCompletes(Map<CritereEvaluation, NiveauAccord> reponsesRecues) throws Exception {
        for (CritereEvaluation critere : CritereEvaluation.values()) {
            if (reponsesRecues == null || reponsesRecues.get(critere) == null) {
                throw new Exception("Tous les critères doivent être évalués");
            }
        }
    }

    private String nettoyer(String texte) {
        return texte == null ? "" : texte.trim();
    }

    private String exigerTexte(String texte, String message) throws Exception {
        String propre = nettoyer(texte);
        if (propre.isEmpty()) {
            throw new Exception(message);
        }
        return propre;
    }

    public Long getId() {
        return id;
    }

    public Contrat getContrat() {
        return contrat;
    }

    public Long getContratId() {
        return contrat.getId();
    }

    public Map<CritereEvaluation, NiveauAccord> getReponses() {
        return Map.copyOf(reponses);
    }

    public Map<SectionEvaluation, String> getCommentaires() {
        return Map.copyOf(commentaires);
    }

    public AppreciationGlobale getAppreciationGlobale() {
        return appreciationGlobale;
    }

    public String getPrecisionAppreciation() {
        return precisionAppreciation;
    }

    public boolean isDiscuteAvecStagiaire() {
        return discuteAvecStagiaire;
    }

    public double getHeuresEncadrementParSemaine() {
        return heuresEncadrementParSemaine;
    }

    public AccueilProchainStage getAccueilProchainStage() {
        return accueilProchainStage;
    }

    public String getFormationTechnique() {
        return formationTechnique;
    }

    public String getNomSignataire() {
        return nomSignataire;
    }

    public String getFonctionSignataire() {
        return fonctionSignataire;
    }

    public Instant getDateEvaluation() {
        return dateEvaluation;
    }
}