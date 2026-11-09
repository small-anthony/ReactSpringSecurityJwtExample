package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByContratId(Long contratId);

    boolean existsByContratId(Long contratId);
}