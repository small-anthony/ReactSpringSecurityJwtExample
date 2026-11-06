package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@GetMapping()
	public ResponseEntity<?> getNotificationsForAuth(Authentication authentication) {
		try {
			String actorEmail = authentication.getName();
			List<NotificationDTO> notifications = notificationService.getNotificationsForEmail(actorEmail);
			return ResponseEntity.ok(notifications);
		}
		catch (Exception e) {
			return ResponseEntity.internalServerError().body(ErrorResponse.create(e));
		}
	}
}
