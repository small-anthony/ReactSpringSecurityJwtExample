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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ConvocationService {

    private final ConvocationRepository convocationRepository;
    private final CandidatureRepository candidatureRepository;


    public ConvocationService(ConvocationRepository convocationRepository,
                              CandidatureRepository candidatureRepository) {
        this.convocationRepository = convocationRepository;
        this.candidatureRepository = candidatureRepository;

    }

    @Transactional()
    public void verifierEtMettreAJourStatutsPasses(Instant timestamp) {
        convocationRepository.expireConvocations(
                timestamp,
                StatutConvocation.ANNULEE,
                StatutConvocation.EN_ATTENTE);
    }

    public List<ConvocationDto> getConvocationsEtudiant(String etudiantEmail) {
        return ConvocationDto.create(convocationRepository.findByEtudiantEmail(etudiantEmail));
    }

    public List<ConvocationDto> getConvocationsAccepteesEtudiant(String etudiantEmail) {
        return ConvocationDto.create(convocationRepository.findByEtudiantEmail(etudiantEmail));
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

        validerRendezVous(rendezVousPossibles);
        Convocation convocation = new Convocation(RendezVous.create(rendezVousPossibles), messageEmployeur);
        candidature.addConvocation(convocation);

        StatutCandidature ancienStatut = candidature.getStatut();
        candidature.setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
        convocation = convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional(rollbackFor = Exception.class)
    public ConvocationDto accepterConvocation(String actorEmail, Long convocationId, RendezVousDto rendezVousSelection) throws Exception {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new Exception("Convocation non trouvée"));
        if (!convocation.estDestineAEtudiant(actorEmail)) {
            throw new AuthenticationException("Non autorise");
        }

        if (convocation.estResolu()) {
            throw new Exception("La convocation est deja resolue");
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
        if (!convocation.getEtudiant().getEmail().equals(actorEmail)) {
            throw new Exception("Non autorise");
        }
        if (convocation.estResolu()) {
            throw new Exception("La convocation est deja resolue");
		}
        if (!convocation.estDestineAEtudiant(actorEmail)) {
            throw new AuthenticationException("Non autorise");
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