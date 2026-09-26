package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GestionnaireService {
    private final OffreStageRepository offreStageRepository;
    private final EtudiantRepository etudiantRepository;

    public GestionnaireService(OffreStageRepository offreStageRepository, EtudiantRepository etudiantRepository){
        this.offreStageRepository = offreStageRepository;
        this.etudiantRepository = etudiantRepository;
    }
}
