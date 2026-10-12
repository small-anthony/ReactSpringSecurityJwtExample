package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

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

                        etudiantRepository.save(
                                        new Etudiant("Hatim", "Fakhour",
                                                        new Credentials("hatim@test.com", defaultPass, Role.ETUDIANT),
                                                        1234567, "info"));

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

                        Candidature cand1 = new Candidature(etudiant, offre1);
                        candidatureRepository.save(cand1);

                        Candidature cand2 = new Candidature(etudiant, offre2);
                        candidatureRepository.save(cand2);

                        Convocation conv1 = new Convocation(
                                        cand1,
                                        LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0)
                                                        .withNano(0),
                                        "En ligne - Microsoft Teams",
                                        "Entrevue technique de 45 minutes pour évaluer les compétences en React et Spring Boot.");
                        convocationRepository.save(conv1);

                        Convocation conv2 = new Convocation(
                                        cand2,
                                        LocalDateTime.now().minusDays(1).withHour(10).withMinute(30).withSecond(0)
                                                        .withNano(0),
                                        "Bureau CGI Inc., 1000 rue de la Gauchetière, Montréal",
                                        "Entrevue DevOps & Cloud.");
                        convocationRepository.save(conv2);

                        employeurRepository.save(
                                        new Employeur("Valentin", "Dimitrov",
                                                        new Credentials("valentin@test.com", defaultPass,
                                                                        Role.EMPLOYEUR),
                                                        "Google", "514 111 1111"));
                } catch (Exception e) {
                }
        }
}
