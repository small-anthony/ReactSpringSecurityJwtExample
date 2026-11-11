package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
	private final UserAppRepository userAppRepository;
	private final NotificationRepository notificationRepository;

	NotificationService(UserAppRepository userAppRepository, NotificationRepository notificationRepository) {
		this.userAppRepository = userAppRepository;
		this.notificationRepository = notificationRepository;
	}

	@Transactional(readOnly = true)
	public List<NotificationDTO> getNotificationsForEmail(String email) throws Exception {
		UserApp user = userAppRepository.findUserAppByEmail(email)
				.orElseThrow(Exception::new);

		List<Notification> notifications = notificationRepository.findAllByOwner(user);
		return NotificationDTO.create(notifications);
	}

	@Transactional
	public void pushNotification(Notification notification, Long ownerId) {
		UserApp userReference = userAppRepository.getReferenceById(ownerId);
		notification.setOwner(userReference);
		notificationRepository.save(notification);
	}

	@Transactional
	public NotificationDTO dismissNotification(Long notificationId, String actorEmail) throws Exception {
		Notification notification = notificationRepository.findByIdWithOwner(notificationId)
				.orElseThrow(Exception::new);

		if(!notification.isOwnedBy(actorEmail)) {
			throw new Exception("impossible d'ignorer un notification qu'on ne possede pas");
		}

		notification.dismiss();
		return NotificationDTO.create(notificationRepository.save(notification));
	}
}
