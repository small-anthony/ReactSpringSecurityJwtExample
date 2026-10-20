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
                StatutConvocation.EN_ATTENTE
        );
    }

    @Transactional(readOnly = true)
    public List<ConvocationDto> getConvocationsEtudiant(String etudiantEmail) {
        return ConvocationDto.create(convocationRepository.findByEtudiantEmail(etudiantEmail));
    }

    @Transactional(readOnly = true)
    public List<ConvocationDto> getConvocationsAccepteesEtudiant(String etudiantEmail) {
        return ConvocationDto.create(convocationRepository.findByEtudiantEmail(etudiantEmail));
    }

    @Transactional(readOnly = true)
    public List<ConvocationDto> getConvocationsEmployeur(String employeurEmail) {
        return ConvocationDto.create(convocationRepository.findByEmployeurEmail(employeurEmail));
    }

    @Transactional(readOnly = true)
    public List<ConvocationDto> getToutesConvocations() {
        return ConvocationDto.create(convocationRepository.findAll());
    }

    @Transactional
    public ConvocationDto creerConvocation(String actorEmail, Long candidatureId,
                                           List<RendezVousDto> rendezVousPossibles,
                                           String messageEmployeur) {


        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));


        if(!candidature.getEmployeur().getEmail().equalsIgnoreCase(actorEmail)) {
            throw new AuthenticationException("Vous n'êtes pas autorisé à convoquer ce candidat");
        }

        if (candidature.getStatut() != StatutCandidature.ACCEPTEE
                && candidature.getStatut() != StatutCandidature.EN_ATTENTE_REPONSE) {
            throw new IllegalStateException("La candidature doit être acceptée avant de convoquer le candidat");
        }

        boolean convocationEnCours = candidature.getConvocations().stream()
                .anyMatch(c -> c.getStatut() == StatutConvocation.EN_ATTENTE
                        || c.getStatut() == StatutConvocation.ACCEPTEE);



        Convocation convocation = new Convocation(RendezVous.create(rendezVousPossibles), messageEmployeur);
        candidature.addConvocation(convocation);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_REPONSE);
        convocation = convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional
    public ConvocationDto accepterConvocation(String actorEmail, Long convocationId, RendezVousDto rendezVousSelection) {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new IllegalArgumentException("Convocation non trouvée"));
        if(!convocation.getEtudiant().getEmail().equalsIgnoreCase(actorEmail)) {
            throw new AuthenticationException("No auth");
        }

        RendezVous rendezVous = RendezVous.read(rendezVousSelection);
        convocation.accepter(rendezVous, null);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional
    public ConvocationDto refuserConvocation(String actorEmail, Long convocationId, String motif) {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new IllegalArgumentException("Convocation non trouvée"));
        if(!convocation.getEtudiant().getEmail().equals(actorEmail)) {
            throw new AuthenticationException("No auth");
        }

        convocation.refuser(motif);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }
}