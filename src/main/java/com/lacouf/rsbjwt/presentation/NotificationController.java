package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

	@PostMapping("/dismiss")
	public ResponseEntity<DataTransferObject> dismissNotification(@RequestBody Map<String, Object> request, Authentication authentication) {
		try {
			String actorEmail = authentication.getName();

			long id;
			Object rawId = request.get("id");
			id = switch (rawId) {
				case Integer intId -> Long.valueOf(intId);
				case Long longId -> longId;
				case String stringId -> Long.parseLong(stringId);
				case null, default -> throw new ClassCastException("cannot convert id to Long");
			};

			NotificationDTO notification = notificationService.dismissNotification(id, actorEmail);
			return ResponseEntity.ok().body(notification);
		}
		catch(NullPointerException | ClassCastException | NumberFormatException e) {
			return ResponseEntity.badRequest().body(new ErrorResponse("bad id"));
		}
		catch(Exception e) {
			return ResponseEntity.internalServerError().body(ErrorResponse.create(e));
		}
	}
}
