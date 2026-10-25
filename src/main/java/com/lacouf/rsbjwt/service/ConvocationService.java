package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.embeddable.RendezVous;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ConvocationRepository;
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

    @Transactional
    public void verifierEtMettreAJourStatutsPasses() {
        convocationRepository.expireConvocations(
                Instant.now(),
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

    @Transactional
    public ConvocationDto creerConvocation(String actorEmail, Long candidatureId,
            List<RendezVousDto> rendezVousPossibles,
            String messageEmployeur) throws Exception {

        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new Exception("Candidature non trouvée"));

        if (actorEmail != null && candidature.getOffreStage() != null
                && candidature.getOffreStage().getEmployeur() != null) {
            if (!candidature.getOffreStage().getEmployeur().getEmail().equalsIgnoreCase(actorEmail)) {
                throw new Exception("Vous n'êtes pas autorisé à convoquer ce candidat");
            }
        }

        Convocation convocation = new Convocation(RendezVous.create(rendezVousPossibles), messageEmployeur);
        convocation = convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional
    public ConvocationDto accepterConvocation(String actorEmail, Long convocationId,
            RendezVousDto rendezVousSelection) throws Exception {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new Exception("Convocation non trouvée"));
        if (!convocation.getEtudiant().getEmail().equals(actorEmail)) {
            throw new Exception("No auth");
        }

        RendezVous rendezVous = RendezVous.read(rendezVousSelection);
        convocation.accepter(rendezVous, null);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }

    @Transactional
    public ConvocationDto refuserConvocation(String actorEmail, Long convocationId, String motif) throws Exception {
        Convocation convocation = convocationRepository.findWithEmployeurAndEtudiantById(convocationId)
                .orElseThrow(() -> new Exception("Convocation non trouvée"));
        if (!convocation.getEtudiant().getEmail().equals(actorEmail)) {
            throw new Exception("No auth");
        }
        if (convocation.estResolu()) {
            throw new Exception("Convocation est immuable");
        }

        convocation.refuser(motif);
        convocationRepository.save(convocation);

        return ConvocationDto.create(convocation);
    }
}
