package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Gestionnaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GestionnaireRepository extends JpaRepository<Gestionnaire, Long> {
    @Query("SELECT g FROM Gestionnaire g WHERE LOWER(g.credentials.email) = LOWER(:email)")
    Optional<Gestionnaire> findByEmail(@Param("email") String email);
    boolean existsByCredentialsEmail(String email);
}