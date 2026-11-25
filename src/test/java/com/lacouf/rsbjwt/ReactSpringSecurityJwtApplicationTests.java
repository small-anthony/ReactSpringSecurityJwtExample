package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.ContratService;
import com.lacouf.rsbjwt.service.GestionnaireService;
import com.lacouf.rsbjwt.service.NotificationService;
import com.lacouf.rsbjwt.service.dto.NotificationDTO;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ReactSpringSecurityJwtApplicationTests {

    @Autowired
    private ContratService contratService;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private OffreStageRepository offreStageRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private GestionnaireService gestionnaireService;

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private ContratRepository contratRepository;

    @Test
    void contextLoads() {
    }

    @Test
    @Transactional
    void creerContrat_envoieNotificationsReellesAuxDestinataires() throws Exception {
        Etudiant emma = etudiantRepository.findAll().stream()
                .filter(e -> "emma@test.com".equals(e.getEmail()))
                .findFirst()
                .orElseThrow();
        OffreStage offreCgiSecu = offreStageRepository.findAll().stream()
                .filter(o -> "Analyste Cybersécurité Junior".equals(o.getTitre())
                        && o.getAnnee() == AcademicSessionUtils.getAnneeActuelle())
                .findFirst()
                .orElseThrow();

        Candidature nouvelle = new Candidature(emma, offreCgiSecu);
        nouvelle.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);
        nouvelle = candidatureRepository.save(nouvelle);

        contratService.creerContrat(
                new CreationContratRequest(
                        nouvelle.getId(),
                        LocalDate.of(AcademicSessionUtils.getAnneeActuelle(), 3, 2),
                        LocalDate.of(AcademicSessionUtils.getAnneeActuelle(), 5, 22),
                        "35h/semaine",
                        "27$/h",
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

    @Test
    @Transactional
    void assignerProfesseur_envoieNotificationReelleAuProfesseur() throws Exception {
        var candidats = gestionnaireService.getEtudiantsPourAssignation(null);
        assertFalse(candidats.isEmpty());
        var cible = candidats.stream()
                .filter(e -> !e.estAssigne())
                .findFirst()
                .orElse(candidats.getFirst());

        if (cible.estAssigne()) {
            gestionnaireService.desassignerProfesseur(cible.id());
        }

        Professeur chantal = professeurRepository.findAll().stream()
                .filter(p -> "chantal@test.com".equals(p.getEmail()))
                .findFirst()
                .orElseThrow();

        gestionnaireService.assignerProfesseur(cible.id(), chantal.getId());

        List<NotificationDTO> notifsProf = notificationService.getNotificationsForEmail("chantal@test.com");
        assertTrue(notifsProf.stream().anyMatch(n ->
                "professeur.etudiant_assigne".equals(n.message())
                        && n.action() != null
                        && n.action().type() == NotificationActionType.ETUDIANT_ASSIGNE));
    }

    @Test
    @Transactional
    void donneesDemo_datesMarsAMaiEtCoherentesParSession() {
        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
        int anneeHistorique = anneeCourante - 1;

        List<OffreStage> offres = offreStageRepository.findAll();
        assertFalse(offres.isEmpty());
        assertTrue(offres.stream().anyMatch(o -> o.getAnnee() == anneeCourante));
        assertTrue(offres.stream().anyMatch(o -> o.getAnnee() == anneeHistorique));

        for (OffreStage offre : offres) {
            assertNotNull(offre.getDateDebut(), "dateDebut manquante pour " + offre.getTitre());
            assertNotNull(offre.getDateFin(), "dateFin manquante pour " + offre.getTitre());
            assertTrue(offre.getDateFin().isAfter(offre.getDateDebut()));
            assertEquals(Month.MARCH, offre.getDateDebut().getMonth());
            assertEquals(Month.MAY, offre.getDateFin().getMonth());
            assertEquals(offre.getAnnee(), AcademicSessionUtils.getAnnee(offre.getDateDebut()));
            assertEquals(offre.getAnnee(), offre.getDateDebut().getYear());
        }

        long nbDatesDistinctesCourantes = offres.stream()
                .filter(o -> o.getAnnee() == anneeCourante)
                .map(o -> o.getDateDebut() + "->" + o.getDateFin())
                .distinct()
                .count();
        assertTrue(nbDatesDistinctesCourantes >= 4);

        List<Contrat> contrats = contratRepository.findAll();
        assertFalse(contrats.isEmpty());
        for (Contrat contrat : contrats) {
            assertNotNull(contrat.getDateDebut());
            assertNotNull(contrat.getDateFin());
            assertEquals(Month.MARCH, contrat.getDateDebut().getMonth());
            assertEquals(Month.MAY, contrat.getDateFin().getMonth());
            assertEquals(contrat.getOffreStage().getAnnee(), contrat.getAnneeDebut());
        }
    }

}
