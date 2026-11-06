package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.NotificationActionType;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.util.Map;

public record NotificationActionDTO(
	NotificationActionType type,
	Map<String, Object> payload
) implements DataTransferObject {
	public static NotificationActionDTO create(NotificationAction notificationAction) {
		return new NotificationActionDTO(
				notificationAction.getType(),
				notificationAction.getPayload()
		);
	}
}
