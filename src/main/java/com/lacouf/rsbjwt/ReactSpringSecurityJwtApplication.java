package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
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
        private final ContratRepository contratRepository;
        private final ProfesseurRepository professeurRepository;
        private final PasswordEncoder passwordEncoder;

        public ReactSpringSecurityJwtApplication(
                        UserAppRepository userAppRepository,
                        GestionnaireRepository gestionnaireRepository,
                        EtudiantRepository etudiantRepository,
                        EmployeurRepository employeurRepository,
                        CandidatureRepository candidatureRepository,
                        ConvocationRepository convocationRepository,
                        ContratRepository contratRepository,
                        ProfesseurRepository professeurRepository,
                        PasswordEncoder passwordEncoder) {
                this.gestionnaireRepository = gestionnaireRepository;
                this.etudiantRepository = etudiantRepository;
                this.employeurRepository = employeurRepository;
                this.candidatureRepository = candidatureRepository;
                this.convocationRepository = convocationRepository;
                this.contratRepository = contratRepository;
                this.professeurRepository = professeurRepository;
                this.passwordEncoder = passwordEncoder;
        }

        private byte[] chargerCvDemo() throws IOException {
                try (InputStream in = new ClassPathResource("cv-demo.pdf").getInputStream()) {
                        return in.readAllBytes();
                }
        }

        public static void main(String[] args) {
                SpringApplication.run(ReactSpringSecurityJwtApplication.class, args);
        }

        @Override
        public void run(String... args) throws Exception {
                try {
                        String bibPass = "bib";
                        String defaultPass = "password";
                        if (passwordEncoder != null) {
                                String encBib = passwordEncoder.encode("bib");
                                if (encBib != null) bibPass = encBib;
                                String encDefault = passwordEncoder.encode("password");
                                if (encDefault != null) defaultPass = encDefault;
                        }

                        byte[] cvBytes = chargerCvDemo();

                        // =========================================================================
                        // 1. ACTEURS (Gestionnaire, Employeurs, Étudiants)
                        // =========================================================================
                        Gestionnaire john = gestionnaireRepository.save(
                                new Gestionnaire("John", "Gestion",
                                        new Credentials("gestionnaire@test.com", bibPass, Role.GESTIONNAIRE)));

                        Employeur cgi = new Employeur(
                                        "Valentin", "Dimitrov",
                                        new Credentials("employeur@test.com", defaultPass, Role.EMPLOYEUR),
                                        "CGI Inc.", "514-555-1234");

                        Employeur google = new Employeur(
                                        "Larry", "Page",
                                        new Credentials("valentin@test.com", defaultPass, Role.EMPLOYEUR),
                                        "Google", "514-111-1111");
                        Professeur profMartin = professeurRepository.save(
                                        new Professeur("Martin", "Tremblay",
                                                        new Credentials("professeur@test.com", defaultPass, Role.PROFESSEUR)));

                        Professeur profChantal = professeurRepository.save(
                                        new Professeur("Chantal", "Gagnon",
                                                        new Credentials("chantal@test.com", defaultPass, Role.PROFESSEUR)));

                        // Étudiants
                        Etudiant hatim = new Etudiant("Hatim", "Fakhour",
                                        new Credentials("etudiant@test.com", defaultPass, Role.ETUDIANT),
                                        1234567, "Techniques de l'informatique");
                        hatim.setCv(cvBytes);
                        hatim.getCv().accepterApprobation();
                        hatim = etudiantRepository.save(hatim);

                        Etudiant sophie = new Etudiant("Sophie", "Martin",
                                        new Credentials("sophie@test.com", defaultPass, Role.ETUDIANT),
                                        7654321, "Techniques de l'informatique");
                        sophie.setCv(cvBytes);
                        sophie.getCv().accepterApprobation();
                        sophie = etudiantRepository.save(sophie);

                        Etudiant luc = new Etudiant("Luc", "Bélanger",
                                        new Credentials("luc@test.com", defaultPass, Role.ETUDIANT),
                                        5551234, "Techniques de l'informatique");
                        luc.setCv(cvBytes);
                        luc.getCv().accepterApprobation();
                        luc = etudiantRepository.save(luc);

                        Etudiant emma = new Etudiant("Emma", "Roy",
                                        new Credentials("emma@test.com", defaultPass, Role.ETUDIANT),
                                        9998888, "Techniques de l'informatique");
                        emma.setCv(cvBytes);
                        emma.getCv().accepterApprobation();
                        emma = etudiantRepository.save(emma);

                        Etudiant marc = new Etudiant("Marc", "Dubois",
                                        new Credentials("marc@test.com", defaultPass, Role.ETUDIANT),
                                        4443322, "Techniques de l'informatique");
                        marc.setCv(cvBytes);
                        marc.getCv().accepterApprobation();
                        marc = etudiantRepository.save(marc);

                        // Étudiant sans convocation / sans CV (pour rapports gestionnaire EQ2-16)
                        Etudiant daniil = new Etudiant("Daniil", "Dimov",
                                        new Credentials("daniil@test.com", defaultPass, Role.ETUDIANT),
                                        1234578, "Techniques de l'informatique");
                        etudiantRepository.save(daniil);

                        Etudiant claire = new Etudiant("Claire", "Lavoie",
                                        new Credentials("claire@test.com", defaultPass, Role.ETUDIANT),
                                        8887776, "Techniques de l'informatique");
                        claire.setCv(cvBytes);
                        claire.getCv().accepterApprobation();
                        claire = etudiantRepository.save(claire);

                        Etudiant alex = new Etudiant("Alex", "Gagnon",
                                        new Credentials("alex@test.com", defaultPass, Role.ETUDIANT),
                                        2223344, "Techniques de l'informatique");
                        alex.setCv(cvBytes);
                        alex.getCv().accepterApprobation();
                        alex = etudiantRepository.save(alex);

                        Etudiant julie = new Etudiant("Julie", "Bouchard",
                                        new Credentials("julie@test.com", defaultPass, Role.ETUDIANT),
                                        3334455, "Techniques de l'informatique");
                        julie.setCv(cvBytes);
                        julie.getCv().accepterApprobation();
                        julie = etudiantRepository.save(julie);

                        Etudiant karim = new Etudiant("Karim", "Benali",
                                        new Credentials("karim@test.com", defaultPass, Role.ETUDIANT),
                                        4445566, "Techniques de l'informatique");
                        karim.setCv(cvBytes);
                        karim.getCv().accepterApprobation();
                        karim = etudiantRepository.save(karim);

                        // =========================================================================
                        // 2. OFFRES DE STAGE (Courantes et Historiques)
                        // =========================================================================
                        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
                        int anneeHistorique = anneeCourante - 1;

                        // Offres CGI Inc. - Session actuelle
                        OffreStage offreCgiDev = new OffreStage(
                                        "Développeur Full Stack Web",
                                        "Participer au développement d'applications web avec React et Spring Boot en méthodologie Agile.",
                                        "CGI Inc.", "Techniques de l'informatique", "24$/h", "15 semaines",
                                        "Connaissance de JavaScript/React et Java. Esprit d'équipe et autonomie.");
                        offreCgiDev.setAnnee(anneeCourante);
                        offreCgiDev.setAdresse("1350 boulevard René-Lévesque Ouest");
                        offreCgiDev.setVille("Montréal");
                        offreCgiDev.setCodePostal("H3G 1T4");
                        offreCgiDev.setTelephone("514-555-0101");
                        offreCgiDev.accepter();
                        cgi.ajouterOffre(offreCgiDev);

                        OffreStage offreCgiSecu = new OffreStage(
                                        "Analyste Cybersécurité Junior",
                                        "Participer aux audits de sécurité applicative et à la configuration des protocoles de chiffrement.",
                                        "CGI Inc.", "Techniques de l'informatique", "27$/h", "15 semaines",
                                        "Intérêt pour la sécurité web, OWASP et les tests d'intrusion.");
                        offreCgiSecu.setAnnee(anneeCourante);
                        offreCgiSecu.setAdresse("1350 boulevard René-Lévesque Ouest");
                        offreCgiSecu.setVille("Montréal");
                        offreCgiSecu.setCodePostal("H3G 1T4");
                        offreCgiSecu.setTelephone("514-555-0101");
                        offreCgiSecu.accepter();
                        cgi.ajouterOffre(offreCgiSecu);

                        // Offres CGI Inc. - Session historique (EQ2-105: Données historiques)
                        OffreStage offreCgiDevOpsHisto = new OffreStage(
                                        "Stagiaire DevOps & Cloud (Archive)",
                                        "Mise en place de pipelines CI/CD, automatisation et surveillance d'infrastructures Docker.",
                                        "CGI Inc.", "Techniques de l'informatique", "26$/h", "15 semaines",
                                        "Connaissance de Linux, Git et Docker.");
                        offreCgiDevOpsHisto.setAnnee(anneeHistorique);
                        offreCgiDevOpsHisto.setAdresse("1350 boulevard René-Lévesque Ouest");
                        offreCgiDevOpsHisto.setVille("Montréal");
                        offreCgiDevOpsHisto.setCodePostal("H3G 1T4");
                        offreCgiDevOpsHisto.setTelephone("514-555-0101");
                        offreCgiDevOpsHisto.accepter();
                        cgi.ajouterOffre(offreCgiDevOpsHisto);

                        employeurRepository.save(cgi);

                        // Offres Google - Session actuelle
                        OffreStage offreGoogleFront = new OffreStage(
                                        "Développeur Frontend React",
                                        "Conception d'interfaces modernes et performantes en méthodologie Agile.",
                                        "Google", "Techniques de l'informatique", "28$/h", "16 semaines",
                                        "Maîtrise de React, JavaScript moderne et Git.");
                        offreGoogleFront.setAnnee(anneeCourante);
                        offreGoogleFront.setAdresse("1253 avenue McGill College");
                        offreGoogleFront.setVille("Montréal");
                        offreGoogleFront.setCodePostal("H3B 2Y5");
                        offreGoogleFront.setTelephone("514-555-0202");
                        offreGoogleFront.accepter();
                        google.ajouterOffre(offreGoogleFront);

                        OffreStage offreGoogleQa = new OffreStage(
                                        "Stagiaire Assurance Qualité QA",
                                        "Écriture de suites de tests end-to-end automatisés et validation de parcours utilisateurs.",
                                        "Google", "Techniques de l'informatique", "25$/h", "15 semaines",
                                        "Connaissance de tests d'intégration, JavaScript et rigueur méthodique.");
                        offreGoogleQa.setAnnee(anneeCourante);
                        offreGoogleQa.setAdresse("1253 avenue McGill College");
                        offreGoogleQa.setVille("Montréal");
                        offreGoogleQa.setCodePostal("H3B 2Y5");
                        offreGoogleQa.setTelephone("514-555-0202");
                        offreGoogleQa.accepter();
                        google.ajouterOffre(offreGoogleQa);

                        employeurRepository.save(google);

                        // =========================================================================
                        // 3. SCÉNARIOS DE DÉMO (Selon le plan de démonstration)
                        // =========================================================================

                        // -------------------------------------------------------------------------
                        // EQ2-13 : En tant qu'employeur, je planifie une entrevue
                        // Employeur : employeur@test.com (CGI Inc.) -> Offre "Développeur Full Stack Web"
                        // Candidat : Luc Bélanger (EN_ATTENTE, bouton "Convoquer" disponible)
                        // -------------------------------------------------------------------------
                        Candidature candJuliePlanif = new Candidature(julie, offreCgiDev);
                        candJuliePlanif.setStatut(StatutCandidature.EN_ATTENTE_CONVOCATION);
                        candidatureRepository.save(candJuliePlanif);

                        Candidature candKarimReconv = new Candidature(karim, offreCgiSecu);
                        candKarimReconv.setStatut(StatutCandidature.ENTREVUE_REFUSEE);
                        List<RendezVous> rvReconv = new ArrayList<>();
                        rvReconv.add(RendezVous.read("Bureau CGI Inc. - Salle 101",
                                        LocalDateTime.now().plusDays(2).withHour(9).withMinute(0).toInstant(ZoneOffset.UTC)));
                        Convocation convRefusee = new Convocation(rvReconv, "Entrevue cybersécurité");
                        candKarimReconv.addConvocation(convRefusee);
                        convRefusee.refuser("Pas disponible le matin, préférez l'après-midi svp.");
                        candidatureRepository.save(candKarimReconv);
                        convocationRepository.save(convRefusee);

                        Candidature candAlexEmbauche = new Candidature(alex, offreCgiSecu);
                        candAlexEmbauche.setStatut(StatutCandidature.EN_ATTENTE_ENTREVUE);
                        List<RendezVous> rvAlex = new ArrayList<>();
                        RendezVous rva1 = RendezVous.read("En ligne - Zoom Sécurité",
                                        LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).toInstant(ZoneOffset.UTC));
                        rvAlex.add(rva1);
                        Convocation convAlex = new Convocation(rvAlex, "Entrevue avec le directeur technique.");
                        candAlexEmbauche.addConvocation(convAlex);
                        convAlex.accepter(rva1, null);
                        candidatureRepository.save(candAlexEmbauche);
                        convocationRepository.save(convAlex);

                        // -------------------------------------------------------------------------
                        // EQ2-16 : En tant que gestionnaire, je vois les étudiants acceptés ou refusés
                        // Gestionnaire : gestionnaire@test.com
                        // Marc Dubois est refusé avec motif de refus
                        // -------------------------------------------------------------------------
                        Candidature candMarcRefuse = new Candidature(marc, offreCgiDev);
                        candMarcRefuse.setStatut(StatutCandidature.REFUSEE);
                        candMarcRefuse.setMessageReponse("Le profil ne correspond pas aux exigences techniques requises.");
                        candMarcRefuse.setDateDecision(LocalDateTime.now().minusDays(1));
                        candidatureRepository.save(candMarcRefuse);

                        Candidature candEmmaCgiChoix = new Candidature(emma, offreCgiDev);
                        candEmmaCgiChoix.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);
                        candidatureRepository.save(candEmmaCgiChoix);

                        Candidature candEmmaGoogleChoix = new Candidature(emma, offreGoogleFront);
                        candEmmaGoogleChoix.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);
                        candidatureRepository.save(candEmmaGoogleChoix);

                        // -------------------------------------------------------------------------
                        // EQ2-18 : En tant qu'étudiant, je signe le contrat
                        // Étudiant : hatim@test.com (Hatim Fakhour) -> "Mes contrats" -> "À signer"
                        // Contrat créé chez Google, statut EN_ATTENTE_SIGNATURE
                        // -------------------------------------------------------------------------
                        Candidature candHatimGoogle = new Candidature(hatim, offreGoogleFront);
                        candHatimGoogle.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
                        candidatureRepository.save(candHatimGoogle);

                        CreationContratRequest reqHatimGoogle = new CreationContratRequest(
                                        candHatimGoogle.getId(),
                                        LocalDate.of(anneeCourante, 5, 11),
                                        LocalDate.of(anneeCourante, 8, 28),
                                        "Du lundi au vendredi, 9h à 17h (35h/semaine)",
                                        "28.00$/h",
                                        "Développement de composants UI React modernes et intégration aux APIs REST.",
                                        "Télétravail hybride (2 jours au bureau). Équipement MacBook Pro fourni.");
                        Contrat contratHatimASigner = new Contrat(
                                        candHatimGoogle,
                                        reqHatimGoogle.dateDebut(), reqHatimGoogle.dateFin(),
                                        reqHatimGoogle.horaire(), reqHatimGoogle.salaire(),
                                        reqHatimGoogle.descriptionTaches(), reqHatimGoogle.conditions());
                        contratRepository.save(contratHatimASigner);

                        // -------------------------------------------------------------------------
                        // EQ2-19 : En tant qu'employeur, je signe le contrat
                        // Employeur : employeur@test.com (CGI Inc.) -> "Contrats de stage" -> "À signer"
                        // Sophie Martin a DÉJÀ signé son contrat (SIGNE_PAR_ETUDIANT)
                        // L'employeur clique sur "Signer le contrat"
                        // -------------------------------------------------------------------------
                        Candidature candSophieCgi = new Candidature(sophie, offreCgiDev);
                        candSophieCgi.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
                        candidatureRepository.save(candSophieCgi);

                        CreationContratRequest reqSophie = new CreationContratRequest(
                                        candSophieCgi.getId(),
                                        LocalDate.of(anneeCourante, 5, 18),
                                        LocalDate.of(anneeCourante, 8, 21),
                                        "Du lundi au vendredi, 8h30 à 16h30 (35h/semaine)",
                                        "24.00$/h",
                                        "Développement full-stack de microservices Spring Boot et interfaces utilisateur.",
                                        "Formule hybride, assurances collectives incluses.");
                        Contrat contratSophieEmployeurASigner = new Contrat(
                                        candSophieCgi,
                                        reqSophie.dateDebut(), reqSophie.dateFin(),
                                        reqSophie.horaire(), reqSophie.salaire(),
                                        reqSophie.descriptionTaches(), reqSophie.conditions());
                        // Sophie a signé
                        contratSophieEmployeurASigner.signer(new Signature<>(sophie, "signature_sophie".getBytes()));
                        contratRepository.save(contratSophieEmployeurASigner);

                        // -------------------------------------------------------------------------
                        // EQ2-20 : En tant que gestionnaire, je signe le contrat + imprime
                        // Gestionnaire : gestionnaire@test.com -> "Contrats existants"
                        // 1) Contrat prêt à signer par le gestionnaire (étudiant et employeur ont signé -> SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR)
                        // 2) Contrat déjà complété (COMPLETE) avec bouton "Imprimer" disponible immédiatement
                        // -------------------------------------------------------------------------
                        Candidature candLucGoogle = new Candidature(luc, offreGoogleQa);
                        candLucGoogle.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
                        candidatureRepository.save(candLucGoogle);

                        CreationContratRequest reqLuc = new CreationContratRequest(
                                        candLucGoogle.getId(),
                                        LocalDate.of(anneeCourante, 5, 25),
                                        LocalDate.of(anneeCourante, 8, 28),
                                        "Du lundi au vendredi, 9h à 17h (35h/semaine)",
                                        "25.00$/h",
                                        "Automatisation de tests E2E avec Playwright et validation continue des livrables.",
                                        "Télétravail complet avec réunions d'équipe hebdomadaires.");
                        Contrat contratPretGestionnaire = new Contrat(
                                        candLucGoogle,
                                        reqLuc.dateDebut(), reqLuc.dateFin(),
                                        reqLuc.horaire(), reqLuc.salaire(),
                                        reqLuc.descriptionTaches(), reqLuc.conditions());
                        // Étudiant + Employeur ont signé
                        contratPretGestionnaire.signer(new Signature<>(luc, "signature_luc".getBytes()));
                        contratPretGestionnaire.signer(new Signature<>(google, "signature_google".getBytes()));
                        contratRepository.save(contratPretGestionnaire);

                        // -------------------------------------------------------------------------
                        // EQ2-23 : En tant qu'employeur, j'évalue un stagiaire de la session courante
                        // Employeur : employeur@test.com (CGI Inc.) -> "Mes stagiaires" -> "Évaluer"
                        // Contrat complété (COMPLETE) dans la session courante (anneeCourante)
                        // -------------------------------------------------------------------------
                        Candidature candClaireCgiComplete = new Candidature(claire, offreCgiDev);
                        candClaireCgiComplete.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candClaireCgiComplete);

                        CreationContratRequest reqClaireComp = new CreationContratRequest(
                                        candClaireCgiComplete.getId(),
                                        LocalDate.of(anneeCourante, 5, 11),
                                        LocalDate.of(anneeCourante, 8, 21),
                                        "35h/semaine", "24.00$/h",
                                        "Développement Full Stack Web avec React et Spring Boot",
                                        "Télétravail hybride");
                        Contrat contratClaireCgiComplete = new Contrat(
                                        candClaireCgiComplete,
                                        reqClaireComp.dateDebut(), reqClaireComp.dateFin(),
                                        reqClaireComp.horaire(), reqClaireComp.salaire(),
                                        reqClaireComp.descriptionTaches(), reqClaireComp.conditions());
                        contratClaireCgiComplete.signer(new Signature<>(claire, "sig_claire".getBytes()));
                        contratClaireCgiComplete.signer(new Signature<>(cgi, "sig_cgi_claire".getBytes()));
                        contratClaireCgiComplete.signer(new Signature<>(john, "sig_john_claire".getBytes()));
                        contratRepository.save(contratClaireCgiComplete);

                        // -------------------------------------------------------------------------
                        // EQ2-105 : Gestion des données historique (nouvelle fonctionnalité)
                        // Offre, candidature et contrat de l'année précédente (anneeHistorique)
                        // Permet de tester le SelecteurSession chez l'employeur et le gestionnaire
                        // -------------------------------------------------------------------------
                        Candidature candHisto = new Candidature(hatim, offreCgiDevOpsHisto);
                        candHisto.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candHisto);

                        CreationContratRequest reqHisto = new CreationContratRequest(
                                        candHisto.getId(),
                                        LocalDate.of(anneeHistorique, 5, 12),
                                        LocalDate.of(anneeHistorique, 8, 22),
                                        "35h/semaine", "26.00$/h",
                                        "Maintenance et automatisation des déploiements DevOps historiques.",
                                        "Conditions standards.");
                        Contrat contratHisto = new Contrat(
                                        candHisto,
                                        reqHisto.dateDebut(), reqHisto.dateFin(),
                                        reqHisto.horaire(), reqHisto.salaire(),
                                        reqHisto.descriptionTaches(), reqHisto.conditions());
                        contratHisto.signer(new Signature<>(hatim, "sig_hatim_histo".getBytes()));
                        contratHisto.signer(new Signature<>(cgi, "sig_cgi_histo".getBytes()));
                        contratHisto.signer(new Signature<>(john, "sig_john_histo".getBytes()));
                        contratRepository.save(contratHisto);

                        seedPaginationData(
                                defaultPass,
                                cvBytes,
                                john,
                                cgi,
                                profMartin,
                                offreCgiDev,
                                anneeCourante
                        );

                        System.out.println("=== INITIALISATION DES DONNÉES DE DÉMONSTRATION COMPLÉTÉE AVEC SUCCÈS ===");
                } catch (Exception e) {
                        e.printStackTrace();
                }
        }

        private void seedPaginationData(
                        String defaultPass,
                        byte[] cvBytes,
                        Gestionnaire john,
                        Employeur cgi,
                        Professeur profMartin,
                        OffreStage offreCgiDev,
                        int anneeCourante) {
                for (int i = 1; i <= 10; i++) {
                        OffreStage offreAcceptee = new OffreStage(
                                        "Développeur Logiciel #" + i,
                                        "Participation au développement d'applications d'entreprise et tests automatisés (#" + i + ").",
                                        "CGI Inc.",
                                        "Techniques de l'informatique",
                                        (22 + (i % 5)) + "$/h",
                                        "15 semaines",
                                        "Java, React, Git");
                        offreAcceptee.setAnnee(anneeCourante);
                        offreAcceptee.setAdresse("1350 boulevard René-Lévesque Ouest");
                        offreAcceptee.setVille("Montréal");
                        offreAcceptee.setCodePostal("H3G 1T4");
                        offreAcceptee.setTelephone("514-555-0101");
                        offreAcceptee.accepter();
                        cgi.ajouterOffre(offreAcceptee);
                }

                for (int i = 1; i <= 11; i++) {
                        OffreStage offreEnAttente = new OffreStage(
                                        "Analyste TI à approuver #" + i,
                                        "Analyse fonctionnelle, support technique et documentation applicative (#" + i + ").",
                                        "CGI Inc.",
                                        "Techniques de l'informatique",
                                        "23$/h",
                                        "15 semaines",
                                        "SQL, Communication, Agile");
                        offreEnAttente.setAnnee(anneeCourante);
                        offreEnAttente.setAdresse("1350 boulevard René-Lévesque Ouest");
                        offreEnAttente.setVille("Montréal");
                        offreEnAttente.setCodePostal("H3G 1T4");
                        offreEnAttente.setTelephone("514-555-0101");
                        cgi.ajouterOffre(offreEnAttente);
                }
                employeurRepository.save(cgi);

                String[] prenoms = {
                        "Camille", "Noah", "Léa", "Gabriel", "Chloé",
                        "Thomas", "Zoé", "Nathan", "Maya", "Félix",
                        "Alice", "Raphaël", "Sarah", "Léo", "Jade",
                        "Samuel", "Inès", "Olivier", "Mila", "Antoine",
                        "Clara", "Victor", "Éva", "Émile", "Rose"
                };
                String[] noms = {
                        "Gagnon", "Pelletier", "Roy", "Côté", "Fortin",
                        "Bélanger", "Morin", "Lévesque", "Ouellet", "Bouchard",
                        "Gauthier", "Bergeron", "Poirier", "Lacroix", "Beaulieu",
                        "Girard", "Nadeau", "Martel", "Caron", "Deschamps",
                        "Boucher", "Savard", "Dufour", "Paquette", "Simard"
                };

                for (int i = 0; i < prenoms.length; i++) {
                        Etudiant etu = new Etudiant(
                                        prenoms[i],
                                        noms[i],
                                        new Credentials("pag.etudiant" + (i + 1) + "@test.com", defaultPass, Role.ETUDIANT),
                                        9000001 + i,
                                        "Techniques de l'informatique");
                        etu.setCv(cvBytes);
                        if (i >= 12) {
                                etu.getCv().accepterApprobation();
                        }
                        etu = etudiantRepository.save(etu);

                        if (i >= 12 && i < 24) {
                                etu.setProfesseur(profMartin);
                                etu = etudiantRepository.save(etu);

                                Candidature cand = new Candidature(etu, offreCgiDev);
                                cand.setStatut(StatutCandidature.EMBAUCHEE);
                                cand = candidatureRepository.save(cand);

                                Contrat contrat = new Contrat(
                                                cand,
                                                LocalDate.of(anneeCourante, 5, 11),
                                                LocalDate.of(anneeCourante, 8, 21),
                                                "35h/semaine",
                                                "24.00$/h",
                                                "Développement Full Stack et tests unitaires.",
                                                "Télétravail hybride");
                                contrat.signer(new Signature<>(etu, ("sig_etu_" + i).getBytes()));
                                contrat.signer(new Signature<>(cgi, ("sig_cgi_" + i).getBytes()));
                                contrat.signer(new Signature<>(john, ("sig_john_" + i).getBytes()));
                                contratRepository.save(contrat);
                        }
                }
        }
}
