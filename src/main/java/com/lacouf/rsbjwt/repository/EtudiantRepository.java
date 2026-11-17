package com.lacouf.rsbjwt.repository;

import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    boolean existsByMatricule(int matricule);

    @Query("SELECT e FROM Etudiant e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "LOWER(e.credentials.email) LIKE LOWER(CONCAT('%', :motCle, '%')) OR " +
            "CAST(e.matricule AS string) LIKE CONCAT('%', :motCle, '%')")
    List<Etudiant> rechercherParMotCle(@Param("motCle") String motCle);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.candidatures c
        WHERE e.id NOT IN (
            SELECT DISTINCT c2.etudiant.id FROM Candidature c2 JOIN c2.convocations conv
        )
    """)
    List<Etudiant> findEtudiantsSansConvocation();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.candidatures c
        WHERE e.id NOT IN (
            SELECT DISTINCT c2.etudiant.id FROM Candidature c2 
            JOIN c2.convocations conv
            WHERE c2.offreStage.annee = :annee
        )
    """)
    List<Etudiant> findEtudiantsSansConvocation(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        JOIN c.convocations conv
        WHERE conv.statut = com.lacouf.rsbjwt.model.ENUM.StatutConvocation.EN_ATTENTE
        AND e.id NOT IN (
            SELECT c2.etudiant.id FROM Candidature c2
            WHERE c2.statut IN (com.lacouf.rsbjwt.model.ENUM.StatutCandidature.ACCEPTEE, com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EMBAUCHEE)
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteEntrevue();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        JOIN c.convocations conv
        WHERE conv.statut = StatutConvocation.EN_ATTENTE
        AND c.offreStage.annee = :annee
        AND e.id NOT IN (
            SELECT c2.etudiant.id FROM Candidature c2
            WHERE c2.statut IN (StatutCandidature.ACCEPTEE, StatutCandidature.EMBAUCHEE)
            AND c2.offreStage.annee = :annee
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteEntrevue(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        WHERE c.statut = StatutCandidature.EN_ATTENTE_REPONSE
        AND e.id NOT IN (
            SELECT c2.etudiant.id FROM Candidature c2
            WHERE c2.statut IN (StatutCandidature.ACCEPTEE, StatutCandidature.EMBAUCHEE)
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteReponse();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        WHERE c.statut = StatutCandidature.EN_ATTENTE_REPONSE
        AND c.offreStage.annee = :annee
        AND e.id NOT IN (
            SELECT c2.etudiant.id FROM Candidature c2
            WHERE c2.statut IN (StatutCandidature.ACCEPTEE, StatutCandidature.EMBAUCHEE)
            AND c2.offreStage.annee = :annee
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteReponse(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.professeur
        JOIN FETCH e.candidatures c
        WHERE c.statut IN (com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EMBAUCHEE, com.lacouf.rsbjwt.model.ENUM.StatutCandidature.ACCEPTEE)
    """)
    List<Etudiant> findEtudiantsTrouveStage();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.professeur
        JOIN FETCH e.candidatures c
        WHERE c.statut IN (com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EMBAUCHEE, com.lacouf.rsbjwt.model.ENUM.StatutCandidature.ACCEPTEE)
        AND c.offreStage.annee = :annee
    """)
    List<Etudiant> findEtudiantsTrouveStage(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.candidatures c
        LEFT JOIN FETCH c.offreStage
        WHERE e.professeur.id = :professeurId
    """)
    List<Etudiant> findByProfesseurId(@Param("professeurId") Long professeurId);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.candidatures c
        LEFT JOIN FETCH c.offreStage
        WHERE LOWER(e.professeur.credentials.email) = LOWER(:email)
    """)
    List<Etudiant> findByProfesseurEmail(@Param("email") String email);

    long countByProfesseurId(Long professeurId);
}
