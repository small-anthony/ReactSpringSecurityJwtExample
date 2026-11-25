package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.EvaluationMilieuStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationMilieuStageRepository extends JpaRepository<EvaluationMilieuStage, Long> {
    @Query("SELECT e FROM EvaluationMilieuStage e WHERE e.candidature.id = :candidatureId")
    Optional<EvaluationMilieuStage> findByCandidatureId(@Param("candidatureId") Long candidatureId);

    @Query("SELECT e FROM EvaluationMilieuStage e WHERE e.etudiant.id = :etudiantId ORDER BY e.dateEvaluation DESC")
    List<EvaluationMilieuStage> findByEtudiantIdOrderByDateEvaluationDesc(@Param("etudiantId") Long etudiantId);

    @Query("SELECT COUNT(e) > 0 FROM EvaluationMilieuStage e WHERE e.candidature.id = :candidatureId")
    boolean existsByCandidatureId(@Param("candidatureId") Long candidatureId);

    List<EvaluationMilieuStage> findAllByOrderByDateEvaluationDesc();
}
