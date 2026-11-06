package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {
    @Query("SELECT p FROM Professeur p WHERE LOWER(p.credentials.email) = LOWER(:email)")
    Optional<Professeur> findByEmail(@Param("email") String email);

    boolean existsByCredentialsEmail(String email);

    @Query("SELECT DISTINCT p FROM Professeur p LEFT JOIN FETCH p.etudiants")
    List<Professeur> findAllWithEtudiants();

    @Query("SELECT p FROM Professeur p WHERE " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :nom, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :nom, '%')) OR " +
            "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :nom, '%')) OR " +
            "LOWER(CONCAT(p.lastName, ' ', p.firstName)) LIKE LOWER(CONCAT('%', :nom, '%'))")
    List<Professeur> findByNom(@Param("nom") String nom);
}
