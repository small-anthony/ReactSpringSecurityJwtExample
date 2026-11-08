package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationResourceType;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationType;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import com.lacouf.rsbjwt.util.NotificationPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

	@Mock
	private NotificationService notificationService;

	@InjectMocks
	private NotificationController notificationController;

	private List<NotificationDTO> notifications;

	@BeforeEach
	public void setUp() {
		List<Notification> notifs = new ArrayList<>();

		notifs.add(Notification.cvAccepted());
		notifs.add(Notification.cvRejected());

		notifications = NotificationDTO.create(notifs);
	}

	@Test
	public void getNotifications_allGood_shouldWork() throws Exception {
		// ARRANGE
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		when(notificationService.getNotificationsForEmail("test@email.com")).thenReturn(notifications);

		// ACT
		ResponseEntity<?> response = notificationController.getNotificationsForAuth(auth);

		// ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(notifications, response.getBody());
	}

	@Test
	public void getNotifications_noNotifications_shouldReturnEmptyList() throws Exception {
		// ARRANGE
		List<NotificationDTO> notifs = new ArrayList<>();

		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		when(notificationService.getNotificationsForEmail("test@email.com")).thenReturn(notifs);

		// ACT
		ResponseEntity<?> response = notificationController.getNotificationsForAuth(auth);

		// ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(notifs, response.getBody());
	}

	@Test
	public void getNotifications_whenThrowing_shouldReturnError() throws Exception {
		// ARRANGE
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		when(notificationService.getNotificationsForEmail("test@gmail.com")).thenThrow(Exception.class);

		// ACT
		ResponseEntity<?> response = notificationController.getNotificationsForAuth(auth);

		// ASSERT
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(ErrorResponse.class, response.getBody().getClass());
	}

	@Test
	public void dismissNotification_allGood_shouldWork() throws Exception {
		// ARRANGE
		NotificationDTO notification = new NotificationDTO(1L, null, null, null, null, false);
		Map<String, Object> request = new HashMap<>();
		request.put("id", 1L);

		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		when(notificationService.dismissNotification(1L, "test@email.com")).thenReturn(notification);

		// ACT
		ResponseEntity<DataTransferObject> response = notificationController.dismissNotification(request, auth);

		// ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(notification, response.getBody());
	}

	@Test
	public void dismissNotification_badArgs_shouldBeBadRequest() throws Exception {
		// ARRANGE
		NotificationDTO notification = new NotificationDTO(1L, null, null, null, null, false);
		Map<String, Object> request = new HashMap<>();
		request.put("id", "Boy what the hell boy");

		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		verifyNoInteractions(notificationService);

		// ACT
		ResponseEntity<DataTransferObject> response = notificationController.dismissNotification(request, auth);

		// ASSERT
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(ErrorResponse.class, response.getBody().getClass());
	}
}
