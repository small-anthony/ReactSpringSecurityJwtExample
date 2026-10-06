package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;

@Service
public class EmployeurService {

    private final UserAppRepository userAppRepository;
    private final EmployeurRepository employeurRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;

    public EmployeurService(UserAppRepository userAppRepository, EmployeurRepository employeurRepository, OffreStageRepository offreStageRepository,
                            CandidatureRepository candidatureRepository) {
        this.userAppRepository = userAppRepository;
        this.employeurRepository = employeurRepository;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description, String emailEmployeur) throws Exception {
        return createOffreStage(titre, nomEntreprise, description, null, null, null, null, emailEmployeur);
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String emailEmployeur) throws Exception {
        if (titre == null || titre.trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre est obligatoire");
        }

        if (nomEntreprise == null || nomEntreprise.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de l'entreprise est obligatoire");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("La description est obligatoire");
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

        return OffreStageDto.create(offreStageRepository.findWithCandidaturesByEmployeur(employeur));
    }

    public List<CandidatureDto> getCandidatures(Long offreId, String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeur(offreId, employeur)
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
}
