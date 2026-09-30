package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.EtudiantDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EtudiantService {
    private final UserAppRepository userAppRepository;
    private final EtudiantRepository etudiantRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;

    public EtudiantService(UserAppRepository userAppRepository,
                           EtudiantRepository etudiantRepository,
                           OffreStageRepository offreStageRepository,
                           CandidatureRepository candidatureRepository) {
        this.userAppRepository = userAppRepository;
        this.etudiantRepository = etudiantRepository;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public CvDto uploadCv(String emailConnecte, MultipartFile file) throws Exception {
        Etudiant etudiant = (Etudiant) userAppRepository.findUserAppByEmail(emailConnecte)
                .orElseThrow(() -> new Exception("Etudiant non trouvé"));

        if (file.isEmpty()) {
            throw new Exception("Veuillez sélectionner un fichier");
        }

        String contentType = file.getContentType();

        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new Exception("Le fichier doit être un PDF");
        }

        etudiant.setCv(file.getBytes());

        Etudiant etudiantSauvegarde = etudiantRepository.save(etudiant);

        return CvDto.create(etudiantSauvegarde.getCv());
    }

    public CandidatureDto postuler(Long offreId, String emailConnecte) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailConnecte)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailConnecte));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Etudiant non trouvé"));

        OffreStage offre = offreStageRepository.findById(offreId)
                .orElseThrow(() -> new Exception("Offre de stage introuvable"));

        if (offre.getStatus() != StatusAcceptation.ACCEPTE) {
            throw new Exception("Cette offre n'est pas disponible");
        }

        if (!offre.getEtudiantsAutorises().isEmpty()
                && !offre.getEtudiantsAutorises().contains(etudiant)) {
            throw new Exception("Cette offre ne vous est pas accessible");
        }

        if (etudiant.getCv() == null || etudiant.getCv().getStatusAcceptation() != StatusAcceptation.ACCEPTE) {
            throw new Exception("Votre CV doit être accepté avant de pouvoir postuler");
        }

        if (candidatureRepository.existsByEtudiantAndOffreStage(etudiant, offre)) {
            throw new Exception("Vous avez déjà postulé à cette offre");
        }

        Candidature candidature = candidatureRepository.save(new Candidature(etudiant, offre));

        return CandidatureDto.create(candidature);
    }

    public List<CandidatureDto> getMesCandidatures(String emailConnecte) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailConnecte)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailConnecte));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Etudiant non trouvé"));

        return candidatureRepository.findByEtudiant(etudiant).stream()
                .map(CandidatureDto::create)
                .collect(Collectors.toList());
    }

    public EtudiantDto getEtudiantByMatricule(int matricule) throws Exception {
        Etudiant etudiant = etudiantRepository.findByMatricule(matricule)
                .orElseThrow(() -> new Exception("Aucun étudiant trouvé avec ce matricule"));

        return EtudiantDto.create(etudiant);
    }
}