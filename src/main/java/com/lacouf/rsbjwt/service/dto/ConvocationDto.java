package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;

import java.time.LocalDateTime;

public class ConvocationDto {
    private Long id;
    private Long candidatureId;
    private Long etudiantId;
    private String etudiantNomComplet;
    private String etudiantEmail;
    private int etudiantMatricule;
    private String etudiantDiscipline;
    private Long offreId;
    private String offreTitre;
    private String entreprise;
    private LocalDateTime dateHeure;
    private String lieu;
    private String messageEmployeur;
    private StatutConvocation statut;
    private LocalDateTime dateProposeeEtudiant;
    private String motifEtudiant;
    private LocalDateTime dateCreation;
    private boolean estPassee;

    public ConvocationDto() {}

    public static ConvocationDto fromEntity(Convocation c) {
        if (c == null) return null;
        Etudiant etudiant = c.getCandidature() != null ? c.getCandidature().getEtudiant() : null;
        OffreStage offre = c.getCandidature() != null ? c.getCandidature().getOffreStage() : null;

        ConvocationDto dto = new ConvocationDto();
        dto.setId(c.getId());
        dto.setCandidatureId(c.getCandidature() != null ? c.getCandidature().getId() : null);
        if (etudiant != null) {
            dto.setEtudiantId(etudiant.getId());
            dto.setEtudiantNomComplet(etudiant.getFirstName() + " " + etudiant.getLastName());
            dto.setEtudiantEmail(etudiant.getEmail());
            dto.setEtudiantMatricule(etudiant.getMatricule());
            dto.setEtudiantDiscipline(etudiant.getDiscipline());
        }
        if (offre != null) {
            dto.setOffreId(offre.getId());
            dto.setOffreTitre(offre.getTitre());
            dto.setEntreprise(offre.getNomEntreprise());
        }
        dto.setDateHeure(c.getDateHeure());
        dto.setLieu(c.getLieu());
        dto.setMessageEmployeur(c.getMessageEmployeur());
        dto.setStatut(c.getStatut());
        dto.setDateProposeeEtudiant(c.getDateProposeeEtudiant());
        dto.setMotifEtudiant(c.getMotifEtudiant());
        dto.setDateCreation(c.getDateCreation());
        dto.setEstPassee(c.estPassee());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidatureId() { return candidatureId; }
    public void setCandidatureId(Long candidatureId) { this.candidatureId = candidatureId; }

    public Long getEtudiantId() { return etudiantId; }
    public void setEtudiantId(Long etudiantId) { this.etudiantId = etudiantId; }

    public String getEtudiantNomComplet() { return etudiantNomComplet; }
    public void setEtudiantNomComplet(String etudiantNomComplet) { this.etudiantNomComplet = etudiantNomComplet; }

    public String getEtudiantEmail() { return etudiantEmail; }
    public void setEtudiantEmail(String etudiantEmail) { this.etudiantEmail = etudiantEmail; }

    public int getEtudiantMatricule() { return etudiantMatricule; }
    public void setEtudiantMatricule(int etudiantMatricule) { this.etudiantMatricule = etudiantMatricule; }

    public String getEtudiantDiscipline() { return etudiantDiscipline; }
    public void setEtudiantDiscipline(String etudiantDiscipline) { this.etudiantDiscipline = etudiantDiscipline; }

    public Long getOffreId() { return offreId; }
    public void setOffreId(Long offreId) { this.offreId = offreId; }

    public String getOffreTitre() { return offreTitre; }
    public void setOffreTitre(String offreTitre) { this.offreTitre = offreTitre; }

    public String getEntreprise() { return entreprise; }
    public void setEntreprise(String entreprise) { this.entreprise = entreprise; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }

    public String getMessageEmployeur() { return messageEmployeur; }
    public void setMessageEmployeur(String messageEmployeur) { this.messageEmployeur = messageEmployeur; }

    public StatutConvocation getStatut() { return statut; }
    public void setStatut(StatutConvocation statut) { this.statut = statut; }

    public LocalDateTime getDateProposeeEtudiant() { return dateProposeeEtudiant; }
    public void setDateProposeeEtudiant(LocalDateTime dateProposeeEtudiant) { this.dateProposeeEtudiant = dateProposeeEtudiant; }

    public String getMotifEtudiant() { return motifEtudiant; }
    public void setMotifEtudiant(String motifEtudiant) { this.motifEtudiant = motifEtudiant; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public boolean isEstPassee() { return estPassee; }
    public void setEstPassee(boolean estPassee) { this.estPassee = estPassee; }
}
