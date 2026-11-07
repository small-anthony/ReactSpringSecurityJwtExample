package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;
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
                    .map(e -> toEtudiantSuperviseDto(e, annee))
                    .toList();
        }

        return etudiants.stream()
                .map(this::toEtudiantSuperviseDto)
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

        return toEtudiantSuperviseDto(etudiant);
    }

    private EtudiantSuperviseDto toEtudiantSuperviseDto(Etudiant etudiant) {
        return toEtudiantSuperviseDto(etudiant, null);
    }

    private EtudiantSuperviseDto toEtudiantSuperviseDto(Etudiant etudiant, Integer annee) {
        List<Candidature> candidatures = etudiant.getCandidatures() != null ? etudiant.getCandidatures() : List.of();

        List<Candidature> candidaturesFiltrees = (annee != null)
                ? candidatures.stream().filter(c -> annee.equals(c.getAnneeOffre())).toList()
                : candidatures;

        Candidature stage = null;
        for (Candidature c : candidaturesFiltrees) {
            if (c.getStatut() == StatutCandidature.EMBAUCHEE || c.getStatut() == StatutCandidature.ACCEPTEE) {
                stage = c;
                break;
            }
        }

        String statut = stage != null ? stage.getStatut().name() : "EN_RECHERCHE";
        String titre = stage != null ? stage.getTitreOffre() : "Aucun stage";
        String entreprise = stage != null ? stage.getNomEntreprise() : "Non déterminé";

        return new EtudiantSuperviseDto(
                etudiant.getId(),
                etudiant.getFirstName(),
                etudiant.getLastName(),
                etudiant.getEmail(),
                etudiant.getMatricule(),
                etudiant.getDiscipline(),
                statut,
                entreprise,
                titre,
                CandidatureDto.create(candidaturesFiltrees)
        );
    }
}
