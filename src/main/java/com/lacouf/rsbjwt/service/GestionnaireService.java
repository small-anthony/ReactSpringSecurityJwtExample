package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.CvRepository;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GestionnaireService {
    private final CandidatureRepository candidatureRepository;
    private final CvRepository cvRepository;
    private final OffreStageRepository offreStageRepository;
    private final EtudiantRepository etudiantRepository;

    public GestionnaireService(CvRepository cvRepository, OffreStageRepository offreStageRepository, EtudiantRepository etudiantRepository, CandidatureRepository candidatureRepository) {
        this.cvRepository = cvRepository;
        this.offreStageRepository = offreStageRepository;
        this.etudiantRepository = etudiantRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public CvDto accepterCv(Long cvId) throws Exception {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new Exception("CV non trouvé"));

        if (cv.getStatusAcceptation() != StatusAcceptation.EN_ATTENTE) {
            throw new Exception("Ce CV a deja ete traite.");
        }
        cv.accepterApprobation();
        return CvDto.create(cvRepository.save(cv));
    }

    public CvDto refuserCv(Long cvId, String message) throws Exception {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new Exception("CV non trouvé"));

        if (cv.getStatusAcceptation() != StatusAcceptation.EN_ATTENTE) {
            throw new Exception("Ce CV a deja ete traite.");
        }
        cv.refuserApprobation(message);
        return CvDto.create(cvRepository.save(cv));
    }

    public List<CvDto> getCvEnAttente() {
        return cvRepository.findByApprobationStatus(StatusAcceptation.EN_ATTENTE)
                .stream()
                .map(CvDto::create)
                .toList();
    }

    public byte[] getCvPdf(Long cvId) throws Exception {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new Exception("CV non trouvé"));
        return cv.getData();
    }

    public OffreStageDto accepterOffreStage(Long offreStageId, List<Long> etudiantsIds) throws Exception {
        OffreStage offre = offreStageRepository.findById(offreStageId)
                .orElseThrow(() -> new Exception("Offre de stage non trouvée"));

        if (!offre.isEnAttente()) {
            throw new Exception("Cette offre a déjà été traitée.");
        }
        offre.accepter();

        if (etudiantsIds != null && !etudiantsIds.isEmpty()) {
            offre.attribuerVisibilite(etudiantRepository.findAllById(etudiantsIds));
        } else {
            offre.attribuerVisibilite(null);
        }

        return OffreStageDto.create(offreStageRepository.save(offre));
    }

    public OffreStageDto refuserOffreStage(Long offreStageId, String commentaire) throws Exception {
        OffreStage offre = offreStageRepository.findById(offreStageId)
                .orElseThrow(() -> new Exception("Offre de stage non trouvée"));

        if (!offre.isEnAttente()) {
            throw new Exception("Cette offre a deja ete traitee.");
        }
        offre.refuser(commentaire);

        return OffreStageDto.create(offreStageRepository.save(offre));
    }

    public List<OffreStageDto> getOffresEnAttente() {
        return getOffresEnAttente(null);
    }

    public List<OffreStageDto> getOffresEnAttente(Integer annee) {
        List<OffreStage> offres = (annee != null)
                ? offreStageRepository.findByApprobationStatusAndAnnee(StatusAcceptation.EN_ATTENTE, annee)
                : offreStageRepository.findByApprobationStatusAndDateSuppressionIsNull(StatusAcceptation.EN_ATTENTE);
        return offres.stream()
                .filter(offre -> !offre.isSupprime())
                .map(OffreStageDto::create)
                .collect(Collectors.toList());
    }

    public List<OffreStageDto> getToutesOffres(Integer annee) {
        List<OffreStage> offres = (annee != null)
                ? offreStageRepository.findAllByAnnee(annee)
                : offreStageRepository.findAll();
        return offres.stream()
                .map(OffreStageDto::create)
                .collect(Collectors.toList());
    }

    public List<Integer> getAnneesDisponibles() {
        Set<Integer> annees = new TreeSet<>(Collections.reverseOrder());
        annees.add(AcademicSessionUtils.getAnneeActuelle());
        annees.addAll(offreStageRepository.findDistinctAnnees());
        return new ArrayList<>(annees);
    }

    public List<RapportEtudiantDto> getTousLesEtudiants() {
        return etudiantRepository.findAll()
                .stream()
                .map(RapportEtudiantDto::create)
                .toList();
    }

    public List<RapportEtudiantDto> getEtudiantsSansConvocation() {
        return getEtudiantsSansConvocation(AcademicSessionUtils.getAnneeActuelle());
    }

    public List<RapportEtudiantDto> getEtudiantsSansConvocation(Integer annee) {
        if (annee == null) {
            return etudiantRepository.findEtudiantsSansConvocation()
                    .stream()
                    .map(RapportEtudiantDto::create)
                    .toList();
        }

        return etudiantRepository.findEtudiantsSansConvocation(annee)
                .stream()
                .map(e -> RapportEtudiantDto.createFilteredByAnnee(e, annee))
                .toList();
    }

    public List<RapportEtudiantDto> getEtudiantsEnAttenteEntrevue() {
        return getEtudiantsEnAttenteEntrevue(AcademicSessionUtils.getAnneeActuelle());
    }

    public List<RapportEtudiantDto> getEtudiantsEnAttenteEntrevue(Integer annee) {
        if (annee == null) {
            return etudiantRepository.findEtudiantsEnAttenteEntrevue()
                    .stream()
                    .map(RapportEtudiantDto::create)
                    .toList();
        }

        return etudiantRepository.findEtudiantsEnAttenteEntrevue(annee)
                .stream()
                .map(e -> RapportEtudiantDto.createFilteredByAnnee(e, annee))
                .toList();
    }

    public List<RapportEtudiantDto> getEtudiantsEnAttenteReponse() {
        return getEtudiantsEnAttenteReponse(AcademicSessionUtils.getAnneeActuelle());
    }

    public List<RapportEtudiantDto> getEtudiantsEnAttenteReponse(Integer annee) {
        if (annee == null) {
            return etudiantRepository.findEtudiantsEnAttenteReponse()
                    .stream()
                    .map(RapportEtudiantDto::create)
                    .toList();
        }

        return etudiantRepository.findEtudiantsEnAttenteReponse(annee)
                .stream()
                .map(e -> RapportEtudiantDto.createFilteredByAnnee(e, annee))
                .toList();
    }

    public List<RapportEtudiantDto> getEtudiantsTrouveStage() {
        return getEtudiantsTrouveStage(AcademicSessionUtils.getAnneeActuelle());
    }

    public List<RapportEtudiantDto> getEtudiantsTrouveStage(Integer annee) {
        if (annee == null) {
            return etudiantRepository.findEtudiantsTrouveStage()
                    .stream()
                    .map(RapportEtudiantDto::create)
                    .toList();
        }

        return etudiantRepository.findEtudiantsTrouveStage(annee)
                .stream()
                .map(e -> RapportEtudiantDto.createFilteredByAnnee(e, annee))
                .toList();
    }
}
