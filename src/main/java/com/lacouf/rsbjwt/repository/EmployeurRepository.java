package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeurRepository extends JpaRepository<com.lacouf.rsbjwt.model.Employeur, Long> {
    @Query("SELECT e FROM Employeur e WHERE LOWER(e.credentials.email) = LOWER(:email)")
    Optional<Employeur> findByEmail(@Param("email") String email);
    boolean existsByCredentialsEmail(String email);
    List<Employeur> findByEntreprise(String entreprise);
    List<Employeur> findByEntrepriseContainingIgnoreCase(String entreprise);
}
