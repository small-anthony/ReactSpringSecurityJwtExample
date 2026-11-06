package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
	private final UserAppRepository userAppRepository;
	private final NotificationRepository notificationRepository;

	NotificationService(UserAppRepository userAppRepository, NotificationRepository notificationRepository) {
		this.userAppRepository = userAppRepository;
		this.notificationRepository = notificationRepository;
	}

	public List<NotificationDTO> getNotificationsForEmail(String email) throws Exception {
		UserApp user = userAppRepository.findUserAppByEmail(email)
				.orElseThrow(Exception::new);

		List<Notification> notifications = notificationRepository.findAllByOwner(user);
		return NotificationDTO.create(notifications);
	}
}
