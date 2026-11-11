package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluation;
import com.lacouf.rsbjwt.model.Evaluation;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationRequest;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.EvaluationRepository;
import com.lacouf.rsbjwt.service.dto.EvaluationDto;
import com.lacouf.rsbjwt.service.dto.StagiaireDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(rollbackFor = Exception.class)
public class EvaluationService {
    private final EvaluationRepository evaluationRepository;
    private final ContratRepository contratRepository;

    public EvaluationService(EvaluationRepository evaluationRepository, ContratRepository contratRepository) {
        this.evaluationRepository = evaluationRepository;
        this.contratRepository = contratRepository;
    }

    @Transactional(readOnly = true)
    public List<StagiaireDto> getStagiaires(String emailEmployeur) {
        return contratRepository.findByCandidatureOffreStageEmployeurEmail(emailEmployeur).stream()
                .filter(Contrat::estComplete)
                .map(contrat -> StagiaireDto.create(contrat, evaluationRepository.existsByContratId(contrat.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public StagiaireDto getStagiaire(Long contratId, String emailEmployeur) throws Exception {
        Contrat contrat = contratDeLEmployeur(contratId, emailEmployeur);
        return StagiaireDto.create(contrat, evaluationRepository.existsByContratId(contratId));
    }

    @Transactional(readOnly = true)
    public EvaluationDto getEvaluation(Long contratId, String emailEmployeur) throws Exception {
        contratDeLEmployeur(contratId, emailEmployeur);
        Evaluation evaluation = evaluationRepository.findByContratId(contratId)
                .orElseThrow(() -> new Exception("Aucune évaluation pour ce stagiaire"));
        return EvaluationDto.create(evaluation);
    }

    public EvaluationDto evaluer(Long contratId, String emailEmployeur, EvaluationRequest requete) throws Exception {
        Contrat contrat = contratDeLEmployeur(contratId, emailEmployeur);
        if (evaluationRepository.existsByContratId(contratId)) {
            throw new Exception("Ce stagiaire a déjà été évalué");
        }
        verifierEvaluation(contrat, requete);
        Evaluation evaluation = new Evaluation(
                contrat,
                requete.reponses(),
                requete.commentaires(),
                requete.appreciationGlobale(),
                requete.precisionAppreciation(),
                requete.discuteAvecStagiaire(),
                requete.heuresEncadrementParSemaine(),
                requete.accueilProchainStage(),
                requete.formationTechnique(),
                requete.nomSignataire(),
                requete.fonctionSignataire());
        return EvaluationDto.create(evaluationRepository.save(evaluation));
    }

    private Contrat contratDeLEmployeur(Long contratId, String emailEmployeur) throws Exception {
        return contratRepository.findByCandidatureOffreStageEmployeurEmail(emailEmployeur).stream()
                .filter(contrat -> contratId.equals(contrat.getId()))
                .findFirst()
                .orElseThrow(() -> new Exception("Stagiaire introuvable"));
    }

    private void verifierEvaluation(Contrat contrat, EvaluationRequest requete) throws Exception {
        if (!contrat.estComplete()) {
            throw new Exception("Le contrat doit être complété avant d'évaluer le stagiaire");
        }
        verifierReponsesCompletes(requete);
        if (requete.appreciationGlobale() == null) {
            throw new Exception("L'appréciation globale est obligatoire");
        }
        if (requete.accueilProchainStage() == null) {
            throw new Exception(
                    "Veuillez indiquer si l'entreprise accueillerait cet élève pour un prochain stage");
        }
        if (requete.heuresEncadrementParSemaine() < 0) {
            throw new Exception("Le nombre d'heures d'encadrement ne peut pas être négatif");
        }
        exigerTexte(requete.nomSignataire(), "Le nom du signataire est obligatoire");
        exigerTexte(requete.fonctionSignataire(), "La fonction du signataire est obligatoire");
    }

    private void verifierReponsesCompletes(EvaluationRequest requete) throws Exception {
        for (CritereEvaluation critere : CritereEvaluation.values()) {
            if (requete.reponses() == null || requete.reponses().get(critere) == null) {
                throw new Exception("Tous les critères doivent être évalués");
            }
        }
    }

    private void exigerTexte(String texte, String message) throws Exception {
        if (texte == null || texte.trim().isEmpty()) {
            throw new Exception(message);
        }
    }
}