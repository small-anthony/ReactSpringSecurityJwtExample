package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.NotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMesNotifications(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(notificationService.getNotifications(email));
    }

    @GetMapping("/non-lues/count")
    public ResponseEntity<Map<String, Long>> getNombreNonLues(Authentication authentication) {
        String email = authentication.getName();
        long count = notificationService.getNombreNonLues(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        notificationService.marquerCommeLue(id, email);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/tout-lire")
    public ResponseEntity<Void> marquerToutesCommeLues(Authentication authentication) {
        String email = authentication.getName();
        notificationService.marquerToutesCommeLues(email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerNotification(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        notificationService.supprimerNotification(id, email);
        return ResponseEntity.noContent().build();
    }
}
