package com.lacouf.rsbjwt;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.*;
import com.lacouf.rsbjwt.service.ContratPdfGenerator;
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
                        String bibPass = passwordEncoder != null ? passwordEncoder.encode("bib") : "bib";
                        String defaultPass = passwordEncoder != null ? passwordEncoder.encode("password") : "password";

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
                        Professeur profMartin = new Professeur("Martin", "Tremblay",
                                        new Credentials("professeur@test.com", defaultPass, Role.PROFESSEUR));
                        professeurRepository.save(profMartin);

                        Professeur profChantal = new Professeur("Chantal", "Gagnon",
                                        new Credentials("chantal@test.com", defaultPass, Role.PROFESSEUR));
                        professeurRepository.save(profChantal);

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
                        offreCgiDev.accepter();
                        cgi.ajouterOffre(offreCgiDev);

                        OffreStage offreCgiSecu = new OffreStage(
                                        "Analyste Cybersécurité Junior",
                                        "Participer aux audits de sécurité applicative et à la configuration des protocoles de chiffrement.",
                                        "CGI Inc.", "Techniques de l'informatique", "27$/h", "15 semaines",
                                        "Intérêt pour la sécurité web, OWASP et les tests d'intrusion.");
                        offreCgiSecu.setAnnee(anneeCourante);
                        offreCgiSecu.accepter();
                        cgi.ajouterOffre(offreCgiSecu);

                        // Offres CGI Inc. - Session historique (EQ2-105: Données historiques)
                        OffreStage offreCgiDevOpsHisto = new OffreStage(
                                        "Stagiaire DevOps & Cloud (Archive)",
                                        "Mise en place de pipelines CI/CD, automatisation et surveillance d'infrastructures Docker.",
                                        "CGI Inc.", "Techniques de l'informatique", "26$/h", "15 semaines",
                                        "Connaissance de Linux, Git et Docker.");
                        offreCgiDevOpsHisto.setAnnee(anneeHistorique);
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
                        offreGoogleFront.accepter();
                        google.ajouterOffre(offreGoogleFront);

                        OffreStage offreGoogleQa = new OffreStage(
                                        "Stagiaire Assurance Qualité QA",
                                        "Écriture de suites de tests end-to-end automatisés et validation de parcours utilisateurs.",
                                        "Google", "Techniques de l'informatique", "25$/h", "15 semaines",
                                        "Connaissance de tests d'intégration, JavaScript et rigueur méthodique.");
                        offreGoogleQa.setAnnee(anneeCourante);
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
                        Candidature candLucPlanif = new Candidature(luc, offreCgiDev);
                        candLucPlanif.setStatut(StatutCandidature.EN_ATTENTE);
                        candidatureRepository.save(candLucPlanif);

                        // EQ2-13 (Bonus Reconvocation) : Sophie Martin a refusé l'entrevue, bouton "Reconvoquer"
                        Candidature candSophieReconv = new Candidature(sophie, offreCgiSecu);
                        candSophieReconv.setStatut(StatutCandidature.EN_ATTENTE);
                        List<RendezVous> rvReconv = new ArrayList<>();
                        rvReconv.add(RendezVous.read("Bureau CGI Inc. - Salle 101",
                                        LocalDateTime.now().plusDays(2).withHour(9).withMinute(0).toInstant(ZoneOffset.UTC)));
                        Convocation convRefusee = new Convocation(rvReconv, "Entrevue cybersécurité");
                        candSophieReconv.addConvocation(convRefusee);
                        convRefusee.refuser("Pas disponible le matin, préférez l'après-midi svp.");
                        candidatureRepository.save(candSophieReconv);
                        convocationRepository.save(convRefusee);

                        // -------------------------------------------------------------------------
                        // EQ2-15 : En tant qu'employeur, j'embauche un ou plusieurs étudiants
                        // Employeur : employeur@test.com (CGI Inc.) -> Offre "Analyste Cybersécurité Junior"
                        // Candidat : Hatim Fakhour (ACCEPTEE, bouton "Embaucher" disponible sous l'onglet Entrevues)
                        // -------------------------------------------------------------------------
                        Candidature candHatimEmbauche = new Candidature(hatim, offreCgiSecu);
                        candHatimEmbauche.setStatut(StatutCandidature.ACCEPTEE);
                        List<RendezVous> rvHatim = new ArrayList<>();
                        RendezVous rvh1 = RendezVous.read("En ligne - Zoom Sécurité",
                                        LocalDateTime.now().plusDays(3).withHour(14).withMinute(0).toInstant(ZoneOffset.UTC));
                        rvHatim.add(rvh1);
                        Convocation convHatim = new Convocation(rvHatim, "Entrevue avec le directeur technique.");
                        candHatimEmbauche.addConvocation(convHatim);
                        convHatim.accepter(rvh1, null);
                        candidatureRepository.save(candHatimEmbauche);
                        convocationRepository.save(convHatim);

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

                        // -------------------------------------------------------------------------
                        // EQ2-17 : En tant que gestionnaire, je fais un contrat
                        // Gestionnaire : gestionnaire@test.com -> "Créer un contrat"
                        // Candidat : Emma Roy chez CGI Inc. (EMBAUCHEE, pas encore de contrat)
                        // -------------------------------------------------------------------------
                        Candidature candEmmaAContracter = new Candidature(emma, offreCgiDev);
                        candEmmaAContracter.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candEmmaAContracter);

                        // -------------------------------------------------------------------------
                        // EQ2-18 : En tant qu'étudiant, je signe le contrat
                        // Étudiant : hatim@test.com (Hatim Fakhour) -> "Mes contrats" -> "À signer"
                        // Contrat créé chez Google, statut EN_ATTENTE_SIGNATURE
                        // -------------------------------------------------------------------------
                        Candidature candHatimGoogle = new Candidature(hatim, offreGoogleFront);
                        candHatimGoogle.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candHatimGoogle);

                        CreationContratRequest reqHatimGoogle = new CreationContratRequest(
                                        candHatimGoogle.getId(),
                                        LocalDate.of(2026, 5, 11),
                                        LocalDate.of(2026, 8, 28),
                                        "Du lundi au vendredi, 9h à 17h (35h/semaine)",
                                        "28.00$/h",
                                        "Développement de composants UI React modernes et intégration aux APIs REST.",
                                        "Télétravail hybride (2 jours au bureau). Équipement MacBook Pro fourni.");
                        byte[] pdfHatim = ContratPdfGenerator.generer(candHatimGoogle, reqHatimGoogle, "John Gestion");
                        Contrat contratHatimASigner = new Contrat(
                                        candHatimGoogle, pdfHatim,
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
                        candSophieCgi.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candSophieCgi);

                        CreationContratRequest reqSophie = new CreationContratRequest(
                                        candSophieCgi.getId(),
                                        LocalDate.of(2026, 5, 18),
                                        LocalDate.of(2026, 8, 21),
                                        "Du lundi au vendredi, 8h30 à 16h30 (35h/semaine)",
                                        "24.00$/h",
                                        "Développement full-stack de microservices Spring Boot et interfaces utilisateur.",
                                        "Formule hybride, assurances collectives incluses.");
                        byte[] pdfSophie = ContratPdfGenerator.generer(candSophieCgi, reqSophie, "John Gestion");
                        Contrat contratSophieEmployeurASigner = new Contrat(
                                        candSophieCgi, pdfSophie,
                                        reqSophie.dateDebut(), reqSophie.dateFin(),
                                        reqSophie.horaire(), reqSophie.salaire(),
                                        reqSophie.descriptionTaches(), reqSophie.conditions());
                        // Sophie a signé
                        contratSophieEmployeurASigner.signer(new Signature<>(sophie, "signature_sophie".getBytes()));
                        contratSophieEmployeurASigner.setData(ContratPdfGenerator.mettreAJour(contratSophieEmployeurASigner, "John Gestion"));
                        contratRepository.save(contratSophieEmployeurASigner);

                        // -------------------------------------------------------------------------
                        // EQ2-20 : En tant que gestionnaire, je signe le contrat + imprime
                        // Gestionnaire : gestionnaire@test.com -> "Contrats existants"
                        // 1) Contrat prêt à signer par le gestionnaire (étudiant et employeur ont signé -> SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR)
                        // 2) Contrat déjà complété (COMPLETE) avec bouton "Imprimer" disponible immédiatement
                        // -------------------------------------------------------------------------
                        Candidature candLucGoogle = new Candidature(luc, offreGoogleQa);
                        candLucGoogle.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candLucGoogle);

                        CreationContratRequest reqLuc = new CreationContratRequest(
                                        candLucGoogle.getId(),
                                        LocalDate.of(2026, 5, 25),
                                        LocalDate.of(2026, 8, 28),
                                        "Du lundi au vendredi, 9h à 17h (35h/semaine)",
                                        "25.00$/h",
                                        "Automatisation de tests E2E avec Playwright et validation continue des livrables.",
                                        "Télétravail complet avec réunions d'équipe hebdomadaires.");
                        byte[] pdfLuc = ContratPdfGenerator.generer(candLucGoogle, reqLuc, "John Gestion");
                        Contrat contratPretGestionnaire = new Contrat(
                                        candLucGoogle, pdfLuc,
                                        reqLuc.dateDebut(), reqLuc.dateFin(),
                                        reqLuc.horaire(), reqLuc.salaire(),
                                        reqLuc.descriptionTaches(), reqLuc.conditions());
                        // Étudiant + Employeur ont signé
                        contratPretGestionnaire.signer(new Signature<>(luc, "signature_luc".getBytes()));
                        contratPretGestionnaire.signer(new Signature<>(google, "signature_google".getBytes()));
                        contratPretGestionnaire.setData(ContratPdfGenerator.mettreAJour(contratPretGestionnaire, "John Gestion"));
                        contratRepository.save(contratPretGestionnaire);

                        // Contrat complété à 100% (pour démonstration immédiate d'impression / téléchargement)
                        Candidature candEmmaComplete = new Candidature(emma, offreGoogleQa);
                        candEmmaComplete.setStatut(StatutCandidature.EMBAUCHEE);
                        candidatureRepository.save(candEmmaComplete);

                        CreationContratRequest reqEmmaComp = new CreationContratRequest(
                                        candEmmaComplete.getId(),
                                        LocalDate.of(2026, 5, 11),
                                        LocalDate.of(2026, 8, 21),
                                        "35h/semaine", "25.00$/h",
                                        "Assurance qualité logicielle",
                                        "Matériel fourni");
                        byte[] pdfEmmaComp = ContratPdfGenerator.generer(candEmmaComplete, reqEmmaComp, "John Gestion");
                        Contrat contratCompleteImprime = new Contrat(
                                        candEmmaComplete, pdfEmmaComp,
                                        reqEmmaComp.dateDebut(), reqEmmaComp.dateFin(),
                                        reqEmmaComp.horaire(), reqEmmaComp.salaire(),
                                        reqEmmaComp.descriptionTaches(), reqEmmaComp.conditions());
                        contratCompleteImprime.signer(new Signature<>(emma, "sig_emma".getBytes()));
                        contratCompleteImprime.signer(new Signature<>(google, "sig_google".getBytes()));
                        contratCompleteImprime.signer(new Signature<>(john, "sig_john".getBytes()));
                        contratCompleteImprime.setData(ContratPdfGenerator.mettreAJour(contratCompleteImprime, "John Gestion"));
                        contratRepository.save(contratCompleteImprime);

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
                        byte[] pdfHisto = ContratPdfGenerator.generer(candHisto, reqHisto, "John Gestion");
                        Contrat contratHisto = new Contrat(
                                        candHisto, pdfHisto,
                                        reqHisto.dateDebut(), reqHisto.dateFin(),
                                        reqHisto.horaire(), reqHisto.salaire(),
                                        reqHisto.descriptionTaches(), reqHisto.conditions());
                        contratHisto.signer(new Signature<>(hatim, "sig_hatim_histo".getBytes()));
                        contratHisto.signer(new Signature<>(cgi, "sig_cgi_histo".getBytes()));
                        contratHisto.signer(new Signature<>(john, "sig_john_histo".getBytes()));
                        contratHisto.setData(ContratPdfGenerator.mettreAJour(contratHisto, "John Gestion"));
                        contratRepository.save(contratHisto);

                        System.out.println("=== INITIALISATION DES DONNÉES DE DÉMONSTRATION COMPLÉTÉE AVEC SUCCÈS ===");
                } catch (Exception e) {
                        e.printStackTrace();
                }
        }
}
