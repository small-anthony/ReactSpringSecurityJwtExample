package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    @Query("SELECT e FROM Evaluation e WHERE e.contrat.id = :contratId")
    Optional<Evaluation> findByContratId(@Param("contratId") Long contratId);

    @Query("SELECT COUNT(e) > 0 FROM Evaluation e WHERE e.contrat.id = :contratId")
    boolean existsByContratId(@Param("contratId") Long contratId);
}