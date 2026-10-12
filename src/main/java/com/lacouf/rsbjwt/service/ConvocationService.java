package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConvocationService {

    private final ConvocationRepository convocationRepository;
    private final CandidatureRepository candidatureRepository;
    private final NotificationService notificationService;

    public ConvocationService(ConvocationRepository convocationRepository,
            CandidatureRepository candidatureRepository,
            NotificationService notificationService) {
        this.convocationRepository = convocationRepository;
        this.candidatureRepository = candidatureRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void verifierEtMettreAJourStatutsPasses() {
        LocalDateTime maintenant = LocalDateTime.now();
        List<StatutConvocation> statutsAVerifier = Arrays.asList(
                StatutConvocation.EN_ATTENTE,
                StatutConvocation.ACCEPTEE,
                StatutConvocation.CONFLIT_HORAIRE);

        List<Convocation> convocationPassees = convocationRepository.findByStatutInAndDateHeureBefore(statutsAVerifier,
                maintenant);
        for (Convocation c : convocationPassees) {
            c.marquerEnAttenteReponse();
            if (c.getCandidature() != null) {
                c.getCandidature().setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
            }
            convocationRepository.save(c);
        }
    }

    @Scheduled(cron = "0 */5 * * * *")
    public void schedulerVerifierStatutsPasses() {
        verifierEtMettreAJourStatutsPasses();
    }

    @Transactional
    public List<ConvocationDto> getConvocationsEtudiant(String etudiantEmail) {
        verifierEtMettreAJourStatutsPasses();
        return convocationRepository.findByEtudiantEmail(etudiantEmail)
                .stream()
                .map(ConvocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConvocationDto> getConvocationsAccepteesEtudiant(String etudiantEmail) {
        return convocationRepository.findByEtudiantEmail(etudiantEmail)
                .stream()
                .filter(c -> c.getStatut() == StatutConvocation.ACCEPTEE)
                .map(ConvocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ConvocationDto> getConvocationsEmployeur(String employeurEmail) {
        verifierEtMettreAJourStatutsPasses();
        return convocationRepository.findByEmployeurEmail(employeurEmail)
                .stream()
                .map(ConvocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ConvocationDto> getToutesConvocations() {
        verifierEtMettreAJourStatutsPasses();
        return convocationRepository.findAllOrderByDateHeureAsc()
                .stream()
                .map(ConvocationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConvocationDto accepterConvocation(Long convocationId, String etudiantEmail) {
        Convocation convocation = convocationRepository.findByIdAndEtudiantEmail(convocationId, etudiantEmail)
                .orElseThrow(() -> new IllegalArgumentException("Convocation non trouvée ou accès non autorisé"));

        if (convocation.estPassee()) {
            convocation.marquerEnAttenteReponse();
            if (convocation.getCandidature() != null) {
                convocation.getCandidature().setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
            }
            convocationRepository.save(convocation);
            throw new IllegalStateException("La date de l'entrevue est déjà passée. Le statut a été mis à jour.");
        }

        convocation.accepter();
        convocationRepository.save(convocation);

        Candidature candidature = convocation.getCandidature();
        Etudiant etudiant = candidature != null ? candidature.getEtudiant() : null;
        OffreStage offre = candidature != null ? candidature.getOffreStage() : null;
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dateFormatee = convocation.getDateHeure() != null ? convocation.getDateHeure().format(formatter) : "";

        if (employeur != null && etudiant != null) {
            notificationService.creerNotification(
                    employeur,
                    "Convocation acceptée",
                    "L'étudiant " + etudiant.getFirstName() + " " + etudiant.getLastName() +
                            " a accepté l'entrevue pour le poste '" + (offre != null ? offre.getTitre() : "")
                            + "' prévue le " + dateFormatee + ".",
                    "CONVOCATION_ACCEPTEE",
                    convocation.getId());
        }

        if (etudiant != null) {
            notificationService.creerNotification(
                    etudiant,
                    "Entrevue confirmée",
                    "Votre entrevue pour le poste '" + (offre != null ? offre.getTitre() : "") +
                            "' a été confirmée pour le " + dateFormatee + " et inscrite à votre profil.",
                    "CONVOCATION_CONFIRMEE",
                    convocation.getId());
        }

        return ConvocationDto.fromEntity(convocation);
    }

    @Transactional
    public ConvocationDto refuserConvocation(Long convocationId, String etudiantEmail, String motif) {
        Convocation convocation = convocationRepository.findByIdAndEtudiantEmail(convocationId, etudiantEmail)
                .orElseThrow(() -> new IllegalArgumentException("Convocation non trouvée ou accès non autorisé"));

        convocation.refuser(motif);
        if (convocation.getCandidature() != null) {
            convocation.getCandidature().setStatut(StatutCandidature.REFUSEE);
        }
        convocationRepository.save(convocation);

        Candidature candidature = convocation.getCandidature();
        Etudiant etudiant = candidature != null ? candidature.getEtudiant() : null;
        OffreStage offre = candidature != null ? candidature.getOffreStage() : null;
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        if (employeur != null && etudiant != null) {
            String detailsMotif = (motif != null && !motif.trim().isEmpty()) ? " Motif : " + motif.trim() : "";
            notificationService.creerNotification(
                    employeur,
                    "Convocation refusée",
                    "L'étudiant " + etudiant.getFirstName() + " " + etudiant.getLastName() +
                            " a refusé l'entrevue pour le poste '" + (offre != null ? offre.getTitre() : "") + "'."
                            + detailsMotif,
                    "CONVOCATION_REFUSEE",
                    convocation.getId());
        }

        return ConvocationDto.fromEntity(convocation);
    }

    @Transactional
    public ConvocationDto proposerAutreDate(Long convocationId, String etudiantEmail, LocalDateTime nouvelleDate,
            String motif) {
        if (nouvelleDate == null || nouvelleDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La date proposée doit être ultérieure à la date actuelle");
        }

        Convocation convocation = convocationRepository.findByIdAndEtudiantEmail(convocationId, etudiantEmail)
                .orElseThrow(() -> new IllegalArgumentException("Convocation non trouvée ou accès non autorisé"));

        convocation.proposerAutreDate(nouvelleDate, motif);
        convocationRepository.save(convocation);

        Candidature candidature = convocation.getCandidature();
        Etudiant etudiant = candidature != null ? candidature.getEtudiant() : null;
        OffreStage offre = candidature != null ? candidature.getOffreStage() : null;
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dateFormatee = nouvelleDate.format(formatter);

        if (employeur != null && etudiant != null) {
            String detailsMotif = (motif != null && !motif.trim().isEmpty()) ? " Motif : " + motif.trim() : "";
            notificationService.creerNotification(
                    employeur,
                    "Conflit d'horaire - Nouvelle date proposée",
                    "L'étudiant " + etudiant.getFirstName() + " " + etudiant.getLastName() +
                            " a un conflit d'horaire pour le poste '" + (offre != null ? offre.getTitre() : "") +
                            "' et propose une nouvelle date le " + dateFormatee + "." + detailsMotif,
                    "CONVOCATION_CONFLIT",
                    convocation.getId());
        }

        return ConvocationDto.fromEntity(convocation);
    }

    @Transactional
    public ConvocationDto creerConvocation(Long candidatureId, LocalDateTime dateHeure, String lieu,
            String messageEmployeur, String employeurEmail) {
        if (dateHeure == null) {
            throw new IllegalArgumentException("La date et heure de l'entrevue sont obligatoires");
        }
        if (lieu == null || lieu.trim().isEmpty()) {
            throw new IllegalArgumentException("Le lieu de l'entrevue est obligatoire");
        }

        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));

        if (employeurEmail != null && candidature.getOffreStage() != null
                && candidature.getOffreStage().getEmployeur() != null) {
            if (!candidature.getOffreStage().getEmployeur().getEmail().equalsIgnoreCase(employeurEmail)) {
                throw new SecurityException("Vous n'êtes pas autorisé à convoquer ce candidat");
            }
        }

        Convocation convocation = new Convocation(candidature, dateHeure, lieu, messageEmployeur);
        convocation = convocationRepository.save(convocation);

        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dateFormatee = dateHeure.format(formatter);

        if (etudiant != null) {
            notificationService.creerNotification(
                    etudiant,
                    "Nouvelle convocation d'entrevue",
                    "Vous avez reçu une convocation d'entrevue de "
                            + (offre != null ? offre.getNomEntreprise() : "l'employeur") +
                            " pour le poste '" + (offre != null ? offre.getTitre() : "") + "' le " + dateFormatee + " ("
                            + lieu + ").",
                    "CONVOCATION_NOUVELLE",
                    convocation.getId());
        }

        return ConvocationDto.fromEntity(convocation);
    }
}
