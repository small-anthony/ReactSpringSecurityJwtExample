package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE lower(n.destinataire.credentials.email) = lower(:email) ORDER BY n.dateCreation DESC")
    List<Notification> findByDestinataireEmail(@Param("email") String email);

    @Query("SELECT count(n) FROM Notification n WHERE lower(n.destinataire.credentials.email) = lower(:email) AND n.lu = false")
    long countNonLuesByDestinataireEmail(@Param("email") String email);

    @Modifying
    @Query("UPDATE Notification n SET n.lu = true WHERE lower(n.destinataire.credentials.email) = lower(:email)")
    void marquerToutesCommeLuesByEmail(@Param("email") String email);
}
