package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {
	@InjectMocks
	private NotificationService notificationService;

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private UserAppRepository userAppRepository;

	private UserApp testUser;

	private List<Notification> testNotifications;

	@BeforeEach
	public void setUp() {
		testUser = new Etudiant(
				"test", "user",
				new Credentials("test@email.com", "password", Role.ETUDIANT),
				1234567,
				"Test Discipline"
		);
		testUser.setId(1L);

		testNotifications = new ArrayList<>();
		testNotifications.add(Notification.cvAccepted());
		testNotifications.add(Notification.cvRejected());

		AtomicLong idGenerated = new AtomicLong(1L);
		testNotifications.forEach((notification -> {
			testUser.addNotification(notification);
			ReflectionTestUtils.setField(notification, "id", idGenerated.getAndIncrement());
		}));
	}

	@Test
	public void getNotifications_allGood_shouldWork() throws Exception {
		// ARRANGE
		when(userAppRepository.findUserAppByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
		when(notificationRepository.findAllByOwner(testUser)).thenReturn(testNotifications);

		// ACT
		List<NotificationDTO> result = notificationService.getNotificationsForEmail(testUser.getEmail());

		// ASSERT
		assertFalse(result.isEmpty());

		AtomicInteger loopIndex = new AtomicInteger(0);
		result.forEach((dto) -> {
			int index = loopIndex.getAndIncrement();
			Notification entity = testNotifications.get(index);
			assertEquals(dto.id(), entity.getId());
			assertEquals(dto.type(), entity.getType());
			assertEquals(dto.action().type(), entity.getAction().getType());
		});
	}

	@Test
	public void getNotifications_noNotifications_shouldStillWork() throws Exception {
		// ARRANGE
		when(userAppRepository.findUserAppByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
		when(notificationRepository.findAllByOwner(testUser)).thenReturn(new ArrayList<>());

		// ACT
		List<NotificationDTO> result = notificationService.getNotificationsForEmail(testUser.getEmail());

		// ASSERT
		assertTrue(result.isEmpty());
	}

	@Test
	public void getNotifications_badUser_shouldThrow() {
		// ARRANGE
		when(userAppRepository.findUserAppByEmail(testUser.getEmail())).thenReturn(Optional.empty());
		verifyNoInteractions(notificationRepository);
		// ACT

		// ASSERT
		assertThrows(Exception.class, () -> notificationService.getNotificationsForEmail(testUser.getEmail()));
	}

	@Test
	public void pushNotification_shouldSetOwner() {
		// ARRANGE
		when(userAppRepository.getReferenceById(testUser.getId())).thenReturn(testUser);
		Notification newNotification = Notification.cvAccepted();
		when(notificationRepository.save(newNotification)).thenReturn(newNotification);

		// ACT
		notificationService.pushNotification(newNotification, testUser.getId());

		// ASSERT
		assertEquals(newNotification.getOwner(), testUser);
	}

	@Test
	public void dismissNotification_allGood_shouldWork() throws Exception {
		// ARRANGE
		Notification targetedNotification = testNotifications.getFirst();
		when(notificationRepository.findByIdWithOwner(targetedNotification.getId())).thenReturn(Optional.of(targetedNotification));
		when(notificationRepository.save(targetedNotification)).thenReturn(targetedNotification);

		// ACT
		Long id = targetedNotification.getId();
		NotificationDTO dismissed = notificationService.dismissNotification(targetedNotification.getId(), testUser.getEmail());

		// ASSERT
		assertEquals(dismissed.id(), targetedNotification.getId());
		assertEquals(dismissed.type(), targetedNotification.getType());
		assertEquals(dismissed.action().type(), targetedNotification.getAction().getType());

		assertTrue(targetedNotification.isDismissed());
		assertEquals(dismissed.dismissed(), targetedNotification.isDismissed());
	}

	@Test
	public void dismissNotification_wrongUser_shouldThrowException() throws Exception {
		// ARRANGE
		Notification targetedNotification = testNotifications.getFirst();
		when(notificationRepository.findByIdWithOwner(targetedNotification.getId())).thenReturn(Optional.of(targetedNotification));
		verify(notificationRepository, never()).save(targetedNotification);

		// ACT

		// ASSERT
		assertThrows(Exception.class, () -> notificationService.dismissNotification(targetedNotification.getId(), "randomkid@email.com"));
	}
}
