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

import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
                        employeurRepository.save(employeurGoogle);

                        // Convocation 1 : multi-créneaux dans le futur (EN_ATTENTE)
                        Candidature cand1 = new Candidature(etudiant, offre1);
                        List<RendezVous> rv1 = new ArrayList<>();
                        rv1.add(RendezVous.read("En ligne - Microsoft Teams (Option 1)",
                                LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        rv1.add(RendezVous.read("En ligne - Microsoft Teams (Option 2)",
                                LocalDateTime.now().plusDays(3).withHour(10).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        Convocation conv1 = new Convocation(rv1,
                                "Entrevue technique de 45 minutes pour évaluer les compétences en React et Spring Boot. Choisissez le créneau qui vous convient.");
                        cand1.addConvocation(conv1);
                        candidatureRepository.save(cand1);
                        convocationRepository.save(conv1);

                        // Convocation 2 : créneau passé
                        Candidature cand2 = new Candidature(etudiant, offre2);
                        List<RendezVous> rv2 = new ArrayList<>();
                        rv2.add(RendezVous.read("Bureau CGI Inc., 1000 rue de la Gauchetière, Montréal",
                                LocalDateTime.now().minusDays(1).withHour(10).withMinute(30).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        Convocation conv2 = new Convocation(rv2,
                                "Entrevue DevOps & Cloud.");
                        cand2.addConvocation(conv2);
                        candidatureRepository.save(cand2);
                        convocationRepository.save(conv2);

                        // Convocation 3 : Google (EN_ATTENTE avec 2 options)
                        Candidature cand3 = new Candidature(etudiant, offre3);
                        List<RendezVous> rv3 = new ArrayList<>();
                        rv3.add(RendezVous.read("Google Montréal - Salle 402",
                                LocalDateTime.now().plusDays(4).withHour(13).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        rv3.add(RendezVous.read("Google Meet (Visioconférence)",
                                LocalDateTime.now().plusDays(5).withHour(15).withMinute(0).withSecond(0)
                                        .withNano(0).toInstant(ZoneOffset.UTC)));
                        Convocation conv3 = new Convocation(rv3,
                                "Entrevue pour le stage Développeur Frontend chez Google. Merci de confirmer votre disponibilité.");
                        cand3.addConvocation(conv3);
                        candidatureRepository.save(cand3);
                        convocationRepository.save(conv3);

                        // Données pour hatim@test.com
                        Candidature candHatim = new Candidature(hatim, offre1);
                        List<RendezVous> rvHatim = new ArrayList<>();
                        rvHatim.add(RendezVous.read("En ligne - Microsoft Teams",
                                LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0)
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
