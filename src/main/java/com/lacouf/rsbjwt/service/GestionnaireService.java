package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.repository.CvRepository;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.dto.CvDto;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GestionnaireService {
    public CvRepository cvRepository;
    private final OffreStageRepository offreStageRepository;
    private final EtudiantRepository etudiantRepository;

    public GestionnaireService(CvRepository cvRepository, OffreStageRepository offreStageRepository, EtudiantRepository etudiantRepository) {
        this.cvRepository = cvRepository;
        this.offreStageRepository = offreStageRepository;
        this.etudiantRepository = etudiantRepository;
    }

    public CvDto accepterCv(Long cvId) throws Exception {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new Exception("CV non trouvé"));

        cv.accepterApprobation();
        return CvDto.create(cvRepository.save(cv));
    }

    public CvDto refuserCv(Long cvId, String message) throws Exception {
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new Exception("CV non trouvé"));

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

        offre.refuser(commentaire);

        return OffreStageDto.create(offreStageRepository.save(offre));
    }

    public List<OffreStageDto> getOffresEnAttente() {
        return offreStageRepository.findByApprobationStatus(StatusAcceptation.EN_ATTENTE)
                .stream()
                .map(OffreStageDto::create)
                .collect(Collectors.toList());
    }
}
