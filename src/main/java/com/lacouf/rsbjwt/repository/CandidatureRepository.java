package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    boolean existsByEtudiantAndOffreStage(Etudiant etudiant, OffreStage offreStage);
    List<Candidature> findByEtudiant(Etudiant etudiant);
}