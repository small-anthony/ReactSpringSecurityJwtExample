package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    boolean existsByEtudiantAndOffreStage(Etudiant etudiant, OffreStage offreStage);
    List<Candidature> findByEtudiant(Etudiant etudiant);
    @Query("SELECT DISTINCT c FROM Candidature c LEFT JOIN FETCH c.convocations WHERE c.offreStage = :offreStage")
    List<Candidature> findByOffreStage(@Param("offreStage") OffreStage offreStage);
    Optional<Candidature> findByIdAndOffreStageEmployeur(Long id, Employeur employeur);
    List<Candidature> findByStatut(StatutCandidature statut);

    @Query("SELECT c FROM Candidature c WHERE c.offreStage.annee = :annee")
    List<Candidature> findByAnnee(int annee);
}