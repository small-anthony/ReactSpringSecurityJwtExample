package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.CvRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.*;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final ProfesseurRepository professeurRepository;

    @Autowired
    public GestionnaireService(CvRepository cvRepository,
                              OffreStageRepository offreStageRepository,
                              EtudiantRepository etudiantRepository,
                              CandidatureRepository candidatureRepository,
                              ProfesseurRepository professeurRepository) {
        this.cvRepository = cvRepository;
        this.offreStageRepository = offreStageRepository;
        this.etudiantRepository = etudiantRepository;
        this.candidatureRepository = candidatureRepository;
        this.professeurRepository = professeurRepository;
    }

    public GestionnaireService(CvRepository cvRepository,
                              OffreStageRepository offreStageRepository,
                              EtudiantRepository etudiantRepository,
                              CandidatureRepository candidatureRepository) {
        this(cvRepository, offreStageRepository, etudiantRepository, candidatureRepository, null);
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

    public List<EtudiantPourAssignationDto> getEtudiantsPourAssignation(Integer annee) {
        List<Etudiant> etudiants = (annee != null)
                ? etudiantRepository.findEtudiantsTrouveStage(annee)
                : etudiantRepository.findEtudiantsTrouveStage();

        return etudiants.stream()
                .map(EtudiantPourAssignationDto::create)
                .toList();
    }

    public List<ProfesseurPourAssignationDto> getProfesseursPourAssignation(String nom) {
        if (professeurRepository == null) return List.of();
        List<Professeur> professeurs = (nom != null && !nom.isBlank())
                ? professeurRepository.findByNom(nom.trim())
                : professeurRepository.findAll();

        return professeurs.stream()
                .map(p -> {
                    long count = etudiantRepository.countByProfesseurId(p.getId());
                    return ProfesseurPourAssignationDto.create(p, count);
                })
                .toList();
    }

    public List<ProfesseurPourAssignationDto> getProfesseursPourAssignation() {
        return getProfesseursPourAssignation(null);
    }

    public AssignationProfesseurResponseDto assignerProfesseur(Long etudiantId, Long professeurId, String professeurNom) throws Exception {
        if (etudiantId == null) {
            throw new Exception("L'identifiant de l'étudiant est obligatoire.");
        }
        if (professeurId == null && (professeurNom == null || professeurNom.isBlank())) {
            throw new Exception("L'identifiant ou le nom du professeur est obligatoire.");
        }

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new Exception("Étudiant non trouvé avec l'id : " + etudiantId));

        boolean aTrouveStage = etudiant.getCandidatures() != null && etudiant.getCandidatures().stream().anyMatch(c ->
                c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE
        );
        if (!aTrouveStage) {
            throw new Exception("L'étudiant n'a pas encore trouvé de stage. L'assignation d'un professeur n'est pas possible.");
        }

        Professeur professeur = null;
        if (professeurId != null) {
            professeur = (professeurRepository != null)
                    ? professeurRepository.findById(professeurId)
                        .orElseThrow(() -> new Exception("Professeur non trouvé avec l'id : " + professeurId))
                    : null;
        } else {
            List<Professeur> professeurs = (professeurRepository != null)
                    ? professeurRepository.findByNom(professeurNom.trim())
                    : List.of();
            if (professeurs.isEmpty()) {
                throw new Exception("Aucun professeur trouvé avec le nom : " + professeurNom);
            }
            professeur = professeurs.get(0);
        }

        if (professeur == null) {
            throw new Exception("Professeur non trouvé.");
        }

        long countActuel = etudiantRepository.countByProfesseurId(professeur.getId());
        boolean dejaAssigne = etudiant.getProfesseur() != null && etudiant.getProfesseur().getId().equals(professeur.getId());

        String avertissement = null;
        if (!dejaAssigne && countActuel >= ProfesseurPourAssignationDto.SEUIL_MAX_RECOMMANDE) {
            avertissement = "Attention : Le professeur " + professeur.getFirstName() + " " + professeur.getLastName() +
                    " a déjà " + countActuel + " étudiants assignés (seuil recommandé : " + ProfesseurPourAssignationDto.SEUIL_MAX_RECOMMANDE + ").";
        }

        boolean estModification = etudiant.getProfesseur() != null && !dejaAssigne;

        etudiant.setProfesseur(professeur);
        Etudiant etudiantSauvegarde = etudiantRepository.save(etudiant);

        String message = estModification
                ? "L'assignation du professeur a été modifiée avec succès."
                : "Le professeur a été assigné avec succès à l'étudiant.";

        return AssignationProfesseurResponseDto.succes(
                EtudiantPourAssignationDto.create(etudiantSauvegarde),
                ProfesseurDto.create(professeur),
                message,
                avertissement
        );
    }

    public AssignationProfesseurResponseDto assignerProfesseur(Long etudiantId, Long professeurId) throws Exception {
        return assignerProfesseur(etudiantId, professeurId, null);
    }

    public EtudiantPourAssignationDto desassignerProfesseur(Long etudiantId) throws Exception {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new Exception("Étudiant non trouvé avec l'id : " + etudiantId));

        etudiant.setProfesseur(null);
        return EtudiantPourAssignationDto.create(etudiantRepository.save(etudiant));
    }
}
