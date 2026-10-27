package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.time.Instant;
import java.time.LocalDate;

@Entity
public class Contrat {
	protected Contrat() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Immutable
	@Lob
	@Column(name = "document_data", nullable = false)
	private byte[] data;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "candidature_id")
	private Candidature candidature;

	private LocalDate dateDebut;
	private LocalDate dateFin;
	private String horaire;
	private String salaire;

	@Column(length = 2000)
	private String descriptionTaches;

	@Column(length = 2000)
	private String conditions;

	@Enumerated(EnumType.STRING)
	private StatutContrat statut = StatutContrat.EN_ATTENTE_SIGNATURE;

	private Instant dateCreation = Instant.now();

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "valid", column = @Column(name = "etudiant_signature_valid")),
			@AttributeOverride(name = "data", column = @Column(name = "etudiant_signature_data"))
	})
	@AssociationOverrides({
			@AssociationOverride(name = "signataire", joinColumns = @JoinColumn(name = "etudiant_signataire_id"))
	})
	private Signature<Etudiant> signatureEtudiant = null;

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "valid", column = @Column(name = "employeur_signature_valid")),
			@AttributeOverride(name = "data", column = @Column(name = "employeur_signature_data"))
	})
	@AssociationOverrides({
			@AssociationOverride(name = "signataire", joinColumns = @JoinColumn(name = "employeur_signataire_id"))
	})
	private Signature<Employeur> signatureEmployeur = null;

	@Embedded
	@AttributeOverrides({
			@AttributeOverride(name = "valid", column = @Column(name = "gestionnaire_signature_valid")),
			@AttributeOverride(name = "data", column = @Column(name = "gestionnaire_signature_data"))
	})
	@AssociationOverrides({
			@AssociationOverride(name = "signataire", joinColumns = @JoinColumn(name = "gestionnaire_signataire_id"))
	})
	private Signature<Gestionnaire> signatureGestionnaire = null;

	public Contrat(byte[] data) {
		this.data = data;
	}

	public Contrat(Candidature candidature, byte[] data, LocalDate dateDebut, LocalDate dateFin,
				   String horaire, String salaire, String descriptionTaches, String conditions) {
		this.candidature = candidature;
		this.data = data;
		this.dateDebut = dateDebut;
		this.dateFin = dateFin;
		this.horaire = horaire;
		this.salaire = salaire;
		this.descriptionTaches = descriptionTaches;
		this.conditions = conditions;
		this.statut = StatutContrat.EN_ATTENTE_SIGNATURE;
		this.dateCreation = Instant.now();
	}

	public void signAsEtudiant(Signature<Etudiant> signature) throws Exception {
		if(signatureEtudiant != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureEtudiant = signature;
		evaluerStatut();
	}

	public void rejectAsEtudiant(Etudiant etudiant) throws Exception {
		if(signatureEtudiant != null) {
			ThrowExistingSignatureException();
		}

		signatureEtudiant = Signature.invalid(etudiant);
		this.statut = StatutContrat.REFUSE;
	}

	public void signAsEmployeur(Signature<Employeur> signature) throws Exception {
		if(signatureEmployeur != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureEmployeur = signature;
		evaluerStatut();
	}

	public void rejectAsEmployeur(Employeur employeur) throws Exception {
		if(signatureEmployeur != null) {
			ThrowExistingSignatureException();
		}

		signatureEmployeur = Signature.invalid(employeur);
		this.statut = StatutContrat.REFUSE;
	}

	public void signAsGestionnaire(Signature<Gestionnaire> signature) throws Exception {
		if(signatureGestionnaire != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureGestionnaire = signature;
		evaluerStatut();
	}

	public void rejectAsGestionnaire(Gestionnaire gestionnaire) throws Exception {
		if(signatureGestionnaire != null) {
			ThrowExistingSignatureException();
		}

		signatureGestionnaire = Signature.invalid(gestionnaire);
		this.statut = StatutContrat.REFUSE;
	}

	private void evaluerStatut() {
		if (this.statut == StatutContrat.REFUSE) {
			return;
		}
		boolean etudiantSigne = signatureEtudiant != null && signatureEtudiant.isValid();
		boolean employeurSigne = signatureEmployeur != null && signatureEmployeur.isValid();
		boolean gestionnaireSigne = signatureGestionnaire != null && signatureGestionnaire.isValid();

		if (etudiantSigne && employeurSigne && gestionnaireSigne) {
			this.statut = StatutContrat.COMPLETE;
		} else if (employeurSigne && !etudiantSigne) {
			this.statut = StatutContrat.SIGNE_PAR_EMPLOYEUR;
		} else if (etudiantSigne && !employeurSigne) {
			this.statut = StatutContrat.SIGNE_PAR_ETUDIANT;
		} else {
			this.statut = StatutContrat.EN_ATTENTE_SIGNATURE;
		}
	}

	public Long getId() {
		return id;
	}

	public byte[] getData() {
		return data;
	}

	public Candidature getCandidature() {
		return candidature;
	}

	public void setCandidature(Candidature candidature) {
		this.candidature = candidature;
	}

	public LocalDate getDateDebut() {
		return dateDebut;
	}

	public LocalDate getDateFin() {
		return dateFin;
	}

	public String getHoraire() {
		return horaire;
	}

	public String getSalaire() {
		return salaire;
	}

	public String getDescriptionTaches() {
		return descriptionTaches;
	}

	public String getConditions() {
		return conditions;
	}

	public StatutContrat getStatut() {
		return statut;
	}

	public Instant getDateCreation() {
		return dateCreation;
	}

	public Etudiant getEtudiant() {
		return candidature != null ? candidature.getEtudiant() : null;
	}

	public Employeur getEmployeur() {
		return (candidature != null && candidature.getOffreStage() != null)
				? candidature.getOffreStage().getEmployeur() : null;
	}

	public OffreStage getOffreStage() {
		return candidature != null ? candidature.getOffreStage() : null;
	}

	public Signature<Etudiant> getSignatureEtudiant() {
		return signatureEtudiant;
	}

	public Signature<Employeur> getSignatureEmployeur() {
		return signatureEmployeur;
	}

	public Signature<Gestionnaire> getSignatureGestionnaire() {
		return signatureGestionnaire;
	}

	private void ThrowExistingSignatureException() throws Exception {
		throw new Exception("signature existe déjà");
	}

	private void ThrowInvalidSignatureException() throws Exception {
		throw new Exception("signature est invalide");
	}
}
