package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConvocationRepository extends JpaRepository<Convocation, Long> {

    @Query("SELECT c FROM Convocation c WHERE lower(c.candidature.etudiant.credentials.email) = lower(:email) ORDER BY c.dateHeure ASC")
    List<Convocation> findByEtudiantEmail(@Param("email") String email);

    @Query("SELECT c FROM Convocation c WHERE lower(c.candidature.offreStage.employeur.credentials.email) = lower(:email) ORDER BY c.dateHeure ASC")
    List<Convocation> findByEmployeurEmail(@Param("email") String email);

    @Query("SELECT c FROM Convocation c WHERE c.id = :id AND lower(c.candidature.etudiant.credentials.email) = lower(:email)")
    Optional<Convocation> findByIdAndEtudiantEmail(@Param("id") Long id, @Param("email") String email);

    @Query("SELECT c FROM Convocation c WHERE c.statut IN :statuts AND c.dateHeure < :now")
    List<Convocation> findByStatutInAndDateHeureBefore(@Param("statuts") List<StatutConvocation> statuts, @Param("now") LocalDateTime now);

    @Query("SELECT c FROM Convocation c ORDER BY c.dateHeure ASC")
    List<Convocation> findAllOrderByDateHeureAsc();
}
