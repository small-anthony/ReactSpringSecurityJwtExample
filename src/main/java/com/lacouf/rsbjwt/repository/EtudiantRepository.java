package com.lacouf.rsbjwt.repository;

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
        AND NOT EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature.etudiant = e
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteEntrevue();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        JOIN c.convocations conv
        WHERE conv.statut = StatutConvocation.EN_ATTENTE
        AND c.offreStage.annee = :annee
        AND NOT EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature.etudiant = e
            AND ct.candidature.offreStage.annee = :annee
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteEntrevue(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        WHERE c.statut IN (
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE,
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_CHOIX_STAGE,
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_SIGNATURE
        )
        AND NOT EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature.etudiant = e
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteReponse();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        JOIN FETCH e.candidatures c
        WHERE c.statut IN (
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE,
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_CHOIX_STAGE,
            com.lacouf.rsbjwt.model.ENUM.StatutCandidature.EN_ATTENTE_SIGNATURE
        )
        AND c.offreStage.annee = :annee
        AND NOT EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature.etudiant = e
            AND ct.candidature.offreStage.annee = :annee
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
    """)
    List<Etudiant> findEtudiantsEnAttenteReponse(@Param("annee") int annee);

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.professeur
        JOIN FETCH e.candidatures c
        WHERE EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature = c
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
    """)
    List<Etudiant> findEtudiantsTrouveStage();

    @Query("""
        SELECT DISTINCT e FROM Etudiant e
        LEFT JOIN FETCH e.professeur
        JOIN FETCH e.candidatures c
        WHERE c.offreStage.annee = :annee
        AND EXISTS (
            SELECT ct FROM Contrat ct
            WHERE ct.candidature = c
            AND ct.statut = com.lacouf.rsbjwt.model.ENUM.StatutContrat.COMPLETE
        )
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
