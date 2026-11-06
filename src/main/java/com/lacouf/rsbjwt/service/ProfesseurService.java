package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfesseurService {
    private final ProfesseurRepository professeurRepository;
    private final EtudiantRepository etudiantRepository;

    @Autowired
    public ProfesseurService(ProfesseurRepository professeurRepository, EtudiantRepository etudiantRepository) {
        this.professeurRepository = professeurRepository;
        this.etudiantRepository = etudiantRepository;
    }

    public List<EtudiantSuperviseDto> getEtudiantsAssignes(String professeurEmail, Integer annee) throws Exception {
        Professeur professeur = professeurRepository.findByEmail(professeurEmail)
                .orElseThrow(() -> new Exception("Professeur introuvable"));

        List<Etudiant> etudiants = etudiantRepository.findByProfesseurId(professeur.getId());

        if (annee != null) {
            return etudiants.stream()
                    .map(e -> EtudiantSuperviseDto.createFilteredByAnnee(e, annee))
                    .toList();
        }

        return etudiants.stream()
                .map(EtudiantSuperviseDto::create)
                .toList();
    }

    public EtudiantSuperviseDto getEtudiantDetail(Long etudiantId, String professeurEmail) throws Exception {
        Professeur professeur = professeurRepository.findByEmail(professeurEmail)
                .orElseThrow(() -> new Exception("Professeur introuvable"));

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new Exception("Étudiant introuvable"));

        if (etudiant.getProfesseur() == null || !etudiant.getProfesseur().getId().equals(professeur.getId())) {
            throw new Exception("Cet étudiant n'est pas assigné à ce professeur.");
        }

        return EtudiantSuperviseDto.create(etudiant);
    }
}
