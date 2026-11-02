package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.model.auth.Credentials;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
        candidature.setStatut(StatutCandidature.ACCEPTEE);

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
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(userAppRepository.findUserAppByEmail("alice@college.ca")).thenReturn(Optional.of(gestionnaire));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratDto result = contratService.creerContrat(requestValide, "alice@college.ca");

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
        CreationContratRequest requestInvalide = new CreationContratRequest(
                1L,
                null,
                LocalDate.of(2027, 2, 28),
                "9h-17h",
                "",
                "Description",
                "Conditions"
        );

        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestInvalide, "alice@college.ca"));

        assertEquals("Des informations obligatoires manquent dans le contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_requeteNulle_lanceException() {
        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(null, null));

        assertEquals("Des informations obligatoires manquent dans le contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_dateFinAvantDateDebut_lanceException() {
        CreationContratRequest requestDatesInvalides = new CreationContratRequest(
                1L,
                LocalDate.of(2027, 2, 28),
                LocalDate.of(2026, 11, 1),
                "9h-17h",
                "20$/h",
                "Description",
                "Conditions"
        );

        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestDatesInvalides, "alice@college.ca"));

        assertEquals("La date de fin ne peut pas être antérieure à la date de début.", exception.getMessage());
    }

    @Test
    void creerContrat_candidatureIntrouvable_lanceException() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertTrue(exception.getMessage().contains("Candidature introuvable"));
    }

    @Test
    void creerContrat_etudiantNonEmbauche_lanceException() {
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));

        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertEquals("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.", exception.getMessage());
    }

    @Test
    void creerContrat_contratExisteDeja_lanceException() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(true);

        Exception exception = assertThrows(Exception.class, () ->
                contratService.creerContrat(requestValide, "alice@college.ca"));

        assertEquals("Un contrat existe déjà pour cet étudiant et cet employeur.", exception.getMessage());
    }

    @Test
    void signerContrat_troisParties_succes() throws Exception {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn("sig".getBytes());
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(userAppRepository.findUserAppByEmail("jean@test.com")).thenReturn(Optional.of(etudiant));
        ContratDto apresEtudiant = contratService.signerContrat(1L, "jean@test.com", file);
        assertEquals(StatutContrat.SIGNE_PAR_ETUDIANT, apresEtudiant.statut());
        assertTrue(apresEtudiant.signeParEtudiant());

        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));
        ContratDto apresEmployeur = contratService.signerContrat(1L, "bob@cgi.com", file);
        assertTrue(apresEmployeur.signeParEmployeur());

        when(userAppRepository.findUserAppByEmail("alice@college.ca")).thenReturn(Optional.of(gestionnaire));
        ContratDto apresGestionnaire = contratService.signerContrat(1L, "alice@college.ca", file);
        assertEquals(StatutContrat.COMPLETE, apresGestionnaire.statut());
        assertTrue(apresGestionnaire.signeParGestionnaire());
    }

    @Test
    void signerContrat_employeurEnPremier_statutSigneParEmployeur() throws Exception {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn("sig".getBytes());
        when(contratRepository.findById(1L)).thenReturn(Optional.of(contrat));
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAppRepository.findUserAppByEmail("bob@cgi.com")).thenReturn(Optional.of(employeur));

        ContratDto result = contratService.signerContrat(1L, "bob@cgi.com", file);

        assertEquals(StatutContrat.SIGNE_PAR_EMPLOYEUR, result.statut());
    }

    @Test
    void signerContrat_erreursValidation_lanceException() throws Exception {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        Etudiant autreEtudiant = new Etudiant("Autre", "Etudiant", new Credentials("autre@test.com", "pass", Role.ETUDIANT), 7654321, "Informatique");
        autreEtudiant.setId(99L);

        assertThrows(Exception.class, () -> contrat.signer(Signature.invalid(etudiant)));
        assertThrows(Exception.class, () -> contrat.signer(new Signature<>(autreEtudiant, "sig".getBytes())));

        contrat.rejeter(etudiant);
        assertEquals(StatutContrat.REFUSE, contrat.getStatut());
        assertThrows(Exception.class, () -> contrat.signer(new Signature<>(etudiant, "sig".getBytes())));
    }

    @Test
    void getCandidaturesPourContrat_succes() {
        when(candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE)).thenReturn(List.of(candidature));
        when(contratRepository.findByCandidatureId(1L)).thenReturn(Optional.empty());

        List<CandidaturePourContratDto> result = contratService.getCandidaturesPourContrat();

        assertEquals(1, result.size());
        assertEquals("Développeur Java", result.getFirst().titreOffre());
        assertEquals("CGI", result.getFirst().nomEntreprise());
        assertFalse(result.getFirst().contratExiste());
    }

    @Test
    void getTousLesContrats_succes() {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findAllByOrderByDateCreationDesc()).thenReturn(List.of(contrat));

        List<ContratDto> contrats = contratService.getTousLesContrats();

        assertEquals(1, contrats.size());
        assertEquals("CGI", contrats.getFirst().nomEntreprise());
    }

    @Test
    void getContratById_succes() throws Exception {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findById(10L)).thenReturn(Optional.of(contrat));

        ContratDto dto = contratService.getContratById(10L);

        assertNotNull(dto);
        assertEquals("CGI", dto.nomEntreprise());
    }

    @Test
    void getContratById_introuvable_lanceException() {
        when(contratRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> contratService.getContratById(10L));
    }

    @Test
    void getContratPdf_succes() throws Exception {
        byte[] doc = "Document de contrat".getBytes();
        Contrat contrat = new Contrat(candidature, doc, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findById(10L)).thenReturn(Optional.of(contrat));

        byte[] pdf = contratService.getContratPdf(10L);

        assertArrayEquals(doc, pdf);
    }

    @Test
    void getContratPdf_introuvable_lanceException() {
        when(contratRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> contratService.getContratPdf(10L));
    }

    @Test
    void getContratsEtudiantEtEmployeur_succes() {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findByCandidatureEtudiantEmail("jean@test.com")).thenReturn(List.of(contrat));
        when(contratRepository.findByCandidatureOffreStageEmployeurEmail("bob@cgi.com")).thenReturn(List.of(contrat));

        assertEquals(1, contratService.getContratsEtudiant("jean@test.com").size());
        assertEquals(1, contratService.getContratsEmployeur("bob@cgi.com").size());
    }
}
