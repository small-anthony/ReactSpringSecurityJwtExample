package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.model.embeddable.notifications.NotificationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	@Query("""
		SELECT DISTINCT notif
		FROM Notification notif
			LEFT JOIN FETCH notif.owner
		WHERE notif.owner = :owner
		ORDER BY notif.id DESC
		""")
	List<Notification> findAllByOwner(UserApp owner);

	@Query("""
		SELECT notif
		FROM Notification notif
			LEFT JOIN FETCH notif.owner
		WHERE notif.id = :id
		""")
	Optional<Notification> findByIdWithOwner(Long id);
}
