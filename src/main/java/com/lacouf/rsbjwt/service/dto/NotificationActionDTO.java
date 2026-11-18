package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

public record NotificationActionDTO(NotificationActionType type, Long referenceId) implements DataTransferObject {

	public static NotificationActionDTO create(NotificationAction notificationAction) {
		return new NotificationActionDTO(
				notificationAction.getType(),
				notificationAction.getReferenceId()
		);
	}
}
