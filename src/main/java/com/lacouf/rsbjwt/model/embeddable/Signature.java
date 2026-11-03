package com.lacouf.rsbjwt.model.embeddable;

import com.lacouf.rsbjwt.model.UserApp;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

import java.util.Arrays;
import java.util.Objects;

@Embeddable
public class Signature<User extends UserApp> {
	protected Signature() {}

	private boolean valid;
	@Lob
	private byte[] data;
	@ManyToOne(targetEntity = UserApp.class)
	private User signataire;

	public Signature(User signataire, byte[] data) {
		if (signataire == null) {
			throw new IllegalArgumentException("Le signataire est obligatoire pour une signature valide.");
		}
		if (data == null || data.length == 0) {
			throw new IllegalArgumentException("Les données de signature sont obligatoires.");
		}
		this.signataire = signataire;
		this.data = data;
		this.valid = true;
	}

	public static <User extends UserApp> Signature<User> invalid(User signataire) {
		Signature<User> ret = new Signature<>();
		ret.signataire = signataire;
		ret.data = null;
		ret.valid = false;
		return ret;
	}

	public User getSignataire() {
		return signataire;
	}

	public byte[] getData() {
		return data;
	}

	public boolean isValid() {
		return valid;
	}

	public boolean isSignedBy(User user) {
		return user != null && signataire != null && Objects.equals(user.getId(), signataire.getId());
	}

	@Override
	public int hashCode() {
		return Arrays.hashCode(data);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (!(obj instanceof Signature<?> that)) return false;

		return Arrays.equals(this.data, that.data);
	}

	@Override
	public String toString() {
		return "{Signature: " + hashCode() + "}";
	}
}