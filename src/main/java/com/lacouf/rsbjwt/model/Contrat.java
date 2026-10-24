package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.embeddable.Signature;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
public class Contrat {
	protected Contrat() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Immutable // c'est littéralement illégal
	@Column(nullable = false)
	private byte[] data;

	@Embedded
	private Signature<Etudiant> signatureEtudiant = null;

	@Embedded
	private Signature<Employeur> signatureEmployeur = null;

	@Embedded
	private Signature<Gestionnaire> signatureGestionnaire = null;

	public Contrat(byte[] data) {
		this.data = data;
	}

	public void signAsEtudiant(Signature<Etudiant> signature) {
		if(signatureEtudiant != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureEtudiant = signature;
	}

	public void rejectAsEtudiant(Etudiant etudiant) {
		if(signatureEtudiant != null) {
			ThrowExistingSignatureException();
		}

		signatureEtudiant = Signature.invalid(etudiant);
	}

	public void signAsEmployeur(Signature<Employeur> signature) {
		if(signatureEmployeur != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureEmployeur = signature;
	}

	public void rejectAsEmployeur(Employeur employeur) {
		if(signatureEmployeur != null) {
			ThrowExistingSignatureException();
		}

		signatureEmployeur = Signature.invalid(employeur);
	}

	public void signAsGestionnaire(Signature<Gestionnaire> signature) {
		if(signatureGestionnaire != null) {
			ThrowExistingSignatureException();
		}

		if(!signature.isValid()) {
			ThrowInvalidSignatureException();
		}

		signatureGestionnaire = signature;
	}

	public void rejectAsGestionnaire(Gestionnaire gestionnaire) {
		if(signatureGestionnaire != null) {
			ThrowExistingSignatureException();
		}

		signatureGestionnaire = Signature.invalid(gestionnaire);
	}

	public Long getId() {
		return id;
	}

	public byte[] getData() {
		return data;
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

	private void ThrowExistingSignatureException() throws IllegalStateException {
		throw new IllegalStateException("signature existe déjà");
	}

	private void ThrowInvalidSignatureException() throws IllegalArgumentException {
		throw new IllegalArgumentException("signature est invalide");
	}
}
