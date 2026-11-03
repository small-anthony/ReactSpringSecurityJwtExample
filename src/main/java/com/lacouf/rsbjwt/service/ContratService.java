package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ContratService {

    private final ContratRepository contratRepository;
    private final CandidatureRepository candidatureRepository;
    private final UserAppRepository userAppRepository;

    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository,
                          UserAppRepository userAppRepository) {
        this.contratRepository = contratRepository;
        this.candidatureRepository = candidatureRepository;
        this.userAppRepository = userAppRepository;
    }

    public List<CandidaturePourContratDto> getCandidaturesPourContrat() {
        return candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE).stream()
                .map(c -> CandidaturePourContratDto.create(c, contratRepository.findByCandidatureId(c.getId())))
                .toList();
    }

    public ContratDto creerContrat(CreationContratRequest request, String gestionnaireEmail) throws Exception {
        validerRequeteContrat(request);

        Candidature candidature = candidatureRepository.findById(request.candidatureId())
                .orElseThrow(() -> new Exception("Candidature introuvable avec l'identifiant : " + request.candidatureId()));

        if (candidature.getStatut() != StatutCandidature.ACCEPTEE) {
            throw new Exception("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");
        }

        if (contratRepository.existsByCandidatureId(candidature.getId())) {
            throw new Exception("Un contrat existe déjà pour cet étudiant et cet employeur.");
        }

        byte[] documentData = ContratPdfGenerator.generer(candidature, request, resoudreNomGestionnaire(gestionnaireEmail));

        Contrat contrat = new Contrat(
                candidature,
                documentData,
                request.dateDebut(),
                request.dateFin(),
                request.horaire().trim(),
                request.salaire().trim(),
                request.descriptionTaches().trim(),
                request.conditions().trim());

        return ContratDto.create(contratRepository.save(contrat));
    }

    public ContratDto signerContrat(Long contratId, String actorEmail, MultipartFile signatureFile) throws Exception {
        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(() -> new Exception("Utilisateur introuvable"));

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(() -> new Exception("Contrat introuvable"));

        if (signatureFile == null || signatureFile.isEmpty()) {
            throw new Exception("Fichier de signature invalide ou manquant");
        }

        byte[] signatureBytes = signatureFile.getBytes();
        if (signatureBytes == null || signatureBytes.length == 0) {
            throw new Exception("Fichier de signature invalide ou manquant");
        }

        Signature<?> signature = new Signature<>(utilisateur, signatureBytes);
        contrat.signer(signature);

        byte[] pdfMisAJour = ContratPdfGenerator.mettreAJour(contrat, getNomGestionnaire());
        contrat.setData(pdfMisAJour);

        return ContratDto.create(contratRepository.save(contrat));
    }

    public ContratDto rejeterContrat(Long contratId, String actorEmail) throws Exception {
        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(() -> new Exception("Utilisateur introuvable"));

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(() -> new Exception("Contrat introuvable"));

        contrat.rejeter(utilisateur);
        return ContratDto.create(contratRepository.save(contrat));
    }

    public List<ContratDto> getTousLesContrats() {
        return ContratDto.create(contratRepository.findAllByOrderByDateCreationDesc());
    }

    public ContratDto getContratById(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return ContratDto.create(contrat);
    }

    public byte[] getContratPdf(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return contrat.getData();
    }

    public List<ContratDto> getContratsEtudiant(String email) {
        return ContratDto.create(contratRepository.findByCandidatureEtudiantEmail(email));
    }

    public List<ContratDto> getContratsEmployeur(String email) {
        return ContratDto.create(contratRepository.findByCandidatureOffreStageEmployeurEmail(email));
    }

    private void validerRequeteContrat(CreationContratRequest request) throws Exception {
        if (request == null || request.candidatureId() == null
                || request.dateDebut() == null || request.dateFin() == null
                || estVide(request.horaire()) || estVide(request.salaire())
                || estVide(request.descriptionTaches()) || estVide(request.conditions())) {
            throw new Exception("Des informations obligatoires manquent dans le contrat.");
        }
        if (request.dateFin().isBefore(request.dateDebut())) {
            throw new Exception("La date de fin ne peut pas être antérieure à la date de début.");
        }
    }

    private boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }

    private String resoudreNomGestionnaire(String email) {
        if (estVide(email)) {
            return getNomGestionnaire();
        }
        return userAppRepository.findUserAppByEmail(email)
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElseGet(this::getNomGestionnaire);
    }

    private String getNomGestionnaire() {
        return userAppRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.GESTIONNAIRE)
                .findFirst()
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Gestionnaire de stage");
    }
}
