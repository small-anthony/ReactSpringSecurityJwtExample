package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    Optional<Contrat> findByCandidatureId(Long candidatureId);
    boolean existsByCandidatureId(Long candidatureId);
    List<Contrat> findAllByOrderByDateCreationDesc();
    List<Contrat> findByCandidatureEtudiantEmail(String email);
    List<Contrat> findByCandidatureOffreStageEmployeurEmail(String email);
}
