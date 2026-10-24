package com.lacouf.rsbjwt.model.embeddable;

import com.lacouf.rsbjwt.model.UserApp;
import jakarta.persistence.Embeddable;

import java.util.Arrays;

/**
 * Représentation d'une signature par un utilisateur. Immuable.
 */
@Embeddable
public class Signature<User extends UserApp> {
	protected Signature() {}

	private boolean valid;
	private byte[] data;
	private User signataire;

	public Signature(User signataire, byte[] data) {
		if(data == null || data.length == 0) {
			throw new IllegalStateException("data doit éxister pour les signatures valides");
		}

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
