package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	@Query("""
		SELECT DISTINCT notif
		FROM Notification notif
			LEFT JOIN FETCH notif.owner
		WHERE notif.owner = :owner
		ORDER BY notif.dateCreation DESC
		""")
	List<Notification> findAllByOwner(UserApp owner);
}
