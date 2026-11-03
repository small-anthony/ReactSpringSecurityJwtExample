package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {
    @Query("SELECT p FROM Professeur p WHERE LOWER(p.credentials.email) = LOWER(:email)")
    Optional<Professeur> findByEmail(@Param("email") String email);
    boolean existsByCredentialsEmail(String email);
}