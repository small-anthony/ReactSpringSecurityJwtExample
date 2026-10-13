package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConvocationRepository extends JpaRepository<Convocation, Long> {
    @Query("""
    SELECT convocation FROM Convocation convocation
        LEFT JOIN FETCH convocation.candidature candidature
        LEFT JOIN FETCH candidature.offreStage offreStage
        LEFT JOIN FETCH candidature.etudiant
        LEFT JOIN FETCH offreStage.employeur
    WHERE convocation.id = :id
    """)
    Optional<Convocation> findWithEmployeurAndEtudiantById(@Param("id") long id);

    @Query("""
    SELECT DISTINCT convocation FROM Convocation convocation
        LEFT JOIN FETCH convocation.candidature candidature
        LEFT JOIN FETCH candidature.etudiant etudiant
        LEFT JOIN FETCH candidature.offreStage offreStage
    WHERE lower(etudiant.credentials.email) = lower(:email)
    ORDER BY convocation.id ASC
    """)
    List<Convocation> findByEtudiantEmail(@Param("email") String email);

    @Query("""
    SELECT DISTINCT convocation FROM Convocation convocation
        LEFT JOIN FETCH convocation.candidature candidature
        LEFT JOIN FETCH candidature.offreStage offreStage
        LEFT JOIN FETCH convocation.candidature.offreStage.employeur employeur
    WHERE lower(employeur.credentials.email) = lower(:email)
    ORDER BY convocation.id ASC
    """)
    List<Convocation> findByEmployeurEmail(@Param("email") String email);

    @Modifying
    @Query("""
    UPDATE Convocation convocation
    SET convocation.statut = :expired
    WHERE convocation.statut = :pending
        AND convocation.dateLimite <= :now
    """)
    int expireConvocations(
        @Param("now") Instant now,
        @Param("expired") StatutConvocation expired,
        @Param("pending") StatutConvocation pending
    );
}
