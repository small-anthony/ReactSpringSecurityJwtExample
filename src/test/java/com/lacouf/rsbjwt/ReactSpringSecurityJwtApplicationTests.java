package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ReactSpringSecurityJwtApplicationTests {

    @Autowired
    private ContratService contratService;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private NotificationService notificationService;

    @Test
    void contextLoads() {
    }

    @Test
    void creerContrat_envoieNotificationsReellesAuxDestinataires() throws Exception {
        var emmaCgi = contratService.getCandidaturesPourContrat().stream()
                .filter(c -> "emma@test.com".equals(c.etudiantEmail())
                        && "employeur@test.com".equals(c.employeurEmail()))
                .findFirst()
                .orElseThrow();

        contratService.creerContrat(
                new CreationContratRequest(
                        emmaCgi.candidatureId(),
                        LocalDate.of(2027, 5, 11),
                        LocalDate.of(2027, 8, 21),
                        "35h/semaine",
                        "24$/h",
                        "Taches",
                        "Conditions"),
                "gestionnaire@test.com");

        List<NotificationDTO> notifsEtudiant = notificationService.getNotificationsForEmail("emma@test.com");
        List<NotificationDTO> notifsEmployeur = notificationService.getNotificationsForEmail("employeur@test.com");

        assertFalse(notifsEtudiant.isEmpty());
        assertTrue(notifsEtudiant.stream().anyMatch(n -> "etudiant.contrat_created".equals(n.message())));
        assertFalse(notifsEmployeur.isEmpty());
        assertTrue(notifsEmployeur.stream().anyMatch(n -> "employeur.contrat_created".equals(n.message())));
    }

}
