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

    public ConvocationService(ConvocationRepository convocationRepository,
            CandidatureRepository candidatureRepository) {
        this.convocationRepository = convocationRepository;
        this.candidatureRepository = candidatureRepository;
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

        return ConvocationDto.fromEntity(convocation);
    }
}
