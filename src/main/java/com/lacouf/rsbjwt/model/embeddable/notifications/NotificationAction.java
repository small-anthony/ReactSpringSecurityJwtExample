package com.lacouf.rsbjwt.model.embeddable.notifications;

import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.jspecify.annotations.NonNull;

import java.util.Collections;
import java.util.Map;

@Embeddable
public class NotificationAction {
	protected NotificationAction() {}

	@Immutable
	@Column(name = "action_type", nullable = false)
	private NotificationActionType type;

	@Immutable
	@Column(name = "action_reference_id")
	private Long referenceId;

	public NotificationAction(@NonNull NotificationActionType type) {
		this(type, null);
	}

	public NotificationAction(@NonNull NotificationActionType type, Long referenceId) {
		this.type = type;
		this.referenceId = referenceId;
	}

	public NotificationActionType getType() {
		return type;
	}

	public Long getReferenceId() {
		return referenceId;
	}
}
