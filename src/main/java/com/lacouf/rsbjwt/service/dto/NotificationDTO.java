package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.model.ENUM.NotificationType;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

import java.time.Instant;
import java.util.List;

public record NotificationDTO(
	NotificationType type,
	String message,
	NotificationActionDTO action,
	Instant dateCreation,
	boolean dismissed
) implements DataTransferObject {
	public static NotificationDTO create(Notification notification) {
		return new NotificationDTO(
				notification.getType(),
				notification.getMessage(),
				NotificationActionDTO.create(notification.getAction()),
				notification.getDateDismissed(),
				notification.isDismissed()
		);
	}

	public static List<NotificationDTO> create(List<Notification> notifications) {
		return notifications.stream().map(NotificationDTO::create).toList();
	}
}
