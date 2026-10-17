package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.HistoriqueCandidature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueCandidatureRepository extends JpaRepository<HistoriqueCandidature, Long> {

    List<HistoriqueCandidature> findByAuteurEmailOrderByDateDecisionDesc(String auteurEmail);
}