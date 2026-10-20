package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class ReactSpringSecurityJwtApplication implements CommandLineRunner {
        private final GestionnaireRepository gestionnaireRepository;
        private final EtudiantRepository etudiantRepository;
        private final EmployeurRepository employeurRepository;
        private final CandidatureRepository candidatureRepository;
        private final ConvocationRepository convocationRepository;
        private final PasswordEncoder passwordEncoder;

        public ReactSpringSecurityJwtApplication(
                        UserAppRepository userAppRepository,
                        GestionnaireRepository gestionnaireRepository,
                        EtudiantRepository etudiantRepository,
                        EmployeurRepository employeurRepository,
                        CandidatureRepository candidatureRepository,
                        ConvocationRepository convocationRepository,
                        PasswordEncoder passwordEncoder) {
                this.gestionnaireRepository = gestionnaireRepository;
                this.etudiantRepository = etudiantRepository;
                this.employeurRepository = employeurRepository;
                this.candidatureRepository = candidatureRepository;
                this.convocationRepository = convocationRepository;
                this.passwordEncoder = passwordEncoder;
        }

        public static void main(String[] args) {
                SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
        }

        @Override
        public void run(String... args) throws Exception {
                try {
                        String bibPass = passwordEncoder != null ? passwordEncoder.encode("bib") : null;
                        if (bibPass == null)
                                bibPass = "bib";

                        String defaultPass = passwordEncoder != null ? passwordEncoder.encode("password") : null;
                        if (defaultPass == null)
                                defaultPass = "password";

                        gestionnaireRepository.save(
                                        new Gestionnaire("john", "gestion",
                                                        new Credentials("gestionnaire@test.com", bibPass,
                                                                        Role.GESTIONNAIRE)));

                        Etudiant etudiant = new Etudiant(
                                        "Hatim",
                                        "Fakhour",
                                        new Credentials("etudiant@test.com", defaultPass, Role.ETUDIANT),
                                        1234567,
                                        "Techniques de l'informatique");
                        etudiant.setCv(new byte[] { 1, 2, 3 });
                        etudiant.getCv().accepterApprobation();
                        etudiantRepository.save(etudiant);

                        Etudiant hatim = new Etudiant("Hatim", "Fakhour",
                                        new Credentials("hatim@test.com", defaultPass, Role.ETUDIANT),
                                        1234567, "Techniques de l'informatique");
                        hatim.setCv(new byte[] { 1, 2, 3 });
                        hatim.getCv().accepterApprobation();
                        hatim = etudiantRepository.save(hatim);

                        etudiantRepository.save(
                                        new Etudiant("Daniil", "Dimov",
                                                        new Credentials("daniil@test.com", defaultPass, Role.ETUDIANT),
                                                        1234578, "info"));

                        Employeur employeur = new Employeur(
                                        "Valentin",
                                        "Dimitrov",
                                        new Credentials("employeur@test.com", defaultPass, Role.EMPLOYEUR),
                                        "CGI Inc.",
                                        "514-555-1234");

                        OffreStage offre1 = new OffreStage(
                                        "Développeur Full Stack Web",
                                        "Participer au développement d'applications web avec React et Spring Boot en méthodologie Agile.",
                                        "CGI Inc.",
                                        "Techniques de l'informatique",
                                        "24$/h",
                                        "15 semaines",
                                        "Connaissance de JavaScript/React et Java. Esprit d'équipe et autonomie.");
                        offre1.accepter();
                        employeur.ajouterOffre(offre1);

                        OffreStage offre2 = new OffreStage(
                                        "Stagiaire DevOps & Cloud",
                                        "Mise en place de pipelines CI/CD, automatisation et surveillance d'infrastructures Docker.",
                                        "CGI Inc.",
                                        "Techniques de l'informatique",
                                        "26$/h",
                                        "15 semaines",
                                        "Connaissance de Linux, Git et Docker. Notions de cloud computing un atout.");
                        offre2.accepter();
                        employeur.ajouterOffre(offre2);

                        OffreStage offre4 = new OffreStage(
                                        "Analyste Cybersécurité Junior",
                                        "Participer aux audits de sécurité applicative et à la mise en place de protocoles de chiffrement.",
                                        "CGI Inc.",
                                        "Techniques de l'informatique",
                                        "27$/h",
                                        "15 semaines",
                                        "Intérêt pour la sécurité web, OWASP et les tests d'intrusion.");
                        offre4.accepter();
                        employeur.ajouterOffre(offre4);

                        employeurRepository.save(employeur);

                        Employeur employeurGoogle = new Employeur(
                                        "Larry",
                                        "Page",
                                        new Credentials("valentin@test.com", defaultPass, Role.EMPLOYEUR),
                                        "Google",
                                        "514-111-1111");

                        OffreStage offre3 = new OffreStage(
                                        "Développeur Frontend React",
                                        "Conception d'interfaces modernes et performantes en méthodologie Agile.",
                                        "Google",
                                        "Techniques de l'informatique",
                                        "28$/h",
                                        "16 semaines",
                                        "Maîtrise de React, JavaScript moderne et Git.");
                        offre3.accepter();
                        employeurGoogle.ajouterOffre(offre3);

                        OffreStage offre5 = new OffreStage(
                                        "Stagiaire Assurance Qualité QA",
                                        "Écriture de suites de tests end-to-end automatisés et validation de parcours utilisateurs.",
                                        "Google",
                                        "Techniques de l'informatique",
                                        "25$/h",
                                        "15 semaines",
                                        "Connaissance de tests d'intégration, JavaScript et rigueur méthodique.");
                        offre5.accepter();
                        employeurGoogle.ajouterOffre(offre5);

                        employeurRepository.save(employeurGoogle);

                        // =========================================================================
                        // SCÉNARIO 1 : EN_ATTENTE - Choix Multi-créneaux (Pour tester l'ACCEPTATION)
                        // =========================================================================
                        Candidature cand1 = new Candidature(etudiant, offre1);
                        List<RendezVous> rv1 = new ArrayList<>();
                        RendezVous rv1_slot1 = RendezVous.read("En ligne - Microsoft Teams (Option 1)",
                                LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        RendezVous rv1_slot2 = RendezVous.read("Bureau CGI Inc., 1000 rue de la Gauchetière, Montréal (Option 2)",
                                LocalDateTime.now().plusDays(3).withHour(10).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        rv1.add(rv1_slot1);
                        rv1.add(rv1_slot2);
                        Convocation conv1 = new Convocation(rv1,
                                "Bonjour, votre profil a retenu toute notre attention. Veuillez choisir le créneau qui vous convient le mieux pour une entrevue technique de 45 minutes.");
                        cand1.addConvocation(conv1);
                        candidatureRepository.save(cand1);
                        convocationRepository.save(conv1);

                        // =========================================================================
                        // SCÉNARIO 2 : EN_ATTENTE - Créneau unique (Pour tester le REFUS avec motif)
                        // =========================================================================
                        Candidature cand2 = new Candidature(etudiant, offre3);
                        List<RendezVous> rv2 = new ArrayList<>();
                        RendezVous rv2_slot1 = RendezVous.read("Google Meet (Visioconférence)",
                                LocalDateTime.now().plusDays(4).withHour(15).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        rv2.add(rv2_slot1);
                        Convocation conv2 = new Convocation(rv2,
                                "Bonjour ! Nous aimerions planifier une entrevue d'une heure sur vos projets React.");
                        cand2.addConvocation(conv2);
                        candidatureRepository.save(cand2);
                        convocationRepository.save(conv2);

                        // =========================================================================
                        // SCÉNARIO 3 : ACCEPTEE (Déjà confirmée avec créneau sélectionné)
                        // =========================================================================
                        Candidature cand3 = new Candidature(etudiant, offre4);
                        List<RendezVous> rv3 = new ArrayList<>();
                        RendezVous rv3_slot1 = RendezVous.read("En ligne - Zoom (Entrevue Sécurité)",
                                LocalDateTime.now().plusDays(5).withHour(11).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        RendezVous rv3_slot2 = RendezVous.read("Bureau CGI Inc. - Salle Sécurité 3B",
                                LocalDateTime.now().plusDays(6).withHour(13).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        rv3.add(rv3_slot1);
                        rv3.add(rv3_slot2);
                        Convocation conv3 = new Convocation(rv3,
                                "Entrevue avec le responsable cybersécurité.");
                        cand3.addConvocation(conv3);
                        conv3.accepter(rv3_slot1, null);
                        candidatureRepository.save(cand3);
                        convocationRepository.save(conv3);

                        // =========================================================================
                        // SCÉNARIO 4 : REFUSEE (Déjà refusée avec motif d'étudiant)
                        // =========================================================================
                        Candidature cand4 = new Candidature(etudiant, offre5);
                        List<RendezVous> rv4 = new ArrayList<>();
                        RendezVous rv4_slot1 = RendezVous.read("Google Montréal - Salle 201",
                                LocalDateTime.now().plusDays(3).withHour(9).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        rv4.add(rv4_slot1);
                        Convocation conv4 = new Convocation(rv4,
                                "Entrevue pour le poste de stagiaire QA chez Google.");
                        cand4.addConvocation(conv4);
                        conv4.refuser("J'ai déjà accepté une offre de stage chez un autre employeur pour cette session.");
                        candidatureRepository.save(cand4);
                        convocationRepository.save(conv4);

                        // =========================================================================
                        // SCÉNARIO 5 : EXPIREE (Date limite échue dans le passé)
                        // =========================================================================
                        Candidature cand5 = new Candidature(etudiant, offre2);
                        List<RendezVous> rv5 = new ArrayList<>();
                        RendezVous rv5_slot1 = RendezVous.read("Bureau CGI Inc., 1000 rue de la Gauchetière, Montréal",
                                LocalDateTime.now().minusDays(1).withHour(10).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC));
                        rv5.add(rv5_slot1);
                        Convocation conv5 = new Convocation(rv5,
                                "Entrevue DevOps & Cloud.");
                        cand5.addConvocation(conv5);
                        conv5.setDateLimite(Instant.now().minus(2, ChronoUnit.DAYS));
                        candidatureRepository.save(cand5);
                        convocationRepository.save(conv5);

                        // Données miroir pour hatim@test.com
                        Candidature candHatim = new Candidature(hatim, offre1);
                        List<RendezVous> rvHatim = new ArrayList<>();
                        rvHatim.add(RendezVous.read("En ligne - Microsoft Teams (Option 1)",
                                LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        rvHatim.add(RendezVous.read("Bureau CGI Inc., Montréal (Option 2)",
                                LocalDateTime.now().plusDays(3).withHour(10).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        Convocation convHatim = new Convocation(rvHatim,
                                "Convocation d'entrevue technique CGI Inc.");
                        candHatim.addConvocation(convHatim);
                        candidatureRepository.save(candHatim);
                        convocationRepository.save(convHatim);
                } catch (Exception e) {
                        e.printStackTrace();
                }
        }
}
