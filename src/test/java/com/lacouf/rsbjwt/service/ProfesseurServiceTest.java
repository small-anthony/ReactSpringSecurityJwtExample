package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Contrat;
import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.ENUM.CapaciteAccueilStagiaires;
import com.lacouf.rsbjwt.model.ENUM.CritereEvaluationMilieu;
import com.lacouf.rsbjwt.model.ENUM.NiveauAccord;
import com.lacouf.rsbjwt.model.ENUM.StageCible;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.Etudiant;
import com.lacouf.rsbjwt.model.EvaluationMilieuStage;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.Professeur;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.presentation.RequestDto.EvaluationMilieuStageRequest;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.EtudiantRepository;
import com.lacouf.rsbjwt.repository.EvaluationMilieuStageRepository;
import com.lacouf.rsbjwt.repository.ProfesseurRepository;
import com.lacouf.rsbjwt.service.dto.DossierStageProfesseurDto;
import com.lacouf.rsbjwt.service.dto.EtudiantSuperviseDto;
import com.lacouf.rsbjwt.service.dto.EvaluationMilieuStageDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProfesseurServiceTest {

    @Mock
    private ProfesseurRepository professeurRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private ContratRepository contratRepository;

    @Mock
    private EvaluationMilieuStageRepository evaluationMilieuStageRepository;

    @InjectMocks
    private ProfesseurService professeurService;

    @Test
    void getEtudiantsAssignes_succesSansAnnee() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        OffreStage offre = new OffreStage("Dev Web", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        offre.setId(1L);
        Candidature cand = new Candidature(etudiant, offre);
        cand.setId(1L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findByProfesseurId(10L)).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantSuperviseDto> resultat = professeurService.getEtudiantsAssignes("martin@test.com", null);

        // Assert
        assertNotNull(resultat);
        assertEquals(1, resultat.size());
        assertEquals("Sophie", resultat.getFirst().firstName());
        assertEquals("EMBAUCHEE", resultat.getFirst().statutStage());
        assertEquals("CGI", resultat.getFirst().entrepriseStage());
    }

    @Test
    void getEtudiantsAssignes_succesAvecAnnee() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        OffreStage offre2026 = new OffreStage("Dev Web", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        offre2026.setId(1L);
        Candidature cand = new Candidature(etudiant, offre2026);
        cand.setId(1L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findByProfesseurId(10L)).thenReturn(List.of(etudiant));

        // Act
        List<EtudiantSuperviseDto> resultat = professeurService.getEtudiantsAssignes("martin@test.com", 2026);

        // Assert
        assertNotNull(resultat);
        assertEquals(1, resultat.size());
        assertEquals("EMBAUCHEE", resultat.getFirst().statutStage());
    }

    @Test
    void getEtudiantsAssignes_filtreParAnneeExclutEtudiantsSansStageDansAnnee() throws Exception {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant hatim = new Etudiant("Hatim", "Fakhour", new Credentials("hatim@test.com", "pass", Role.ETUDIANT), 1234567, "info");
        hatim.setId(1L);
        hatim.setProfesseur(prof);
        OffreStage offre2026 = new OffreStage("DevOps", "Desc", "CGI", "info", "25$/h", "15 sem", "Java", 2026);
        OffreStage offreGoogle2027 = new OffreStage("Front", "Desc", "Google", "info", "25$/h", "15 sem", "React", 2027);
        Candidature candHatim2026 = new Candidature(hatim, offre2026);
        candHatim2026.setStatut(StatutCandidature.EMBAUCHEE);
        Candidature candHatim2027 = new Candidature(hatim, offreGoogle2027);
        candHatim2027.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
        hatim.setCandidatures(List.of(candHatim2026, candHatim2027));

        Etudiant claire = new Etudiant("Claire", "Lavoie", new Credentials("claire@test.com", "pass", Role.ETUDIANT), 8887776, "info");
        claire.setId(2L);
        claire.setProfesseur(prof);
        OffreStage offreCgi2027 = new OffreStage("FullStack", "Desc", "CGI", "info", "24$/h", "15 sem", "Spring", 2027);
        Candidature candClaire2027 = new Candidature(claire, offreCgi2027);
        candClaire2027.setStatut(StatutCandidature.EMBAUCHEE);
        claire.setCandidatures(List.of(candClaire2027));

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findByProfesseurId(10L)).thenReturn(List.of(hatim, claire));

        List<EtudiantSuperviseDto> resultat2026 = professeurService.getEtudiantsAssignes("martin@test.com", 2026);
        List<EtudiantSuperviseDto> resultat2027 = professeurService.getEtudiantsAssignes("martin@test.com", 2027);

        assertEquals(1, resultat2026.size());
        assertEquals("Hatim", resultat2026.getFirst().firstName());
        assertEquals("EMBAUCHEE", resultat2026.getFirst().statutStage());

        assertEquals(1, resultat2027.size());
        assertEquals("Claire", resultat2027.getFirst().firstName());
        assertEquals("EMBAUCHEE", resultat2027.getFirst().statutStage());
    }

    @Test
    void getEtudiantsAssignes_professeurNonTrouve_lanceException() {
        // Arrange
        when(professeurRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantsAssignes("inconnu@test.com", null)
        );

        assertTrue(exception.getMessage().contains("Professeur introuvable"));
    }

    @Test
    void getEtudiantDetail_succes() throws Exception {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        // Act
        EtudiantSuperviseDto resultat = professeurService.getEtudiantDetail(1L, "martin@test.com");

        // Assert
        assertNotNull(resultat);
        assertEquals(1L, resultat.id());
        assertEquals("Sophie", resultat.firstName());
    }

    @Test
    void getEtudiantDetail_professeurNonTrouve_lanceException() {
        // Arrange
        when(professeurRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(1L, "inconnu@test.com")
        );

        assertTrue(exception.getMessage().contains("Professeur introuvable"));
    }

    @Test
    void getEtudiantDetail_etudiantNonTrouve_lanceException() {
        // Arrange
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(99L, "martin@test.com")
        );

        assertTrue(exception.getMessage().contains("Étudiant introuvable"));
    }

    @Test
    void getEtudiantDetail_etudiantNonAssigneACeProfesseur_lanceException() {
        // Arrange
        Professeur prof1 = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof1.setId(10L);

        Professeur prof2 = new Professeur("Chantal", "Gagnon", new Credentials("chantal@test.com", "pass", Role.PROFESSEUR));
        prof2.setId(20L);

        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof2);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof1));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                professeurService.getEtudiantDetail(1L, "martin@test.com")
        );

        assertTrue(exception.getMessage().contains("Cet étudiant n'est pas assigné à ce professeur"));
    }

    private Map<CritereEvaluationMilieu, NiveauAccord> creerReponsesCompletes(NiveauAccord niveau) {
        Map<CritereEvaluationMilieu, NiveauAccord> map = new EnumMap<>(CritereEvaluationMilieu.class);
        for (CritereEvaluationMilieu critere : CritereEvaluationMilieu.values()) {
            map.put(critere, niveau);
        }
        return map;
    }

    private EvaluationMilieuStageRequest creerRequeteValide(
            Map<CritereEvaluationMilieu, NiveauAccord> reponses,
            String commentaires,
            boolean quartsVariables
    ) {
        return new EvaluationMilieuStageRequest(
                "CGI Inc.",
                "Valentin Dimitrov",
                "1350 René-Lévesque Ouest",
                "Montréal",
                "H3G 1T4",
                "514-555-1234",
                "514-555-9999",
                "Sophie Martin",
                "2026-05-18 → 2026-08-21",
                1,
                reponses,
                5.0,
                4.0,
                3.0,
                "24.00",
                commentaires,
                StageCible.PREMIER_STAGE,
                CapaciteAccueilStagiaires.DEUX,
                true,
                quartsVariables,
                quartsVariables ? "08:00" : "",
                quartsVariables ? "16:00" : "",
                "",
                "",
                "",
                "",
                "Martin Tremblay",
                LocalDate.of(2026, 6, 15)
        );
    }

    private Etudiant creerEtudiantAvecStageComplet(Professeur prof) {
        Etudiant etudiant = new Etudiant("Sophie", "Martin", new Credentials("sophie@test.com", "pass", Role.ETUDIANT), 123456, "info");
        etudiant.setId(1L);
        etudiant.setProfesseur(prof);

        Employeur employeur = new Employeur("Valentin", "Dimitrov", new Credentials("emp@test.com", "pass", Role.EMPLOYEUR), "CGI Inc.", "514-555-1234");
        employeur.setId(5L);

        OffreStage offre = new OffreStage("Dev Web", "Desc", employeur, "info", "24$/h", "15 sem", "Java");
        offre.setId(2L);
        offre.setNomEntreprise("CGI Inc.");

        Candidature cand = new Candidature(etudiant, offre);
        cand.setId(3L);
        cand.setStatut(StatutCandidature.EMBAUCHEE);
        etudiant.setCandidatures(List.of(cand));
        return etudiant;
    }

    @Test
    void getDossierStagePourProfesseur_succes_preremplitChamps() throws Exception {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);
        Candidature cand = etudiant.getCandidatures().getFirst();
        Contrat contrat = new Contrat(cand, LocalDate.of(2026, 5, 18), LocalDate.of(2026, 8, 21), "35h", "24.00$/h", "Taches", "Conditions");

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(contratRepository.findByCandidatureId(3L)).thenReturn(Optional.of(contrat));
        when(evaluationMilieuStageRepository.findByCandidatureId(3L)).thenReturn(Optional.empty());

        DossierStageProfesseurDto dto = professeurService.getDossierStagePourProfesseur("martin@test.com", 1L);

        assertEquals("CGI Inc.", dto.nomEntreprise());
        assertEquals("Valentin Dimitrov", dto.personneContact());
        assertEquals("514-555-1234", dto.telephoneEntreprise());
        assertEquals(null, dto.adresseEntreprise());
        assertEquals("Sophie Martin", dto.nomStagiaire());
        assertEquals("2026-05-18 → 2026-08-21", dto.dateStage());
        assertEquals("24.00$/h", dto.salaireHoraire());
        assertEquals("Martin Tremblay", dto.nomProfesseur());
        assertFalse(dto.milieuEvalue());
    }

    @Test
    void getDossierStagePourProfesseur_succes_utiliseLieuEtTelephoneDeLOffre() throws Exception {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);
        Candidature cand = etudiant.getCandidatures().getFirst();
        cand.getOffreStage().setAdresse("1350 boulevard René-Lévesque Ouest");
        cand.getOffreStage().setVille("Montréal");
        cand.getOffreStage().setCodePostal("H3G 1T4");
        cand.getOffreStage().setTelephone("438-555-0199");
        Contrat contrat = new Contrat(cand, LocalDate.of(2026, 5, 18), LocalDate.of(2026, 8, 21), "35h", "24.00$/h", "Taches", "Conditions");

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(contratRepository.findByCandidatureId(3L)).thenReturn(Optional.of(contrat));
        when(evaluationMilieuStageRepository.findByCandidatureId(3L)).thenReturn(Optional.empty());

        DossierStageProfesseurDto dto = professeurService.getDossierStagePourProfesseur("martin@test.com", 1L);

        assertEquals("1350 boulevard René-Lévesque Ouest", dto.adresseEntreprise());
        assertEquals("Montréal", dto.villeEntreprise());
        assertEquals("H3G 1T4", dto.codePostalEntreprise());
        assertEquals("438-555-0199", dto.telephoneEntreprise());
    }

    @Test
    void getDossierStagePourProfesseur_autreProfesseur_lanceSecurityException() {
        Professeur prof1 = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof1.setId(10L);
        Professeur prof2 = new Professeur("Chantal", "Gagnon", new Credentials("chantal@test.com", "pass", Role.PROFESSEUR));
        prof2.setId(20L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof2);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof1));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));

        assertThrows(Exception.class, () ->
                professeurService.getDossierStagePourProfesseur("martin@test.com", 1L));
    }

    @Test
    void soumettreEvaluationMilieu_succes_sauvegardeEvaluation() throws Exception {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        EvaluationMilieuStageRequest req = creerRequeteValide(
                creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD),
                "Très bon milieu",
                false
        );

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(false);
        when(evaluationMilieuStageRepository.save(any(EvaluationMilieuStage.class))).thenAnswer(inv -> {
            EvaluationMilieuStage e = inv.getArgument(0);
            e.setId(42L);
            return e;
        });

        EvaluationMilieuStageDto resultat = professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, req);

        assertNotNull(resultat);
        assertEquals(42L, resultat.id());
        assertEquals("CGI Inc.", resultat.nomEntreprise());
        assertEquals("H3G 1T4", resultat.codePostal());
    }

    @Test
    void soumettreEvaluationMilieu_dejaEvalue_lanceIllegalStateException() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);
        EvaluationMilieuStageRequest req = creerRequeteValide(creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD), "", false);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(true);

        assertThrows(Exception.class, () ->
                professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, req));
    }

    @Test
    void soumettreEvaluationMilieu_reponseNegativeSansCommentaire_lanceException() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        Map<CritereEvaluationMilieu, NiveauAccord> reponses = creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD);
        reponses.put(CritereEvaluationMilieu.EQUIPEMENT_ADEQUAT, NiveauAccord.PLUTOT_EN_DESACCORD);
        EvaluationMilieuStageRequest req = creerRequeteValide(reponses, "   ", false);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(false);

        Exception ex = assertThrows(Exception.class, () ->
                professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, req));
        assertTrue(ex.getMessage().contains("commentaires"));
    }

    @Test
    void soumettreEvaluationMilieu_critereManquant_lanceException() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        Map<CritereEvaluationMilieu, NiveauAccord> reponses = creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD);
        reponses.remove(CritereEvaluationMilieu.VOLUME_TRAVAIL_ACCEPTABLE);
        EvaluationMilieuStageRequest req = creerRequeteValide(reponses, "", false);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(false);

        assertThrows(Exception.class, () ->
                professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, req));
    }

    @Test
    void soumettreEvaluationMilieu_quartsVariablesSansPlage_lanceException() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        EvaluationMilieuStageRequest base = creerRequeteValide(creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD), "", true);
        EvaluationMilieuStageRequest reqSansPlage = new EvaluationMilieuStageRequest(
                base.nomEntreprise(), base.personneContact(), base.adresse(), base.ville(), base.codePostal(),
                base.telephone(), base.telecopieur(), base.nomStagiaire(), base.dateStage(), base.numeroStage(),
                base.reponses(), base.heuresEncadrementMois1(), base.heuresEncadrementMois2(), base.heuresEncadrementMois3(),
                base.salaireHoraire(), base.commentaires(), base.milieuAPrivilegier(), base.nombreStagiairesAccueillis(),
                base.accueillirMemeStagiaire(), true, "", "", "", "", "", "", base.signatureEnseignant(), base.dateEvaluation()
        );

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(false);

        assertThrows(Exception.class, () ->
                professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, reqSansPlage));
    }

    @Test
    void soumettreEvaluationMilieu_codePostalInvalide_lanceException() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        EvaluationMilieuStageRequest base = creerRequeteValide(creerReponsesCompletes(NiveauAccord.TOTALEMENT_EN_ACCORD), "", false);
        EvaluationMilieuStageRequest reqInvalide = new EvaluationMilieuStageRequest(
                base.nomEntreprise(), base.personneContact(), base.adresse(), base.ville(), "12345",
                base.telephone(), base.telecopieur(), base.nomStagiaire(), base.dateStage(), base.numeroStage(),
                base.reponses(), base.heuresEncadrementMois1(), base.heuresEncadrementMois2(), base.heuresEncadrementMois3(),
                base.salaireHoraire(), base.commentaires(), base.milieuAPrivilegier(), base.nombreStagiairesAccueillis(),
                base.accueillirMemeStagiaire(), false, "", "", "", "", "", "", base.signatureEnseignant(), base.dateEvaluation()
        );

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.existsByCandidatureId(3L)).thenReturn(false);

        assertThrows(Exception.class, () ->
                professeurService.soumettreEvaluationMilieu("martin@test.com", 1L, reqInvalide));
    }

    @Test
    void getEvaluationMilieuPourProfesseur_inexistant_lanceNoSuchElement() {
        Professeur prof = new Professeur("Martin", "Tremblay", new Credentials("martin@test.com", "pass", Role.PROFESSEUR));
        prof.setId(10L);
        Etudiant etudiant = creerEtudiantAvecStageComplet(prof);

        when(professeurRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(prof));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(evaluationMilieuStageRepository.findByCandidatureId(3L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () ->
                professeurService.getEvaluationMilieuPourProfesseur("martin@test.com", 1L));
    }
}
