package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.ENUM.StatusAcceptation;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OffreStageRepository extends JpaRepository<OffreStage, Long> {
	List<OffreStage> findByEmployeur(Employeur employeur);
	Optional<OffreStage> findByIdAndEmployeur(Long id, Employeur employeur);
	List<OffreStage> findByApprobationStatus(StatusAcceptation status);
	@Query("""
	SELECT DISTINCT offre
		FROM OffreStage offre
		LEFT JOIN FETCH offre.candidatures
		WHERE offre.employeur = :employeur
""")
	List<OffreStage> findWithCandidaturesByEmployeur(Employeur employeur);
	@Query("""
	SELECT DISTINCT offre
		FROM OffreStage offre
		LEFT JOIN FETCH offre.candidatures candidature
		WHERE candidature.etudiant = :etudiant
			AND candidature MEMBER OF offre.candidatures
	""")
	List<OffreStage> findByEtudiant(Etudiant etudiant);
}
