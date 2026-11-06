package com.lacouf.rsbjwt.model;

import com.lacouf.rsbjwt.model.ENUM.NotificationActionType;
import com.lacouf.rsbjwt.model.ENUM.NotificationType;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import org.jspecify.annotations.NonNull;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
public class Notification {
	protected Notification() {}

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Immutable
	@Column(nullable = false)
	private NotificationType type;

	@Immutable
	@Column(nullable = false)
	private String message;

	@Immutable
	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	private UserApp owner;

	@Embedded
	private NotificationAction action;

	@Immutable
	private Instant dateCreation = Instant.now();
	/// L
	private Instant dateDismissed = null;

	private Instant dateDeleted = null;

	protected Notification(@NonNull NotificationType type, @NonNull NotificationAction action, @NonNull String message) {
		this.type = type;
		this.action = action;
		this.message = message;
	}

	public boolean isDismissed() {
		return dateDismissed != null || dateDeleted != null;
	}

	public void dismiss() {
		dateDismissed = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public NotificationType getType() {
		return type;
	}

	public UserApp getOwner() {
		return owner;
	}

	public void setOwner(UserApp owner) {
		this.owner = owner;
	}

	public String getMessage() {
		return message;
	}

	public NotificationAction getAction() {
		return action;
	}

	public Instant getDateCreation() {
		return dateCreation;
	}

	public Instant getDateDismissed() {
		return dateDismissed;
	}

	public static Notification cvSubmitted() {
		Map<String, Object> map = new HashMap<>();
		return new Notification(
			NotificationType.ActionRequired,
				new NotificationAction(NotificationActionType.ViewCv, map),
			"gestionnaire.cv_submitted"
		);
	}
}
