package com.lacouf.rsbjwt.model.embeddable.notifications;

import com.lacouf.rsbjwt.model.ENUM.NotificationActionType;
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
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "action_payload")
	private Map<String, Object> payload;

	public NotificationAction(@NonNull NotificationActionType type, @NonNull Map<String, Object> payload) {
		this.type = type;
		this.payload = payload;
	}

	public NotificationActionType getType() {
		return type;
	}

	public Map<String, Object> getPayload() {
		return Collections.unmodifiableMap(payload);
	}
}
