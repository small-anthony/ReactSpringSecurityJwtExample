package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    boolean existsByEtudiantAndOffreStage(Etudiant etudiant, OffreStage offreStage);
    List<Candidature> findByEtudiant(Etudiant etudiant);
    List<Candidature> findByOffreStage(OffreStage offreStage);
    Optional<Candidature> findByIdAndOffreStageEmployeur(Long id, Employeur employeur);
}