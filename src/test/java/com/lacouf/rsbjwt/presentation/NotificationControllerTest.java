package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
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
import java.util.List;

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
		when(notificationService.getNotificationsForEmail("test@email.com")).thenThrow(Exception.class);

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
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		when(notificationService.dismissNotification(1L, "test@email.com")).thenReturn(notification);

		// ACT
		ResponseEntity<DataTransferObject> response = notificationController.dismissNotification(1L, auth);

		// ASSERT
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertEquals(notification, response.getBody());
	}

	@Test
	public void dismissNotification_badArgs_shouldBeBadRequest() {
		// ARRANGE
		Authentication auth = mock(Authentication.class);

		// ACT
		ResponseEntity<DataTransferObject> response = notificationController.dismissNotification(null, auth);

		// ASSERT
		verifyNoInteractions(notificationService);
		assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(ErrorResponse.class, response.getBody().getClass());
	}

	@Test
	public void deleteNotification_allGood_shouldReturnNoContent() throws Exception {
		// ARRANGE
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");

		// ACT
		ResponseEntity<?> response = notificationController.deleteNotification(1L, auth);

		// ASSERT
		verify(notificationService).deleteNotification(1L, "test@email.com");
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	public void deleteNotification_whenServiceThrows_shouldReturnError() throws Exception {
		// ARRANGE
		Authentication auth = mock(Authentication.class);
		when(auth.getName()).thenReturn("test@email.com");
		doThrow(new Exception("erreur")).when(notificationService).deleteNotification(1L, "test@email.com");

		// ACT
		ResponseEntity<?> response = notificationController.deleteNotification(1L, auth);

		// ASSERT
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
		assertNotNull(response.getBody());
		assertEquals(ErrorResponse.class, response.getBody().getClass());
	}
}