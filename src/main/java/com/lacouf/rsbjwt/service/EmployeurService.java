package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.stereotype.Service;

@Service
public class EmployeurService {

    private final UserAppRepository userAppRepository;
    private final EmployeurRepository employeurRepository;
    private final OffreStageRepository offreStageRepository;

    public EmployeurService(UserAppRepository userAppRepository, EmployeurRepository employeurRepository, OffreStageRepository offreStageRepository) {
        this.userAppRepository = userAppRepository;
        this.employeurRepository = employeurRepository;
        this.offreStageRepository = offreStageRepository;
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description, String emailEmployeur) throws Exception {
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

        OffreStage offreStage = new OffreStage(titre.trim(), description.trim(), nomEntreprise.trim());

        employeur.ajouterOffre(offreStage);

        return OffreStageDto.create(offreStageRepository.save(offreStage));
    }
}
