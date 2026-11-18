package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationMilieuStageRequest;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.EvaluationMilieuStageRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.DossierStageProfesseurDto;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import com.lacouf.rsbjwt.service.dto.EvaluationMilieuStageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfesseurService {
    private final ProfesseurRepository professeurRepository;
    private final EtudiantRepository etudiantRepository;
    private final ContratRepository contratRepository;
    private final EvaluationMilieuStageRepository evaluationMilieuStageRepository;

    @Autowired
    public ProfesseurService(
            ProfesseurRepository professeurRepository,
            EtudiantRepository etudiantRepository,
            ContratRepository contratRepository,
            EvaluationMilieuStageRepository evaluationMilieuStageRepository
    ) {
        this.professeurRepository = professeurRepository;
        this.etudiantRepository = etudiantRepository;
        this.contratRepository = contratRepository;
        this.evaluationMilieuStageRepository = evaluationMilieuStageRepository;
    }

    public ProfesseurService(ProfesseurRepository professeurRepository, EtudiantRepository etudiantRepository) {
        this(professeurRepository, etudiantRepository, null, null);
    }

    private record AccesProfesseurEtudiant(Professeur professeur, Etudiant etudiant) {}

    @Transactional(readOnly = true)
    public List<EtudiantSuperviseDto> getEtudiantsAssignes(String professeurEmail, Integer annee) throws Exception {
        Professeur professeur = professeurRepository.findByEmail(professeurEmail)
                .orElseThrow(() -> new Exception("Professeur introuvable"));
        List<Etudiant> etudiants = etudiantRepository.findByProfesseurId(professeur.getId());
        return etudiants.stream().map(e -> toEtudiantSuperviseDto(e, annee)).toList();
    }

    @Transactional(readOnly = true)
    public EtudiantSuperviseDto getEtudiantDetail(Long etudiantId, String professeurEmail) throws Exception {
        Professeur professeur = professeurRepository.findByEmail(professeurEmail)
                .orElseThrow(() -> new Exception("Professeur introuvable"));
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new Exception("Étudiant introuvable"));
        if (etudiant.getProfesseur() == null || !etudiant.getProfesseur().getId().equals(professeur.getId())) {
            throw new Exception("Cet étudiant n'est pas assigné à ce professeur.");
        }
        return toEtudiantSuperviseDto(etudiant, null);
    }

    @Transactional(readOnly = true)
    public DossierStageProfesseurDto getDossierStagePourProfesseur(String professeurEmail, Long etudiantId) throws Exception {
        AccesProfesseurEtudiant acces = verifierProfesseurEtAccesEtudiant(professeurEmail, etudiantId);
        Candidature stage = exigerStageActif(acces.etudiant());
        return DossierStageProfesseurDto.create(
                acces.professeur(),
                acces.etudiant(),
                stage,
                trouverContrat(stage.getId()),
                trouverEvaluationMilieu(stage.getId())
        );
    }

    @Transactional(readOnly = true)
    public EvaluationMilieuStageDto getEvaluationMilieuPourProfesseur(String professeurEmail, Long etudiantId) throws Exception {
        AccesProfesseurEtudiant acces = verifierProfesseurEtAccesEtudiant(professeurEmail, etudiantId);
        Candidature stage = exigerStageActif(acces.etudiant());
        if (evaluationMilieuStageRepository == null) {
            throw new Exception("Aucune évaluation du milieu de stage n'a encore été soumise pour cet étudiant.");
        }
        EvaluationMilieuStage evaluation = evaluationMilieuStageRepository.findByCandidatureId(stage.getId())
                .orElseThrow(() -> new Exception("Aucune évaluation du milieu de stage n'a encore été soumise pour cet étudiant."));
        return EvaluationMilieuStageDto.create(evaluation);
    }

    @Transactional(rollbackFor = Exception.class)
    public EvaluationMilieuStageDto soumettreEvaluationMilieu(
            String professeurEmail,
            Long etudiantId,
            EvaluationMilieuStageRequest request
    ) throws Exception {
        AccesProfesseurEtudiant acces = verifierProfesseurEtAccesEtudiant(professeurEmail, etudiantId);
        Candidature stage = exigerStageActif(acces.etudiant());
        if (evaluationMilieuStageRepository.existsByCandidatureId(stage.getId())) {
            throw new Exception("Ce milieu de stage a déjà été évalué.");
        }
        EvaluationMilieuStageValidator.validerRequeteEvaluation(request);
        EvaluationMilieuStage entity = EvaluationMilieuStageValidator.construireEntite(
                stage, acces.etudiant(), acces.professeur(), request
        );
        EvaluationMilieuStage sauvegardee = evaluationMilieuStageRepository.save(entity);
        return EvaluationMilieuStageDto.create(sauvegardee);
    }

    private AccesProfesseurEtudiant verifierProfesseurEtAccesEtudiant(String professeurEmail, Long etudiantId) throws Exception {
        if (professeurEmail == null || professeurEmail.isBlank()) {
            throw new Exception("Accès refusé : utilisateur non authentifié.");
        }
        Professeur professeur = professeurRepository.findByEmail(professeurEmail)
                .orElseThrow(() -> new Exception("Accès refusé : professeur introuvable."));
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new Exception("Étudiant introuvable."));
        if (etudiant.getProfesseur() == null || !etudiant.getProfesseur().getId().equals(professeur.getId())) {
            throw new Exception("Accès refusé : cet étudiant ne vous est pas assigné.");
        }
        return new AccesProfesseurEtudiant(professeur, etudiant);
    }

    private Candidature exigerStageActif(Etudiant etudiant) throws Exception {
        Candidature stage = trouverStageActif(etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of());
        if (stage == null) {
            throw new Exception("Cet étudiant n'a pas de stage actif.");
        }
        return stage;
    }

    private Candidature trouverStageActif(List<Candidature> candidatures) {
        return candidatures.stream()
                .filter(c -> c.getStatut() == StatutCandidature.EMBAUCHEE)
                .findFirst()
                .orElseGet(() -> candidatures.stream()
                        .filter(c -> c.getStatut() == StatutCandidature.ACCEPTEE)
                        .findFirst()
                        .orElse(null));
    }

    private Contrat trouverContrat(Long candidatureId) {
        return (contratRepository == null || candidatureId == null)
                ? null
                : contratRepository.findByCandidatureId(candidatureId).orElse(null);
    }

    private EvaluationMilieuStage trouverEvaluationMilieu(Long candidatureId) {
        return (evaluationMilieuStageRepository == null || candidatureId == null)
                ? null
                : evaluationMilieuStageRepository.findByCandidatureId(candidatureId).orElse(null);
    }

    private EtudiantSuperviseDto toEtudiantSuperviseDto(Etudiant etudiant, Integer annee) {
        List<Candidature> candidatures = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();
        List<Candidature> filtrees = annee != null
                ? candidatures.stream().filter(c -> annee.equals(c.getAnneeOffre())).toList()
                : candidatures;
        Candidature stage = trouverStageActif(filtrees);
        return EtudiantSuperviseDto.create(
                etudiant,
                filtrees,
                stage,
                stage != null ? trouverContrat(stage.getId()) : null,
                stage != null ? trouverEvaluationMilieu(stage.getId()) : null
        );
    }
}
