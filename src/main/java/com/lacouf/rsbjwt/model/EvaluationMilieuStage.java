package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.CapaciteAccueilStagiaires;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluationMilieu;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.StageCible;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;

@Entity
@Table(name = "evaluation_milieu_stage")
public class EvaluationMilieuStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "candidature_id", unique = true)
    private Candidature candidature;

    @ManyToOne(optional = false)
    @JoinColumn(name = "etudiant_id")
    private Etudiant etudiant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "professeur_id")
    private Professeur professeur;

    private String nomEntreprise;
    private String personneContact;
    private String adresse;
    private String ville;
    private String codePostal;
    private String telephone;
    private String telecopieur;
    private String nomStagiaire;
    private String dateStage;
    private int numeroStage;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "evaluation_milieu_reponses", joinColumns = @JoinColumn(name = "evaluation_milieu_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "critere")
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau")
    private Map<CritereEvaluationMilieu, NiveauAccord> reponses = new EnumMap<>(CritereEvaluationMilieu.class);

    private double heuresEncadrementMois1;
    private double heuresEncadrementMois2;
    private double heuresEncadrementMois3;
    private String salaireHoraire;

    @Column(length = 2000)
    private String commentaires;

    @Enumerated(EnumType.STRING)
    private StageCible milieuAPrivilegier;

    @Enumerated(EnumType.STRING)
    private CapaciteAccueilStagiaires nombreStagiairesAccueillis;

    private boolean accueillirMemeStagiaire;
    private boolean quartsTravailVariables;
    private String quart1Debut;
    private String quart1Fin;
    private String quart2Debut;
    private String quart2Fin;
    private String quart3Debut;
    private String quart3Fin;
    private String signatureEnseignant;
    private LocalDate dateEvaluation = LocalDate.now();

    protected EvaluationMilieuStage() {
    }

    public EvaluationMilieuStage(
            Candidature candidature, Etudiant etudiant, Professeur professeur,
            String nomEntreprise, String personneContact, String adresse, String ville,
            String codePostal, String telephone, String telecopieur,
            String nomStagiaire, String dateStage, int numeroStage,
            Map<CritereEvaluationMilieu, NiveauAccord> reponses,
            double heuresEncadrementMois1, double heuresEncadrementMois2, double heuresEncadrementMois3,
            String salaireHoraire, String commentaires,
            StageCible milieuAPrivilegier, CapaciteAccueilStagiaires nombreStagiairesAccueillis,
            boolean accueillirMemeStagiaire, boolean quartsTravailVariables,
            String quart1Debut, String quart1Fin, String quart2Debut, String quart2Fin,
            String quart3Debut, String quart3Fin, String signatureEnseignant, LocalDate dateEvaluation) {
        this.candidature = candidature;
        this.etudiant = etudiant;
        this.professeur = professeur;
        this.nomEntreprise = nettoyer(nomEntreprise);
        this.personneContact = nettoyer(personneContact);
        this.adresse = nettoyer(adresse);
        this.ville = nettoyer(ville);
        this.codePostal = nettoyer(codePostal);
        this.telephone = nettoyer(telephone);
        this.telecopieur = nettoyer(telecopieur);
        this.nomStagiaire = nettoyer(nomStagiaire);
        this.dateStage = nettoyer(dateStage);
        this.numeroStage = numeroStage;
        if (reponses != null) this.reponses.putAll(reponses);
        this.heuresEncadrementMois1 = heuresEncadrementMois1;
        this.heuresEncadrementMois2 = heuresEncadrementMois2;
        this.heuresEncadrementMois3 = heuresEncadrementMois3;
        this.salaireHoraire = nettoyer(salaireHoraire);
        this.commentaires = nettoyer(commentaires);
        this.milieuAPrivilegier = milieuAPrivilegier;
        this.nombreStagiairesAccueillis = nombreStagiairesAccueillis;
        this.accueillirMemeStagiaire = accueillirMemeStagiaire;
        this.quartsTravailVariables = quartsTravailVariables;
        this.quart1Debut = nettoyer(quart1Debut);
        this.quart1Fin = nettoyer(quart1Fin);
        this.quart2Debut = nettoyer(quart2Debut);
        this.quart2Fin = nettoyer(quart2Fin);
        this.quart3Debut = nettoyer(quart3Debut);
        this.quart3Fin = nettoyer(quart3Fin);
        this.signatureEnseignant = nettoyer(signatureEnseignant);
        this.dateEvaluation = dateEvaluation != null ? dateEvaluation : LocalDate.now();
    }

    private String nettoyer(String valeur) {
        return valeur == null ? "" : valeur.trim();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Candidature getCandidature() { return candidature; }
    public Long getCandidatureId() { return candidature != null ? candidature.getId() : null; }
    public Etudiant getEtudiant() { return etudiant; }
    public Long getEtudiantId() { return etudiant != null ? etudiant.getId() : null; }
    public Professeur getProfesseur() { return professeur; }
    public Long getProfesseurId() { return professeur != null ? professeur.getId() : null; }
    public String getNomProfesseur() { return professeur != null ? professeur.nomComplet() : ""; }
    public String getNomEntreprise() { return nomEntreprise; }
    public String getPersonneContact() { return personneContact; }
    public String getAdresse() { return adresse; }
    public String getVille() { return ville; }
    public String getCodePostal() { return codePostal; }
    public String getTelephone() { return telephone; }
    public String getTelecopieur() { return telecopieur; }
    public String getNomStagiaire() { return nomStagiaire; }
    public String getDateStage() { return dateStage; }
    public int getNumeroStage() { return numeroStage; }
    public Map<CritereEvaluationMilieu, NiveauAccord> getReponses() { return Map.copyOf(reponses); }
    public double getHeuresEncadrementMois1() { return heuresEncadrementMois1; }
    public double getHeuresEncadrementMois2() { return heuresEncadrementMois2; }
    public double getHeuresEncadrementMois3() { return heuresEncadrementMois3; }
    public String getSalaireHoraire() { return salaireHoraire; }
    public String getCommentaires() { return commentaires; }
    public StageCible getMilieuAPrivilegier() { return milieuAPrivilegier; }
    public CapaciteAccueilStagiaires getNombreStagiairesAccueillis() { return nombreStagiairesAccueillis; }
    public boolean isAccueillirMemeStagiaire() { return accueillirMemeStagiaire; }
    public boolean isQuartsTravailVariables() { return quartsTravailVariables; }
    public String getQuart1Debut() { return quart1Debut; }
    public String getQuart1Fin() { return quart1Fin; }
    public String getQuart2Debut() { return quart2Debut; }
    public String getQuart2Fin() { return quart2Fin; }
    public String getQuart3Debut() { return quart3Debut; }
    public String getQuart3Fin() { return quart3Fin; }
    public String getSignatureEnseignant() { return signatureEnseignant; }
    public LocalDate getDateEvaluation() { return dateEvaluation; }
}
