package com.lacouf.rsbjwt.model.embeddable;

import com.lacouf.rsbjwt.model.UserApp;
import jakarta.persistence.Embeddable;
import jakarta.persistence.ManyToOne;

import java.util.Arrays;

/**
 * Représentation d'une signature par un utilisateur. Immuable.
 */
@Embeddable
public class Signature<User extends UserApp> {
	protected Signature() {}

	private boolean valid;
	private byte[] data;
	@ManyToOne(targetEntity = UserApp.class)
	private User signataire;

	public Signature(User signataire, byte[] data) {
		this.data = data;
		this.signataire = signataire;
		this.valid = true;
	}

	/// Créé une signature "invalide"
	public static <User extends UserApp> Signature<User> invalid(User signataire) {
		Signature<User> ret = new Signature<>();

		ret.signataire = signataire;
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

	@Override
	public int hashCode() {
		return Arrays.hashCode(data);
	}

	@Override
	public boolean equals(Object obj) {
		if(this == obj) { return true; }
		if(!(obj instanceof Signature<?> that)) return false;

		return Arrays.equals(this.data, that.data);
	}

	@Override
	public String toString() {
		return "{Signature: " + hashCode() + "}";
	}
}
