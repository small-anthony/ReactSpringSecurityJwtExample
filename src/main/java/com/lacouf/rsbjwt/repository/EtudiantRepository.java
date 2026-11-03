package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    boolean existsByMatricule(int matricule);

    @Query("SELECT e FROM Etudiant e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(e.credentials.email) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "CAST(e.matricule AS string) LIKE CONCAT('%', :motCle, '%')")
    List<Etudiant> rechercherParMotCle(@Param("motCle") String motCle);
}
