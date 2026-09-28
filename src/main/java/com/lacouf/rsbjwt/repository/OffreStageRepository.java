package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OffreStageRepository extends JpaRepository<OffreStage, Long> {
	List<OffreStage> findByEmployeur(Employeur employeur);
	Optional<OffreStage> findByIdAndEmployeur(Long id, Employeur employeur);
}

