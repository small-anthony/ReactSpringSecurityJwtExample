package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	@Query("""
    SELECT DISTINCT notif
    FROM Notification notif
        LEFT JOIN FETCH notif.owner
    WHERE notif.owner = :owner
        AND notif.dateDeleted IS NULL
    ORDER BY notif.id DESC
    """)
	List<Notification> findAllByOwner(@Param("owner") UserApp owner);

	@Query("SELECT notif FROM Notification notif LEFT JOIN FETCH notif.owner WHERE notif.id = :id")
	Optional<Notification> findByIdWithOwner(@Param("id") Long id);
}