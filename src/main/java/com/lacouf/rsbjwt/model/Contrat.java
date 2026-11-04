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
		setSignature(Signature.invalid(user));
		this.statut = StatutContrat.REFUSE;
	}

	@SuppressWarnings("unchecked")
	private void setSignature(Signature<?> signature) throws Exception {
		UserApp signataire = signature.getSignataire();
		if (signataire instanceof Etudiant || (signataire != null && signataire.getRole() == com.lacouf.rsbjwt.model.auth.Role.ETUDIANT)) {
			if (signatureEtudiant != null) {
				throw new Exception("signature existe déjà");
			}
			if (signataire == null || !java.util.Objects.equals(signataire.getId(), getEtudiant().getId())) {
				throw new Exception("signataire est invalide");
			}
			signatureEtudiant = (Signature<Etudiant>) signature;
		} else if (signataire instanceof Employeur || (signataire != null && signataire.getRole() == com.lacouf.rsbjwt.model.auth.Role.EMPLOYEUR)) {
			if (signatureEmployeur != null) {
				throw new Exception("signature existe déjà");
			}
			if (signataire == null || !java.util.Objects.equals(signataire.getId(), getEmployeur().getId())) {
				throw new Exception("signataire est invalide");
			}
			signatureEmployeur = (Signature<Employeur>) signature;
		} else if (signataire instanceof Gestionnaire || (signataire != null && signataire.getRole() == com.lacouf.rsbjwt.model.auth.Role.GESTIONNAIRE)) {
			if (signatureGestionnaire != null) {
				throw new Exception("signature existe déjà");
			}
			if (signature.isValid() && (!isSigneParEtudiant() || !isSigneParEmployeur())) {
				throw new Exception("L'étudiant et l'employeur doivent avoir signé le contrat avant le gestionnaire.");
			}
			signatureGestionnaire = (Signature<Gestionnaire>) signature;
		} else {
			throw new Exception("signataire inconnu");
		}
	}

	private void evaluerStatut() {
		if (this.statut == StatutContrat.REFUSE) {
			return;
		}
		if (isSigneParEtudiant() && isSigneParEmployeur() && isSigneParGestionnaire()) {
			this.statut = StatutContrat.COMPLETE;
		} else if (isSigneParEtudiant() && isSigneParEmployeur()) {
			this.statut = StatutContrat.SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR;
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

	public int getAnneeDebut() {
		return dateDebut != null ? dateDebut.getYear() : 0;
	}

	public long getNombreSemaines() {
		if (dateDebut == null || dateFin == null) return 1;
		return Math.max(1, java.time.temporal.ChronoUnit.WEEKS.between(dateDebut, dateFin));
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
