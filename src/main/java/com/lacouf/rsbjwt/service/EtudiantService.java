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
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.service.dto.StatutCvDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EtudiantService {
    private final UserAppRepository userAppRepository;
    private final EtudiantRepository etudiantRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;

    @Autowired
    public EtudiantService(UserAppRepository userAppRepository,
                           EtudiantRepository etudiantRepository,
                           OffreStageRepository offreStageRepository,
                           CandidatureRepository candidatureRepository) {
        this.userAppRepository = userAppRepository;
        this.etudiantRepository = etudiantRepository;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public EtudiantService(UserAppRepository userAppRepository,
                           EtudiantRepository etudiantRepository,
                           OffreStageRepository offreStageRepository) {
        this(userAppRepository, etudiantRepository, offreStageRepository, null);
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

    public OffreStageDto postuler(Long offreId, String emailConnecte) throws Exception {
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

        offre.addCandidature(new Candidature(etudiant, offre));
        offreStageRepository.save(offre);

        return OffreStageDto.createFilteredByEtudiant(offre, etudiant);
    }

    public List<OffreStageDto> getMesCandidatures(String emailConnecte) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailConnecte)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailConnecte));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Etudiant non trouvé"));

        List<OffreStage> offre = offreStageRepository.findByEtudiant(etudiant);

        return OffreStageDto.createFilteredByEtudiant(offre, etudiant);
    }

    public EtudiantDto getEtudiantByMatricule(int matricule) throws Exception {
        Etudiant etudiant = etudiantRepository.findByMatricule(matricule)
                .orElseThrow(() -> new Exception("Aucun étudiant trouvé avec ce matricule"));

        return EtudiantDto.create(etudiant);
    }

    public StatutCvDto getStatutCv(String email) {
        UserApp user = userAppRepository.findUserAppByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Étudiant introuvable"));

        if (etudiant.getCv() == null) {
            return new StatutCvDto(false, null, null);
        }
        return new StatutCvDto(
                true,
                etudiant.getCv().getStatusAcceptation(),
                etudiant.getCv().getMessageRefusApprobation());
    }

    public List<OffreStageDto> getOffresDisponibles(String email) {
        UserApp user = userAppRepository.findUserAppByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Étudiant introuvable"));

        if (etudiant.getCv() == null || etudiant.getCv().getStatusAcceptation() != StatusAcceptation.ACCEPTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès refusé : votre CV doit être approuvé par un gestionnaire.");
        }

        List<OffreStage> offresAcceptees = offreStageRepository.findByApprobationStatus(StatusAcceptation.ACCEPTE);


        return offresAcceptees.stream()
                .filter(offre -> offre.getEtudiantsAutorises() == null
                        || offre.getEtudiantsAutorises().isEmpty()
                        || offre.getEtudiantsAutorises().stream().anyMatch(e -> e.getId().equals(etudiant.getId())))
                .map(offre -> OffreStageDto.createFilteredByEtudiant(offre, etudiant))
                .toList();
    }

    public OffreStageDto getOffreDetail(Long id, String email) {
        UserApp user = userAppRepository.findUserAppByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Etudiant etudiant = etudiantRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Étudiant introuvable"));

        if (etudiant.getCv() == null || etudiant.getCv().getStatusAcceptation() != StatusAcceptation.ACCEPTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : votre CV doit être approuvé.");
        }

        OffreStage offre = offreStageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre de stage introuvable"));

        if (offre.getStatus() != StatusAcceptation.ACCEPTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette offre n'est pas disponible.");
        }

        boolean autorise = offre.getEtudiantsAutorises() == null
                || offre.getEtudiantsAutorises().isEmpty()
                || offre.getEtudiantsAutorises().stream().anyMatch(e -> e.getId().equals(etudiant.getId()));

        if (!autorise) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'avez pas accès à cette offre de stage.");
        }

        return OffreStageDto.createFilteredByEtudiant(offre, etudiant);
    }
}