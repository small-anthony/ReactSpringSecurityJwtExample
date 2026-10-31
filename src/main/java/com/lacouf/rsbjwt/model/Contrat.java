package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.exceptions.UnexpectedUserException;
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
		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
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
		switch(signature.getSignataire()) {
			case Etudiant _ -> {
				Signature<Etudiant> sig = (Signature<Etudiant>) signature;
				validateSigner(signatureEtudiant, sig, getEtudiant());
				signatureEtudiant = sig;
			}
			case Employeur _ -> {
				Signature<Employeur> sig = (Signature<Employeur>) signature;
				validateSigner(signatureEmployeur, sig, getEmployeur());
				signatureEmployeur = sig;
			}
			case Gestionnaire _ -> {
				Signature<Gestionnaire> sig = (Signature<Gestionnaire>) signature;
				validateSigner(signatureGestionnaire);
				signatureGestionnaire = sig;
			}
			default -> throw new Exception("signataire inconnu");
		}
	}

	private <User extends UserApp> void validateSigner(Signature<User> existing) throws Exception {
		if(existing != null) {
			ThrowExistingSignatureException();
		}
	}

	private <User extends UserApp> void validateSigner(Signature<User> existing, Signature<User> adding, User involved) throws Exception {
		validateSigner(existing);
		if(!involved.getId().equals(adding.getSignataire().getId())) {
			ThrowUninvolvedUserException();
		}
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

	private void ThrowUninvolvedUserException() throws UnexpectedUserException {
		throw new UnexpectedUserException("signataire est invalide");
	}
}
