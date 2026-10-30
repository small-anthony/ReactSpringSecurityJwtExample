package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.HistoriqueCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.HistoriqueCandidatureRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.HistoriqueCandidatureDto;
import java.util.Comparator;

@Service
public class EmployeurService {
    private final UserAppRepository userAppRepository;
    private final EmployeurRepository employeurRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;
    private final HistoriqueCandidatureRepository historiqueRepository;

    public EmployeurService(UserAppRepository userAppRepository, EmployeurRepository employeurRepository, OffreStageRepository offreStageRepository,
                            CandidatureRepository candidatureRepository, HistoriqueCandidatureRepository historiqueRepository) {
        this.userAppRepository = userAppRepository;
        this.employeurRepository = employeurRepository;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
        this.historiqueRepository = historiqueRepository;
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description, String emailEmployeur) throws Exception {
        return createOffreStage(titre, nomEntreprise, description, null, null, null, null, emailEmployeur);
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String emailEmployeur) throws Exception {
        if (titre == null || titre.trim().isEmpty()) {
            throw new Exception("Le titre est obligatoire");
        }

        if (nomEntreprise == null || nomEntreprise.trim().isEmpty()) {
            throw new Exception("Le nom de l'entreprise est obligatoire");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new Exception("La description est obligatoire");
        }

        if (emailEmployeur == null || emailEmployeur.trim().isEmpty()) {
            throw new Exception("Le courriel de l'employeur est obligatoire");
        }

        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        OffreStage offreStage = new OffreStage(
                titre.trim(),
                description.trim(),
                nomEntreprise.trim(),
                discipline != null && !discipline.trim().isEmpty() ? discipline.trim() : null,
                salaire != null && !salaire.trim().isEmpty() ? salaire.trim() : null,
                duree != null && !duree.trim().isEmpty() ? duree.trim() : null,
                exigences != null && !exigences.trim().isEmpty() ? exigences.trim() : null
        );

        employeur.ajouterOffre(offreStage);

        return OffreStageDto.create(offreStageRepository.save(offreStage));
    }

    public List<OffreStageDto> getOffres(String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        List<OffreStageDto> offres = new ArrayList<>(
                OffreStageDto.create(offreStageRepository.findWithCandidaturesByEmployeur(employeur)));
        offres.sort(Comparator.comparing(OffreStageDto::id, Comparator.reverseOrder()));
        return offres;
    }

    public List<CandidatureDto> getCandidatures(Long offreId, String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        return candidatureRepository.findByOffreStage(offre).stream()
                .map(CandidatureDto::create)
                .collect(Collectors.toList());
    }

    public byte[] getCvCandidat(Long candidatureId, String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        Candidature candidature = candidatureRepository.findByIdAndOffreStageEmployeur(candidatureId, employeur)
                .orElseThrow(() -> new Exception("Candidature introuvable pour cet employeur"));

        Cv cv = candidature.getEtudiant().getCv();
        if (cv == null || cv.getData() == null) {
            throw new Exception("Aucun CV disponible pour ce candidat");
        }

        return cv.getData();
    }

    public CandidatureDto accepterCandidature(Long candidatureId, String emailEmployeur) throws Exception {
        return repondre(candidatureId, emailEmployeur, StatutCandidature.ACCEPTEE, null);
    }

    public CandidatureDto refuserCandidature(Long candidatureId, String message, String emailEmployeur) throws Exception {
        String messageNettoye = (message == null || message.trim().isEmpty()) ? null : message.trim();
        return repondre(candidatureId, emailEmployeur, StatutCandidature.REFUSEE, messageNettoye);
    }

    public List<HistoriqueCandidatureDto> getHistorique(String emailEmployeur) {
        return historiqueRepository.findByAuteurEmailOrderByDateDecisionDesc(emailEmployeur).stream()
                .map(HistoriqueCandidatureDto::create)
                .collect(Collectors.toList());
    }

    private CandidatureDto repondre(Long candidatureId, String emailEmployeur,
                                    StatutCandidature nouveauStatut, String message) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        Candidature candidature = candidatureRepository.findByIdAndOffreStageEmployeur(candidatureId, employeur)
                .orElseThrow(() -> new Exception("Candidature introuvable pour cet employeur"));

        if (candidature.getStatut() != StatutCandidature.EN_ATTENTE) {
            throw new Exception("Cette candidature a déjà reçu une réponse");
        }

		StatutCandidature ancienStatut = candidature.getStatut();
		candidature.setStatut(nouveauStatut);
		candidature.setMessageReponse(message);
		candidature.setDateDecision(LocalDateTime.now());
		Candidature sauvegardee = candidatureRepository.save(candidature);

		historiqueRepository.save(
				new HistoriqueCandidature(sauvegardee, ancienStatut, nouveauStatut, message, emailEmployeur));

		return CandidatureDto.create(sauvegardee);
	}

    public void deleteOffre(Long offreId, String emailEmployeur) throws Exception {
        Employeur employeur = (Employeur) userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Employeur non trouvé"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull( offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        offre.supprimer();

        List<Candidature> candidatures = candidatureRepository.findByOffreStage(offre);
        for (Candidature candidature : candidatures) {
            if (candidature.getStatut() == StatutCandidature.EN_ATTENTE) {
                refuserCandidature(candidature.getId(), "L'offre a été supprimée par l'employeur", emailEmployeur);
            }
        }

        offreStageRepository.save(offre);
    }

    public OffreStageDto updateOffreStage(Long offreId, String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String emailEmployeur) throws Exception {

        if (titre == null || titre.trim().isEmpty()) {
            throw new Exception("Le titre est obligatoire");
        }

        if (nomEntreprise == null || nomEntreprise.trim().isEmpty()) {
            throw new Exception("Le nom de l'entreprise est obligatoire");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new Exception("La description est obligatoire");
        }

        Employeur employeur = (Employeur) userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Employeur non trouvé"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        offre.setTitre(titre.trim());
        offre.setNomEntreprise(nomEntreprise.trim());
        offre.setDescription(description.trim());
        offre.setDiscipline(discipline != null && !discipline.trim().isEmpty() ? discipline.trim() : null);
        offre.setDuree(duree != null && !duree.trim().isEmpty() ? duree.trim() : null);
        offre.setSalaire(salaire != null && !salaire.trim().isEmpty() ? salaire.trim() : null);
        offre.setExigences(exigences != null && !exigences.trim().isEmpty() ? exigences.trim() : null);

        offre.reinitialiserApprobation();

        return OffreStageDto.create(offreStageRepository.save(offre));
    }
}