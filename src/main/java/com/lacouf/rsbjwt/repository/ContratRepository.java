package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    @Query("SELECT c FROM Contrat c WHERE c.candidature.id = :candidatureId")
    Optional<Contrat> findByCandidatureId(@Param("candidatureId") Long candidatureId);

    @Query("SELECT COUNT(c) > 0 FROM Contrat c WHERE c.candidature.id = :candidatureId")
    boolean existsByCandidatureId(@Param("candidatureId") Long candidatureId);

    List<Contrat> findAllByOrderByDateCreationDesc();
    List<Contrat> findByCandidatureEtudiantEmail(String email);
    List<Contrat> findByCandidatureOffreStageEmployeurEmail(String email);
}
