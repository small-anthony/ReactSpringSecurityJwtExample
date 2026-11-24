package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.service.dto.ConvocationDto;
import com.lacouf.rsbjwt.service.dto.RendezVousDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

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

    @Transactional()
    public void verifierEtMettreAJourStatutsPasses(Instant timestamp) {
        convocationRepository.expireConvocations(
                timestamp,
                StatutConvocation.ANNULEE,
                StatutConvocation.EN_ATTENTE);
    }

    public List<ConvocationDto> getConvocationsEtudiant(String etudiantEmail) {
        return ConvocationDto.create(filtrerParSessionActuelle(convocationRepository.findByEtudiantEmail(etudiantEmail)));
    }

    public List<ConvocationDto> getConvocationsAccepteesEtudiant(String etudiantEmail) {
        return ConvocationDto.create(filtrerParSessionActuelle(convocationRepository.findByEtudiantEmail(etudiantEmail)));
    }

    private List<Convocation> filtrerParSessionActuelle(List<Convocation> convocations) {
        if (convocations == null) {
            return List.of();
        }
        int anneeActuelle = AcademicSessionUtils.getAnneeActuelle();
        return convocations.stream()
                .filter(c -> c.getCandidature() == null
                        || c.getCandidature().getOffreStage() == null
                        || c.getCandidature().getOffreStage().getAnnee() >= anneeActuelle)
                .toList();
    }

    public List<ConvocationDto> getConvocationsEmployeur(String employeurEmail) {
        return getConvocationsEmployeur(employeurEmail, null);
    }

    public List<ConvocationDto> getConvocationsEmployeur(String employeurEmail, Integer annee) {
        var historique = convocationRepository.findByEmployeurEmail(employeurEmail).stream();
        if (annee != null) {
            historique = historique.filter(c -> c.getCandidature() != null
                    && c.getCandidature().getOffreStage() != null
                    && c.getCandidature().getOffreStage().getAnnee() == annee);
        }
        return ConvocationDto.create(historique.toList());
    }

    public List<ConvocationDto> getToutesConvocations() {
        return getToutesConvocations(null);
    }

    public List<ConvocationDto> getToutesConvocations(Integer annee) {
        var historique = convocationRepository.findAll().stream();
        if (annee != null) {
            historique = historique.filter(c -> c.getCandidature() != null
                    && c.getCandidature().getOffreStage() != null
                    && c.getCandidature().getOffreStage().getAnnee() == annee);
        }
        return ConvocationDto.create(historique.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public ConvocationDto creerConvocation(String actorEmail, Long candidatureId,
                                           List<RendezVousDto> rendezVousPossibles,
                                           String messageEmployeur) throws Exception {

        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new Exception("Candidature non trouvée"));

        if (!candidature.appartientAEmployeur(actorEmail)) {
            throw new AuthenticationException("Vous n'êtes pas autorisé à convoquer ce candidat");
        }

        if (candidature.getOffreStage() != null
                && candidature.getOffreStage().getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible de convoquer un candidat sur une ancienne session.");
        }

        if (candidature.getStatut() != StatutCandidature.EN_ATTENTE_CONVOCATION
                && candidature.getStatut() != StatutCandidature.ENTREVUE_REFUSEE) {
            throw new Exception("Impossible de convoquer ce candidat dans son état actuel.");
        }

        validerRendezVous(rendezVousPossibles);
        Convocation convocation = new Convocation(RendezVous.create(rendezVousPossibles), messageEmployeur);
        candidature.addConvocation(convocation);

        StatutCandidature ancienStatut = candidature.getStatut();
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE);
        convocation = convocationRepository.save(convocation);
        notificationService.pushNotification(Notification.convocationRecue(), convocation.getEtudiantId());

        return ConvocationDto.create(convocation);
    }

    @Transactional(rollbackFor = Exception.class)
    public ConvocationDto accepterConvocation(String actorEmail, Long convocationId, RendezVousDto rendezVousSelection) throws Exception {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new Exception("Convocation non trouvée"));
        if (!convocation.estDestineAEtudiant(actorEmail)) {
            throw new AuthenticationException("Non autorise");
        }

        if (convocation.getCandidature() != null
                && convocation.getCandidature().getOffreStage() != null
                && convocation.getCandidature().getOffreStage().getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible de répondre à une convocation d'une ancienne session.");
        }

        if (convocation.estResolu()) {
            throw new Exception("La convocation est deja resolue");
        }
        if (convocation.estPassee()) {
            throw new Exception("Le délai de réponse pour cette convocation est expiré.");
        }
        if (rendezVousSelection == null) {
            throw new Exception("Le rendez-vous selectionne n'est pas disponible");
        }
        RendezVous rendezVous = RendezVous.read(rendezVousSelection);
        if (convocation.getRendezVousPossibles() == null || !convocation.getRendezVousPossibles().contains(rendezVous)) {
            throw new Exception("Le rendez-vous selectionne n'est pas disponible");
        }
        convocation.accepter(rendezVous, null);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional(rollbackFor = Exception.class)
    public ConvocationDto refuserConvocation(String actorEmail, Long convocationId, String motif) throws Exception {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new Exception("Convocation non trouvée"));
        if (!convocation.estDestineAEtudiant(actorEmail)) {
            throw new AuthenticationException("Non autorise");
        }
        if (convocation.getCandidature() != null
                && convocation.getCandidature().getOffreStage() != null
                && convocation.getCandidature().getOffreStage().getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible de répondre à une convocation d'une ancienne session.");
        }
        if (convocation.estResolu()) {
            throw new Exception("La convocation est deja resolue");
        }
        if (convocation.estPassee()) {
            throw new Exception("Le délai de réponse pour cette convocation est expiré.");
        }

        convocation.refuser(motif);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    private void validerRendezVous(List<RendezVousDto> rendezVousPossibles) throws Exception {
        if (rendezVousPossibles == null || rendezVousPossibles.isEmpty()) {
            throw new Exception("La liste des rendez-vous doit contenir au moins un element");
        }
        for (RendezVousDto dto : rendezVousPossibles) {
            if (dto == null || dto.lieu() == null || dto.lieu().isBlank()) {
                throw new Exception("lieu doit être spécifie");
            }
            if (dto.date() == null || !dto.date().isAfter(Instant.now())) {
                throw new Exception("date doit être dans le futur");
            }
        }
    }
}