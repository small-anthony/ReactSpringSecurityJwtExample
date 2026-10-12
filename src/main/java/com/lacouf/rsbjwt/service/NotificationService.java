package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.NotificationRepository;
import com.lacouf.rsbjwt.service.dto.NotificationDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification creerNotification(UserApp destinataire, String titre, String message, String type, Long referenceId) {
        if (destinataire == null) return null;
        Notification notif = new Notification(destinataire, titre, message, type, referenceId);
        return notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(String userEmail) {
        return notificationRepository.findByDestinataireEmail(userEmail)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getNombreNonLues(String userEmail) {
        return notificationRepository.countNonLuesByDestinataireEmail(userEmail);
    }

    @Transactional
    public void marquerCommeLue(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée"));
        if (!notification.getDestinataire().getEmail().equalsIgnoreCase(userEmail)) {
            throw new SecurityException("Accès non autorisé à cette notification");
        }
        notification.setLu(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void marquerToutesCommeLues(String userEmail) {
        notificationRepository.marquerToutesCommeLuesByEmail(userEmail);
    }

    @Transactional
    public void supprimerNotification(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée"));
        if (!notification.getDestinataire().getEmail().equalsIgnoreCase(userEmail)) {
            throw new SecurityException("Accès non autorisé à cette notification");
        }
        notificationRepository.delete(notification);
    }
}
