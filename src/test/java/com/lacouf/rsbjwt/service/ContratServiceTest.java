package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.model.auth.Credentials;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    private OffreStage offreStage;
    private Candidature candidature;
    private CreationContratRequest requestValide;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant("Jean", "Tremblay", new Credentials("jean@test.com", "pass", Role.ETUDIANT), 1234567, "Informatique");
        employeur = new Employeur("Bob", "Employeur", new Credentials("bob@cgi.com", "pass", Role.EMPLOYEUR), "CGI", "514-555-1234");
        offreStage = new OffreStage("Développeur Java", "Stage backend", "CGI");
        offreStage.setEmployeur(employeur);
        candidature = new Candidature(etudiant, offreStage);
        candidature.setId(1L);
        candidature.setStatut(StatutCandidature.ACCEPTEE);

        requestValide = new CreationContratRequest(
                1L,
                LocalDate.of(2026, 11, 1),
                LocalDate.of(2027, 2, 28),
                "Du lundi au vendredi, 9h à 17h (35h/semaine)",
                "22.50$/h",
                "Développement de microservices avec Spring Boot et React",
                "Télétravail hybride 2 jours par semaine, matériel fourni par l'entreprise"
        );
    }

    @Test
    void creerContrat_succes() throws Exception {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(false);
        when(contratRepository.save(any(Contrat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContratDto result = contratService.creerContrat(requestValide, "alice@college.ca");

        assertThat(result).isNotNull();
        assertThat(result.titreOffre()).isEqualTo("Développeur Java");
        assertThat(result.nomEntreprise()).isEqualTo("CGI");
        assertThat(result.etudiantNom()).isEqualTo("Tremblay");
        assertThat(result.etudiantPrenom()).isEqualTo("Jean");
        assertThat(result.statut()).isEqualTo(StatutContrat.EN_ATTENTE_SIGNATURE);
        assertThat(result.salaire()).isEqualTo("22.50$/h");

        verify(contratRepository, times(1)).save(any(Contrat.class));
    }

    @Test
    void creerContrat_champsManquants_doitLancerException() {
        CreationContratRequest requestInvalide = new CreationContratRequest(
                1L,
                null,
                LocalDate.of(2027, 2, 28),
                "9h-17h",
                "",
                "Description",
                "Conditions"
        );

        assertThatThrownBy(() -> contratService.creerContrat(requestInvalide, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessage("Des informations obligatoires manquent dans le contrat.");

        verify(contratRepository, never()).save(any());
    }

    @Test
    void creerContrat_requeteNulle_doitLancerException() {
        assertThatThrownBy(() -> contratService.creerContrat(null, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessage("Des informations obligatoires manquent dans le contrat.");
    }

    @Test
    void creerContrat_dateFinAvantDateDebut_doitLancerException() {
        CreationContratRequest requestDatesInvalides = new CreationContratRequest(
                1L,
                LocalDate.of(2027, 2, 28),
                LocalDate.of(2026, 11, 1),
                "9h-17h",
                "20$/h",
                "Description",
                "Conditions"
        );

        assertThatThrownBy(() -> contratService.creerContrat(requestDatesInvalides, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessage("La date de fin ne peut pas être antérieure à la date de début.");
    }

    @Test
    void creerContrat_candidatureIntrouvable_doitLancerException() {
        when(candidatureRepository.findById(99L)).thenReturn(Optional.empty());

        CreationContratRequest requestNonExistant = new CreationContratRequest(
                99L,
                LocalDate.of(2026, 11, 1),
                LocalDate.of(2027, 2, 28),
                "9h-17h",
                "20$/h",
                "Description",
                "Conditions"
        );

        assertThatThrownBy(() -> contratService.creerContrat(requestNonExistant, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Candidature introuvable");
    }

    @Test
    void creerContrat_etudiantNonEmbauche_doitLancerException() {
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));

        assertThatThrownBy(() -> contratService.creerContrat(requestValide, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessage("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");

        verify(contratRepository, never()).save(any());
    }

    @Test
    void creerContrat_contratExisteDeja_doitLancerException() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(contratRepository.existsByCandidatureId(1L)).thenReturn(true);

        assertThatThrownBy(() -> contratService.creerContrat(requestValide, "admin@college.ca"))
                .isInstanceOf(Exception.class)
                .hasMessage("Un contrat existe déjà pour cet étudiant et cet employeur.");

        verify(contratRepository, never()).save(any());
    }

    @Test
    void getCandidaturesPourContrat_succes() {
        when(candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE)).thenReturn(List.of(candidature));
        when(contratRepository.findByCandidatureId(any())).thenReturn(Optional.empty());

        List<CandidaturePourContratDto> result = contratService.getCandidaturesPourContrat();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).titreOffre()).isEqualTo("Développeur Java");
        assertThat(result.get(0).nomEntreprise()).isEqualTo("CGI");
        assertThat(result.get(0).contratExiste()).isFalse();
    }

    @Test
    void getTousLesContrats_succes() {
        Contrat contrat = new Contrat(candidature, "doc".getBytes(), LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findAllByOrderByDateCreationDesc()).thenReturn(List.of(contrat));

        List<ContratDto> contrats = contratService.getTousLesContrats();

        assertThat(contrats).hasSize(1);
        assertThat(contrats.get(0).nomEntreprise()).isEqualTo("CGI");
    }

    @Test
    void getContratPdf_succes() throws Exception {
        byte[] doc = "Document de contrat".getBytes();
        Contrat contrat = new Contrat(candidature, doc, LocalDate.now(), LocalDate.now().plusMonths(3), "35h", "20$", "desc", "cond");
        when(contratRepository.findById(10L)).thenReturn(Optional.of(contrat));

        byte[] pdf = contratService.getContratPdf(10L);

        assertThat(pdf).isEqualTo(doc);
    }

    @Test
    void getContratPdf_introuvable_doitLancerException() {
        when(contratRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contratService.getContratPdf(10L))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Contrat introuvable");
    }
}
