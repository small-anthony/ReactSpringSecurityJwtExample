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

	@Lob
	@Column(name = "document_data", nullable = false)
	private byte[] data;

	@ManyToOne(optional = false)
	@JoinColumn(name = "candidature_id")
	private Candidature candidature;

	@Immutable
	private LocalDate dateDebut;
	@Immutable
	private LocalDate dateFin;
	@Immutable
	private String horaire;
	@Immutable
	private String salaire;

	@Immutable
	@Column(length = 2000)
	private String descriptionTaches;

	@Immutable
	@Column(length = 2000)
	private String conditions;

	@Enumerated(EnumType.STRING)
	private StatutContrat statut = StatutContrat.EN_ATTENTE_SIGNATURE;

	@Immutable
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
	}

	public void signer(Signature<?> signature) throws Exception {
		if (!signature.isValid()) {
			throw new Exception("signature est invalide");
		}

		setSignature(signature);
		evaluerStatut();
	}

	public void rejeter(UserApp user) throws Exception {
		if (user instanceof Etudiant etudiant) {
			if (!java.util.Objects.equals(etudiant.getId(), getEtudiant().getId())) {
				throw new Exception("signataire est invalide");
			}
			this.signatureEtudiant = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(etudiant);
		} else if (user instanceof Employeur employeur) {
			if (!java.util.Objects.equals(employeur.getId(), getEmployeur().getId())) {
				throw new Exception("signataire est invalide");
			}
			this.signatureEmployeur = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(employeur);
		} else if (user instanceof Gestionnaire gestionnaire) {
			this.signatureGestionnaire = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(gestionnaire);
		} else if (user != null && java.util.Objects.equals(user.getId(), getEtudiant().getId())) {
			this.signatureEtudiant = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(getEtudiant());
		} else if (user != null && java.util.Objects.equals(user.getId(), getEmployeur().getId())) {
			this.signatureEmployeur = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(getEmployeur());
		} else {
			this.signatureGestionnaire = com.lacouf.rsbjwt.model.embeddable.Signature.invalid(null);
		}
		this.statut = StatutContrat.REFUSE;
	}

	@SuppressWarnings("unchecked")
	private void setSignature(Signature<?> signature) throws Exception {
		switch (signature.getSignataire()) {
			case Etudiant _ -> {
				if (signatureEtudiant != null) {
					throw new Exception("signature existe déjà");
				}
				Signature<Etudiant> sig = (Signature<Etudiant>) signature;
				if (!sig.isSignedBy(getEtudiant())) {
					throw new Exception("signataire est invalide");
				}
				signatureEtudiant = sig;
			}
			case Employeur _ -> {
				if (signatureEmployeur != null) {
					throw new Exception("signature existe déjà");
				}
				Signature<Employeur> sig = (Signature<Employeur>) signature;
				if (!sig.isSignedBy(getEmployeur())) {
					throw new Exception("signataire est invalide");
				}
				signatureEmployeur = sig;
			}
			case Gestionnaire _ -> {
				if (signatureGestionnaire != null) {
					throw new Exception("signature existe déjà");
				}
				signatureGestionnaire = (Signature<Gestionnaire>) signature;
			}
			case null, default -> throw new Exception("signataire inconnu");
		}
	}

	private void evaluerStatut() {
		if (this.statut == StatutContrat.REFUSE) {
			return;
		}
		if (isSigneParEtudiant() && isSigneParEmployeur() && isSigneParGestionnaire()) {
			this.statut = StatutContrat.COMPLETE;
		} else if (isSigneParEmployeur() && !isSigneParEtudiant()) {
			this.statut = StatutContrat.SIGNE_PAR_EMPLOYEUR;
		} else if (isSigneParEtudiant() && !isSigneParEmployeur()) {
			this.statut = StatutContrat.SIGNE_PAR_ETUDIANT;
		} else {
			this.statut = StatutContrat.EN_ATTENTE_SIGNATURE;
		}
	}

	public boolean isSigneParEtudiant() {
		return signatureEtudiant != null && signatureEtudiant.isValid();
	}

	public boolean isSigneParEmployeur() {
		return signatureEmployeur != null && signatureEmployeur.isValid();
	}

	public boolean isSigneParGestionnaire() {
		return signatureGestionnaire != null && signatureGestionnaire.isValid();
	}

	public Long getId() {
		return id;
	}

	public byte[] getData() {
		return data;
	}

	public void setData(byte[] data) {
		this.data = data;
	}

	public Candidature getCandidature() {
		return candidature;
	}

	public Long getCandidatureId() {
		return candidature.getId();
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
		return candidature.getEtudiant();
	}

	public Employeur getEmployeur() {
		return candidature.getEmployeur();
	}

	public OffreStage getOffreStage() {
		return candidature.getOffreStage();
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
}
