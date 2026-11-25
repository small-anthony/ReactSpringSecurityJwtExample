package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationActionType;
import com.lacouf.rsbjwt.model.ENUM.notifications.NotificationType;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContratServiceTest {

    @Mock
    private ContratRepository contratRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private UserAppRepository userAppRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ContratService contratService;

    private Etudiant etudiant;
    private Employeur employeur;
    private Gestionnaire gestionnaire;
    private OffreStage offreStage;
    private Candidature candidature;
    private CreationContratRequest requestValide;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant("Jean", "Tremblay", new Credentials("jean@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        etudiant.setId(10L);

        employeur = new Employeur("Bob", "Employeur", new Credentials("bob@cgi.com", "pass", Role.EMPLOYEUR), "CGI", "514-555-1234");
        employeur.setId(20L);

        gestionnaire = new Gestionnaire("Alice", "Martin", new Credentials("alice@college.ca", "pass", Role.GESTIONNAIRE));
        gestionnaire.setId(30L);

        offreStage = new OffreStage("Développeur Java", "Stage backend", "CGI");
        offreStage.setId(5L);
        offreStage.setEmployeur(employeur);

        candidature = new Candidature(etudiant, offreStage);
        candidature.setId(1L);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);

        requestValide = new CreationContratRequest(
                1L,
                LocalDate.of(2026, 11, 1),
                LocalDate.of(2027, 2, 28),
                "35h/semaine",
                "22.50$/h",
                "Développement Spring Boot et React",
                "Télétravail hybride"
        );
    }

    @Test
    void creerContrat_succes() throws Exception {
        // Arrange
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ContratDto result = contratService.creerContrat(requestValide, "alice@college.ca");

        // Assert
        assertNotNull(result);
        assertEquals("Développeur Java", result.titreOffre());
        assertEquals("CGI", result.nomEntreprise());
        assertEquals("Tremblay", result.etudiantNom());
        assertEquals("Jean", result.etudiantPrenom());
        assertEquals(StatutContrat.EN_ATTENTE_SIGNATURE, result.statut());
        assertEquals("22.50$/h", result.salaire());
    }

    @Test
    void creerContrat_champsManquants_lanceException() {
        // Arrange
        CreationContratRequest requestInvalide = new CreationContratRequest(
                1L,
                null,
                LocalDate.of(2027, 2, 28),
                "9h-17h",
                "",
                "Description",
                "Conditions"
        );

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestInvalide, "alice@college.ca"));

        assertEquals("Des informations obligatoires manquent dans le contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_requeteNulle_lanceException() {
        // Arrange & Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(null, null));

        assertEquals("Des informations obligatoires manquent dans le contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_dateFinAvantDateDebut_lanceException() {
        // Arrange
        CreationContratRequest requestDatesInvalides = new CreationContratRequest(
                1L,
                LocalDate.of(2027, 2, 28),
                LocalDate.of(2026, 11, 1),
                "9h-17h",
                "20$/h",
                "Description",
                "Conditions"
        );

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestDatesInvalides, "alice@college.ca"));

        assertEquals("La date de fin ne peut pas être antérieure à la date de début.", exception.getMessage());
    }

    @Test
    void creerContrat_candidatureIntrouvable_lanceException() {
        // Arrange
        when(candidatureRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertTrue(exception.getMessage().contains("Candidature introuvable"));
    }

    @Test
    void creerContrat_etudiantNonEmbauche_lanceException() {
        // Arrange
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CONVOCATION);
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertEquals("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_contratExisteDeja_lanceException() {
        // Arrange
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(true);

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertEquals("Un contrat existe dans pour cet étudiant et cet employeur.", exception.getMessage());
    }

    @Test
    void signerContrat_troisParties_succes() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn("sig".getBytes());
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act & Assert - Etudiant
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        ContratDto apresEtudiant = contratService.signerContrat(1L, "jean@test.com", file);
        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT, apresEtudiant.statut());
        assertTrue(apresEtudiant.signeParEtudiant());

        // Act & Assert - Employeur
        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));
        ContratDto apresEmployeur = contratService.signerContrat(1L, "bob@cgi.com", file);
        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR, apresEmployeur.statut());
        assertTrue(apresEmployeur.signeParEmployeur());

        // Act & Assert - Gestionnaire
        when(userAppRepository.findUserAppByEmail("alice@college.ca")).thenReturn(Optional.of(gestionnaire));
        ContratDto apresGestionnaire = contratService.signerContrat(1L, "alice@college.ca", file);
        assertEquals(StatutContrat.COMPLETE, apresGestionnaire.statut());
        assertTrue(apresGestionnaire.signeParGestionnaire());
    }

    @Test
    void signerContrat_employeurEnPremier_statutSigneParEmployeur() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn("sig".getBytes());
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));

        // Act
        ContratDto result = contratService.signerContrat(1L, "bob@cgi.com", file);

        // Assert
        assertEquals(StatutContrat.SIGNE_PAR_EMPLOYEUR, result.statut());
    }

    @Test
    void signerContrat_gestionnaireAvantEtudiantOuEmployeur_lanceException() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn("sig".getBytes());
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(userAppRepository.findUserAppByEmail("alice@college.ca")).thenReturn(Optional.of(gestionnaire));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "alice@college.ca", file));

        assertEquals("L'étudiant et l'employeur doivent avoir signé le contrat avant le gestionnaire.", exception.getMessage());
    }

    @Test
    void signerContrat_signatureFichierNul_lanceException() {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "jean@test.com", null));

        assertEquals("Fichier de signature invalide ou manquant", exception.getMessage());
    }

    @Test
    void signerContrat_signatureFichierVide_lanceException() {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile fileVide = mock(MultipartFile.class);
        when(fileVide.isEmpty()).thenReturn(true);
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "jean@test.com", fileVide));

        assertEquals("Fichier de signature invalide ou manquant", exception.getMessage());
    }

    @Test
    void signerContrat_signatureBytesVides_lanceException() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile fileBytesVides = mock(MultipartFile.class);
        when(fileBytesVides.isEmpty()).thenReturn(false);
        when(fileBytesVides.getBytes()).thenReturn(new byte[0]);
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "jean@test.com", fileBytesVides));

        assertEquals("Fichier de signature invalide ou manquant", exception.getMessage());
    }

    @Test
    void signerContrat_erreursValidation_lanceException() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        Etudiant autreEtudiant = new Etudiant("Autre", "Etudiant", new Credentials("autre@test.com", "pass", Role.ETUDIANT), 7654321, "Informatique");
        autreEtudiant.setId(99L);
        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sig".getBytes());

        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(userAppRepository.findUserAppByEmail("autre@test.com")).thenReturn(Optional.of(autreEtudiant));
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));

        // Act & Assert
        Exception exInvalide = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "autre@test.com", signatureFile));
        assertEquals("signataire est invalide", exInvalide.getMessage());

        // Assert
        contrat.rejeter(etudiant);
        assertEquals(StatutContrat.REFUSE, contrat.getStatut());
        Exception exRefuse = assertThrows(Exception.class, () ->
                contratService.signerContrat(1L, "jean@test.com", signatureFile));
        assertEquals("Le contrat a été refusé", exRefuse.getMessage());
    }

    @Test
    void getCandidaturesPourContrat_succes() {
        // Arrange
        when(candidatureRepository.findByStatut(StatutCandidature.EMBAUCHEE)).thenReturn(List.of());
        when(candidatureRepository.findByStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE)).thenReturn(List.of(candidature));
        when(contratRepository.findByCandidatureId(1L)).thenReturn(Optional.empty());

        // Act
        List<CandidaturePourContratDto> result = contratService.getCandidaturesPourContrat();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Développeur Java", result.getFirst().titreOffre());
        assertEquals("CGI", result.getFirst().nomEntreprise());
        assertFalse(result.getFirst().contratExiste());
    }

    @Test
    void getTousLesContrats_succes() {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findAllByOrderByDateCreationDesc()).thenReturn(List.of(contrat));

        // Act
        List<ContratDto> contrats = contratService.getTousLesContrats();

        // Assert
        assertEquals(1, contrats.size());
        assertEquals("CGI", contrats.getFirst().nomEntreprise());
    }

    @Test
    void getContratById_succes() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findById(10L)).thenReturn(Optional.of(contrat));

        // Act
        ContratDto dto = contratService.getContratById(10L);

        // Assert
        assertNotNull(dto);
        assertEquals("CGI", dto.nomEntreprise());
    }

    @Test
    void getContratById_introuvable_lanceException() {
        // Arrange
        when(contratRepository.findById(10L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> contratService.getContratById(10L));
    }

    @Test
    void getContratPdf_succes() throws Exception {
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findById(10L)).thenReturn(Optional.of(contrat));
        when(userAppRepository.findAll()).thenReturn(List.of(gestionnaire));

        byte[] pdf = contratService.getContratPdf(10L);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    @Test
    void getContratPdf_introuvable_lanceException() {
        // Arrange
        when(contratRepository.findById(10L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> contratService.getContratPdf(10L));
    }

    @Test
    void getContratsEtudiantEtEmployeur_succes() {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com")).thenReturn(List.of(contrat));
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail("bob@cgi.com")).thenReturn(List.of(contrat));

        // Act & Assert
        assertEquals(1, contratService.getContratsEtudiant("jean@test.com").size());
        assertEquals(1, contratService.getContratsEmployeur("bob@cgi.com").size());
    }

    @Test
    void rejeterContrat_succes() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ContratDto result = contratService.rejeterContrat(1L, "jean@test.com");

        // Assert
        assertEquals(StatutContrat.REFUSE, result.statut());
        assertFalse(result.signeParEtudiant());
        assertEquals(StatutCandidature.REFUSEE, candidature.getStatut());
        verify(candidatureRepository).save(candidature);
    }

    @Test
    void rejeterContrat_parEmployeur_succes() throws Exception {
        // Arrange
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ContratDto result = contratService.rejeterContrat(1L, "bob@cgi.com");

        // Assert
        assertEquals(StatutContrat.REFUSE, result.statut());
        assertFalse(result.signeParEmployeur());
    }

    @Test
    void rejeterContrat_contratIntrouvable_lanceException() {
        // Arrange
        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> contratService.rejeterContrat(99L, "jean@test.com"));
    }

    @Test
    void signerContrat_etudiantDejaSigneAutreContrat_lanceException() throws Exception {
        // Arrange
        Contrat contratDejaSigne = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contratDejaSigne.signer(new Signature<>(etudiant, "sig1".getBytes()));

        OffreStage autreOffre = new OffreStage("Autre poste", "Desc", "Google");
        autreOffre.setId(6L);
        autreOffre.setEmployeur(employeur);
        Candidature autreCandidature = new Candidature(etudiant, autreOffre);
        autreCandidature.setId(2L);
        autreCandidature.setStatut(StatutCandidature.EMBAUCHEE);
        Contrat nouveauContrat = new Contrat(autreCandidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "22$", "desc", "cond");

        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sig2".getBytes());

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(2L)).thenReturn(Optional.of(nouveauContrat));
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com"))
                .thenReturn(List.of(contratDejaSigne, nouveauContrat));

        // Act & Assert
        Exception exception = assertThrows(Exception.class, () ->
                contratService.signerContrat(2L, "jean@test.com", signatureFile));

        assertEquals("Vous avez déjà signé un contrat de stage et ne pouvez pas en signer plusieurs.", exception.getMessage());
        assertFalse(nouveauContrat.isSigneParEtudiant());
        verify(contratRepository, never()).save(any(Contrat.class));
    }

    @Test
    void signerContrat_etudiantAutreContratRefuse_succes() throws Exception {
        // Arrange
        Contrat contratRefuse = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contratRefuse.signer(new Signature<>(etudiant, "sig1".getBytes()));
        contratRefuse.rejeter(employeur);

        OffreStage autreOffre = new OffreStage("Autre poste", "Desc", "Google");
        autreOffre.setId(6L);
        autreOffre.setEmployeur(employeur);
        Candidature autreCandidature = new Candidature(etudiant, autreOffre);
        autreCandidature.setId(2L);
        autreCandidature.setStatut(StatutCandidature.EMBAUCHEE);
        Contrat nouveauContrat = new Contrat(autreCandidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "22$", "desc", "cond");

        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sig2".getBytes());

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(2L)).thenReturn(Optional.of(nouveauContrat));
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com"))
                .thenReturn(List.of(contratRefuse, nouveauContrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ContratDto resultat = contratService.signerContrat(2L, "jean@test.com", signatureFile);

        // Assert
        assertTrue(resultat.signeParEtudiant());
        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT, resultat.statut());
    }

    @Test
    void genererContratAutomatique_succes_extraitInfosEtConserveAutresCandidatures() throws Exception {
        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
        offreStage.setSalaire("25.00$/h");
        offreStage.setDateDebut(LocalDate.of(anneeCourante, 3, 2));
        offreStage.setDateFin(LocalDate.of(anneeCourante, 5, 22));
        offreStage.setExigences("Java et React");
        offreStage.setAnnee(anneeCourante);

        OffreStage autreOffre = new OffreStage("Analyste QA", "Tests E2E", "Google");
        autreOffre.setId(6L);
        autreOffre.setAnnee(anneeCourante);
        Candidature autreCandidature = new Candidature(etudiant, autreOffre);
        autreCandidature.setId(2L);
        autreCandidature.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);

        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(candidatureRepository.findByEtudiant(etudiant)).thenReturn(List.of(candidature, autreCandidature));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratDto result = contratService.genererContratAutomatique(1L);

        assertNotNull(result);
        assertEquals(StatutContrat.EN_ATTENTE_SIGNATURE, result.statut());
        assertEquals("25.00$/h", result.salaire());
        assertEquals("Stage backend", result.descriptionTaches());
        assertEquals("Java et React", result.conditions());
        assertEquals(LocalDate.of(anneeCourante, 3, 2), result.dateDebut());
        assertEquals(LocalDate.of(anneeCourante, 5, 22), result.dateFin());
        assertEquals(StatutCandidature.EN_ATTENTE_SIGNATURE, candidature.getStatut());
        assertEquals(StatutCandidature.EN_ATTENTE_CHOIX_STAGE, autreCandidature.getStatut());
    }

    @Test
    void genererContratAutomatique_candidatureNonEmbauchee_lanceException() {
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CONVOCATION);
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                contratService.genererContratAutomatique(1L));

        assertEquals("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.", exception.getMessage());
        verify(contratRepository, never()).save(any(Contrat.class));
    }

    @Test
    void genererContratAutomatique_contratExisteDeja_lanceException() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(true);

        Exception exception = assertThrows(Exception.class, () ->
                contratService.genererContratAutomatique(1L));

        assertEquals("Un contrat existe dans pour cet étudiant et cet employeur.", exception.getMessage());
        verify(contratRepository, never()).save(any(Contrat.class));
    }

    @Test
    void genererContratAutomatique_etudiantDejaStageActif_lanceException() {
        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
        offreStage.setAnnee(anneeCourante);
        OffreStage autreOffre = new OffreStage("Analyste QA", "Tests E2E", "Google");
        autreOffre.setId(6L);
        autreOffre.setAnnee(anneeCourante);
        Candidature autreCandidature = new Candidature(etudiant, autreOffre);
        autreCandidature.setId(2L);
        autreCandidature.setStatut(StatutCandidature.EMBAUCHEE);

        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(candidatureRepository.findByEtudiant(etudiant)).thenReturn(List.of(candidature, autreCandidature));

        Exception exception = assertThrows(Exception.class, () ->
                contratService.genererContratAutomatique(1L));

        assertEquals("Vous avez déjà choisi et signé un stage pour cette session.", exception.getMessage());
        verify(contratRepository, never()).save(any(Contrat.class));
    }

    @Test
    void genererContratAutomatique_devraitNotifierEtudiantEtEmployeur() throws Exception {
        offreStage.setAnnee(AcademicSessionUtils.getAnneeActuelle());
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(candidatureRepository.findByEtudiant(etudiant)).thenReturn(List.of(candidature));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(inv -> inv.getArgument(0));

        contratService.genererContratAutomatique(1L);

        ArgumentCaptor<Notification> notifEtudiant = ArgumentCaptor.forClass(Notification.class);
        ArgumentCaptor<Notification> notifEmployeur = ArgumentCaptor.forClass(Notification.class);

        verify(notificationService).pushNotification(notifEtudiant.capture(), eq(10L));
        verify(notificationService).pushNotification(notifEmployeur.capture(), eq(20L));

        assertEquals(NotificationType.ACTION_REQUIRED, notifEtudiant.getValue().getType());
        assertEquals("etudiant.contrat_created", notifEtudiant.getValue().getMessage());
        assertEquals(NotificationActionType.SIGNER_CONTRAT_ETUDIANT, notifEtudiant.getValue().getAction().getType());

        assertEquals(NotificationType.ACTION_REQUIRED, notifEmployeur.getValue().getType());
        assertEquals("employeur.contrat_created", notifEmployeur.getValue().getMessage());
        assertEquals(NotificationActionType.SIGNER_CONTRAT_EMPLOYEUR, notifEmployeur.getValue().getAction().getType());
    }

    @Test
    void creerContrat_devraitNotifierEtudiantEtEmployeur() throws Exception {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(contratRepository.save(any(Contrat.class))).thenAnswer(inv -> inv.getArgument(0));

        contratService.creerContrat(requestValide, "gestion@test.com");

        ArgumentCaptor<Notification> notifEtudiant = ArgumentCaptor.forClass(Notification.class);
        ArgumentCaptor<Notification> notifEmployeur = ArgumentCaptor.forClass(Notification.class);

        verify(notificationService).pushNotification(notifEtudiant.capture(), eq(10L));
        verify(notificationService).pushNotification(notifEmployeur.capture(), eq(20L));

        assertEquals(NotificationType.ACTION_REQUIRED, notifEtudiant.getValue().getType());
        assertEquals("etudiant.contrat_created", notifEtudiant.getValue().getMessage());
        assertEquals(NotificationActionType.SIGNER_CONTRAT_ETUDIANT, notifEtudiant.getValue().getAction().getType());

        assertEquals(NotificationType.ACTION_REQUIRED, notifEmployeur.getValue().getType());
        assertEquals("employeur.contrat_created", notifEmployeur.getValue().getMessage());
        assertEquals(NotificationActionType.SIGNER_CONTRAT_EMPLOYEUR, notifEmployeur.getValue().getAction().getType());
    }

    @Test
    void signerContrat_premiereSignatureSeulement_aucuneNotificationGestionnaire() throws Exception {
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contrat.setId(5L);

        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sig".getBytes());

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(5L)).thenReturn(Optional.of(contrat));
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com")).thenReturn(List.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        contratService.signerContrat(5L, "jean@test.com", signatureFile);

        verify(notificationService, never()).pushNotification(any(), any());
    }

    @Test
    void signerContrat_etudiantEtEmployeurOntSigne_notifieGestionnaires() throws Exception {
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contrat.setId(5L);
        contrat.signer(new Signature<>(etudiant, "sigEtudiant".getBytes()));

        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sigEmployeur".getBytes());

        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));
        when(contratRepository.findById(5L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(gestionnaireRepository.findAll()).thenReturn(List.of(gestionnaire));

        ContratDto resultat = contratService.signerContrat(5L, "bob@cgi.com", signatureFile);

        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR, resultat.statut());
        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationService).pushNotification(notifCaptor.capture(), eq(gestionnaire.getId()));
        Notification notif = notifCaptor.getValue();
        assertEquals(NotificationType.SUCCESS, notif.getType());
        assertEquals(NotificationActionType.SIGNER_CONTRAT, notif.getAction().getType());
        assertEquals(5L, notif.getAction().getReferenceId());
        assertEquals("gestionnaire.contrat_pret_signature", notif.getMessage());
    }

    @Test
    void rejeterContrat_parEtudiant_notifieGestionnaires() throws Exception {
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contrat.setId(7L);

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(7L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(gestionnaireRepository.findAll()).thenReturn(List.of(gestionnaire));

        ContratDto resultat = contratService.rejeterContrat(7L, "jean@test.com");

        assertEquals(StatutContrat.REFUSE, resultat.statut());
        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationService).pushNotification(notifCaptor.capture(), eq(gestionnaire.getId()));
        Notification notif = notifCaptor.getValue();
        assertEquals(NotificationType.ACTION_REQUIRED, notif.getType());
        assertEquals(NotificationActionType.REVISER_CONTRAT, notif.getAction().getType());
        assertEquals(7L, notif.getAction().getReferenceId());
        assertEquals("gestionnaire.contrat_refuse", notif.getMessage());
    }

    @Test
    void rejeterContrat_parEmployeur_notifieGestionnaires() throws Exception {
        Contrat contrat = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contrat.setId(8L);

        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));
        when(contratRepository.findById(8L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(gestionnaireRepository.findAll()).thenReturn(List.of(gestionnaire));

        ContratDto resultat = contratService.rejeterContrat(8L, "bob@cgi.com");

        assertEquals(StatutContrat.REFUSE, resultat.statut());
        verify(notificationService).pushNotification(any(Notification.class), eq(gestionnaire.getId()));
    }

    @Test
    void signerContrat_parEtudiant_refuseAutresCandidaturesEtAutresContrats() throws Exception {
        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
        offreStage.setAnnee(anneeCourante);
        Contrat contratChoisi = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contratChoisi.setId(5L);

        OffreStage autreOffre = new OffreStage("Analyste QA", "Tests E2E", "Google");
        autreOffre.setId(6L);
        autreOffre.setAnnee(anneeCourante);
        Candidature autreCandidature = new Candidature(etudiant, autreOffre);
        autreCandidature.setId(2L);
        autreCandidature.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
        Contrat autreContrat = new Contrat(autreCandidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "22$", "qa", "cond");
        autreContrat.setId(6L);

        MultipartFile signatureFile = mock(MultipartFile.class);
        when(signatureFile.isEmpty()).thenReturn(false);
        when(signatureFile.getBytes()).thenReturn("sig".getBytes());

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(5L)).thenReturn(Optional.of(contratChoisi));
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com")).thenReturn(List.of(contratChoisi, autreContrat));
        when(candidatureRepository.findByEtudiant(etudiant)).thenReturn(List.of(candidature, autreCandidature));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratDto resultat = contratService.signerContrat(5L, "jean@test.com", signatureFile);

        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT, resultat.statut());
        assertEquals(StatutContrat.REFUSE, autreContrat.getStatut());
        assertEquals(StatutCandidature.REFUSEE, autreCandidature.getStatut());
    }

    @Test
    void rejeterContrat_dejaComplete_lanceException() {
        Contrat contratComplete = new Contrat(candidature, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        contratComplete.setId(9L);
        contratComplete.signer(new Signature<>(etudiant, "s1".getBytes()));
        contratComplete.signer(new Signature<>(employeur, "s2".getBytes()));
        contratComplete.signer(new Signature<>(gestionnaire, "s3".getBytes()));

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        when(contratRepository.findById(9L)).thenReturn(Optional.of(contratComplete));

        Exception exception = assertThrows(Exception.class, () ->
                contratService.rejeterContrat(9L, "jean@test.com"));

        assertEquals("Impossible de refuser un contrat déjà complété.", exception.getMessage());
    }

    @Test
    void genererContratAutomatique_utiliseDatesEtAdresseDeOffre() throws Exception {
        int anneeCourante = AcademicSessionUtils.getAnneeActuelle();
        LocalDate debutOffre = LocalDate.of(anneeCourante, 6, 1);
        LocalDate finOffre = LocalDate.of(anneeCourante, 9, 4);
        offreStage.setAnnee(anneeCourante);
        offreStage.setAdresse("1000 rue Saint-Jacques");
        offreStage.setVille("Montréal");
        offreStage.setCodePostal("H3C 1G7");
        offreStage.setDateDebut(debutOffre);
        offreStage.setDateFin(finOffre);
        candidature.setStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE);

        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(inv -> {
            Contrat c = inv.getArgument(0);
            c.setId(42L);
            return c;
        });

        ContratDto resultat = contratService.genererContratAutomatique(1L);

        assertEquals(debutOffre, resultat.dateDebut());
        assertEquals(finOffre, resultat.dateFin());
        assertEquals("1000 rue Saint-Jacques, Montréal, H3C 1G7", resultat.lieu());
    }
}
