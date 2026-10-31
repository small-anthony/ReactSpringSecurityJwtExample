package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.exceptions.UnexpectedUserException;
import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.security.exception.AuthenticationException;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContratService {

    private final ContratRepository contratRepository;
    private final CandidatureRepository candidatureRepository;
    private final UserAppRepository userAppRepository;

    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository, UserAppRepository userAppRepository) {
        this.contratRepository = contratRepository;
        this.candidatureRepository = candidatureRepository;
        this.userAppRepository = userAppRepository;
    }

    @Transactional(readOnly = true)
    public List<CandidaturePourContratDto> getCandidaturesPourContrat() {
        List<Candidature> candidaturesAcceptees = candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE);
        return candidaturesAcceptees.stream().map(c -> {
            Optional<Contrat> contratOpt = contratRepository.findByCandidatureId(c.getId());
            Etudiant etudiant = c.getEtudiant();
            OffreStage offre = c.getOffreStage();
            Employeur employeur = offre != null ? offre.getEmployeur() : null;

            return new CandidaturePourContratDto(
                    c.getId(),
                    offre != null ? offre.getId() : null,
                    offre != null ? offre.getTitre() : "N/A",
                    employeur != null ? employeur.getEntreprise() : "N/A",
                    employeur != null ? (employeur.getFirstName() + " " + employeur.getLastName()) : "N/A",
                    employeur != null ? employeur.getEmail() : "N/A",
                    etudiant != null ? etudiant.getId() : null,
                    etudiant != null ? etudiant.getLastName() : "N/A",
                    etudiant != null ? etudiant.getFirstName() : "N/A",
                    etudiant != null ? etudiant.getEmail() : "N/A",
                    etudiant != null ? etudiant.getMatricule() : 0,
                    contratOpt.isPresent(),
                    contratOpt.map(Contrat::getId).orElse(null)
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public ContratDto creerContrat(CreationContratRequest request, String gestionnaireEmail) throws Exception {
        if (request == null || request.candidatureId() == null) {
            throw new Exception("Des informations obligatoires manquent dans le contrat.");
        }

        if (request.dateDebut() == null || request.dateFin() == null
                || request.horaire() == null || request.horaire().trim().isEmpty()
                || request.salaire() == null || request.salaire().trim().isEmpty()
                || request.descriptionTaches() == null || request.descriptionTaches().trim().isEmpty()
                || request.conditions() == null || request.conditions().trim().isEmpty()) {
            throw new Exception("Des informations obligatoires manquent dans le contrat.");
        }

        if (request.dateFin().isBefore(request.dateDebut())) {
            throw new Exception("La date de fin ne peut pas être antérieure à la date de début.");
        }

        Candidature candidature = candidatureRepository.findById(request.candidatureId())
                .orElseThrow(() -> new Exception("Candidature introuvable avec l'identifiant : " + request.candidatureId()));

        if (candidature.getStatut() != StatutCandidature.ACCEPTEE) {
            throw new Exception("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");
        }

        if (contratRepository.existsByCandidatureId(candidature.getId())) {
            throw new Exception("Un contrat existe déjà pour cet étudiant et cet employeur.");
        }

        byte[] documentData = genererContratDocument(candidature, request);

        Contrat contrat = new Contrat(
                candidature,
                documentData,
                request.dateDebut(),
                request.dateFin(),
                request.horaire().trim(),
                request.salaire().trim(),
                request.descriptionTaches().trim(),
                request.conditions().trim()
        );

        Contrat contratSauvegarde = contratRepository.save(contrat);

        return toDto(contratSauvegarde);
    }

    @Transactional()
    public ContratDto signerContrat(Long contratId, String actorEmail, MultipartFile signatureFile)
        throws UnexpectedUserException, UserNotFoundException, Exception {
        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(UserNotFoundException::new);

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(Exception::new);

        byte[] signatureData = signatureFile.getBytes();
        Signature<?> signature = new Signature<>(utilisateur, signatureData);

        contrat.signer(signature);
        contrat = contratRepository.save(contrat);

        return toDto(contrat);
    }

    @Transactional()
    public ContratDto rejeterContrat(Long contratId, String actorEmail)
        throws AuthenticationException, UserNotFoundException, Exception {

        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(UserNotFoundException::new);

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(Exception::new);

        contrat.rejeter(utilisateur);
        contrat = contratRepository.save(contrat);

        return toDto(contrat);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getTousLesContrats() {
        return contratRepository.findAllByOrderByDateCreationDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContratDto getContratById(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return toDto(contrat);
    }

    @Transactional(readOnly = true)
    public byte[] getContratPdf(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return contrat.getData();
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEtudiant(String email) {
        return contratRepository.findByCandidatureEtudiantEmail(email).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEmployeur(String email) {
        return contratRepository.findByCandidatureOffreStageEmployeurEmail(email).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private byte[] genererContratDocument(Candidature candidature, CreationContratRequest request) {
        Etudiant etudiant = candidature.getEtudiant();
        OffreStage offre = candidature.getOffreStage();
        Employeur employeur = offre != null ? offre.getEmployeur() : null;

        StringBuilder sb = new StringBuilder();
        sb.append("================================================================================\n");
        sb.append("                         ENTENTE DE STAGE / CONTRAT DE STAGE                    \n");
        sb.append("================================================================================\n\n");
        sb.append("1. PARTIES IMPLIQUÉES :\n");
        sb.append("   - ÉTUDIANT(E) : ").append(etudiant != null ? etudiant.getFirstName() + " " + etudiant.getLastName() : "N/A");
        sb.append(" (Matricule: ").append(etudiant != null ? etudiant.getMatricule() : 0).append(", Email: ").append(etudiant != null ? etudiant.getEmail() : "N/A").append(")\n");
        sb.append("   - EMPLOYEUR : ").append(employeur != null ? employeur.getEntreprise() : "N/A");
        sb.append(" (Représentant: ").append(employeur != null ? employeur.getFirstName() + " " + employeur.getLastName() : "N/A").append(", Email: ").append(employeur != null ? employeur.getEmail() : "N/A").append(")\n");
        sb.append("   - COLLÈGE : Cégep André-Laurendeau - Gestion des stages\n\n");
        sb.append("2. POSTE ET OFFRE DE STAGE :\n");
        sb.append("   - Titre du stage : ").append(offre != null ? offre.getTitre() : "N/A").append("\n");
        sb.append("   - Date de début : ").append(request.dateDebut()).append("\n");
        sb.append("   - Date de fin : ").append(request.dateFin()).append("\n");
        sb.append("   - Horaire : ").append(request.horaire()).append("\n");
        sb.append("   - Rémunération : ").append(request.salaire()).append("\n\n");
        sb.append("3. DESCRIPTION DES TÂCHES :\n");
        sb.append("   ").append(request.descriptionTaches()).append("\n\n");
        sb.append("4. CONDITIONS DE TRAVAIL :\n");
        sb.append("   ").append(request.conditions()).append("\n\n");
        sb.append("5. ENGAGEMENTS ET SIGNATURES :\n");
        sb.append("   Les parties conviennent de respecter l'ensemble des termes mentionnés ci-dessus.\n");
        sb.append("   Le contrat sera réputé valide et effectif dès la signature des trois parties.\n");
        sb.append("================================================================================\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private ContratDto toDto(Contrat c) {
        Etudiant etudiant = c.getEtudiant();
        Employeur employeur = c.getEmployeur();
        OffreStage offre = c.getOffreStage();

        boolean signeEtudiant = c.getSignatureEtudiant() != null && c.getSignatureEtudiant().isValid();
        boolean signeEmployeur = c.getSignatureEmployeur() != null && c.getSignatureEmployeur().isValid();
        boolean signeGestionnaire = c.getSignatureGestionnaire() != null && c.getSignatureGestionnaire().isValid();

        return new ContratDto(
                c.getId(),
                c.getCandidature() != null ? c.getCandidature().getId() : null,
                offre != null ? offre.getId() : null,
                offre != null ? offre.getTitre() : "N/A",
                employeur != null ? employeur.getEntreprise() : "N/A",
                employeur != null ? (employeur.getFirstName() + " " + employeur.getLastName()) : "N/A",
                employeur != null ? employeur.getEmail() : "N/A",
                etudiant != null ? etudiant.getLastName() : "N/A",
                etudiant != null ? etudiant.getFirstName() : "N/A",
                etudiant != null ? etudiant.getEmail() : "N/A",
                etudiant != null ? etudiant.getMatricule() : 0,
                c.getDateDebut(),
                c.getDateFin(),
                c.getHoraire(),
                c.getSalaire(),
                c.getDescriptionTaches(),
                c.getConditions(),
                c.getStatut(),
                c.getDateCreation(),
                signeEtudiant,
                signeEmployeur,
                signeGestionnaire
        );
    }
}
