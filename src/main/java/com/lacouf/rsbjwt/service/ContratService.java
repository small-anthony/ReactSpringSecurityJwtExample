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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;

@Service
@Transactional(rollbackFor = Exception.class)
public class ContratService {

    private final ContratRepository contratRepository;
    private final CandidatureRepository candidatureRepository;
    private final UserAppRepository userAppRepository;
    private final NotificationService notificationService;

    @Autowired
    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository,
                          UserAppRepository userAppRepository,
                          NotificationService notificationService) {
        this.contratRepository = contratRepository;
        this.candidatureRepository = candidatureRepository;
        this.userAppRepository = userAppRepository;
        this.notificationService = notificationService;
    }

    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository,
                          UserAppRepository userAppRepository) {
        this(contratRepository, candidatureRepository, userAppRepository, null);
    }

    private record EtudiantEmployeurAnnee(Long etudiantId, Long employeurId, int annee) {
    }

    @Transactional(readOnly = true)
    public List<CandidaturePourContratDto> getCandidaturesPourContrat() {
        return getCandidaturesPourContrat(null);
    }

    @Transactional(readOnly = true)
    public List<CandidaturePourContratDto> getCandidaturesPourContrat(Integer annee) {
        List<Candidature> candidatures = new ArrayList<>();
        candidatures.addAll(candidatureRepository.findByStatut(StatutCandidature.EMBAUCHEE));
        candidatures.addAll(candidatureRepository.findByStatut(StatutCandidature.ACCEPTEE));

        List<Candidature> distinctCandidatures = candidatures.stream().distinct().toList();
        Set<EtudiantEmployeurAnnee> contratsExistants = new HashSet<>();
        List<Candidature> sansContrat = new ArrayList<>();

        for (Candidature c : distinctCandidatures) {
            Optional<Contrat> contratOpt = contratRepository.findByCandidatureId(c.getId());
            if (contratOpt.isPresent()) {
                EtudiantEmployeurAnnee cle = cleContrat(c);
                if (cle != null) {
                    contratsExistants.add(cle);
                }
            } else {
                sansContrat.add(c);
            }
        }

        return sansContrat.stream()
                .filter(c -> {
                    EtudiantEmployeurAnnee cle = cleContrat(c);
                    return (cle == null || !contratsExistants.contains(cle))
                            && (annee == null || (c.getOffreStage() != null && annee.equals(c.getOffreStage().getAnnee())));
                })
                .map(c -> CandidaturePourContratDto.create(c, Optional.empty()))
                .toList();
    }

    private EtudiantEmployeurAnnee cleContrat(Candidature c) {
        Etudiant etudiant = c.getEtudiant();
        OffreStage offre = c.getOffreStage();
        Employeur employeur = c.getEmployeur();
        if (etudiant == null || offre == null || employeur == null
                || etudiant.getId() == null || employeur.getId() == null) {
            return null;
        }
        return new EtudiantEmployeurAnnee(etudiant.getId(), employeur.getId(), offre.getAnnee());
    }

    public ContratDto creerContrat(CreationContratRequest request, String gestionnaireEmail) throws Exception {
        validerRequeteContrat(request);

        Candidature candidature = candidatureRepository.findById(request.candidatureId())
                .orElseThrow(() -> new Exception("Candidature introuvable avec l'identifiant : " + request.candidatureId()));

        if (candidature.getStatut() != StatutCandidature.EMBAUCHEE && candidature.getStatut() != StatutCandidature.ACCEPTEE) {
            throw new Exception("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");
        }

        if (contratRepository.existsByCandidatureId(candidature.getId())) {
            throw new Exception("Un contrat existe dans pour cet étudiant et cet employeur.");
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

        Contrat savedContrat = contratRepository.save(contrat);
        if (notificationService != null) {
            if (candidature.getEtudiant() != null && candidature.getEtudiant().getId() != null) {
                notificationService.pushNotification(
                        Notification.contratCreatedForEtudiant(savedContrat),
                        candidature.getEtudiant().getId());
            }
            if (candidature.getEmployeur() != null && candidature.getEmployeur().getId() != null) {
                notificationService.pushNotification(
                        Notification.contratCreatedForEmployeur(savedContrat),
                        candidature.getEmployeur().getId());
            }
        }

        return ContratDto.create(savedContrat);
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
        if (!signature.isValid()) {
            throw new Exception("signature est invalide");
        }
        validerSignatairePourContrat(contrat, utilisateur);
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

        validerSignatairePourRejet(contrat, utilisateur);
        contrat.rejeter(utilisateur);
        return ContratDto.create(contratRepository.save(contrat));
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getTousLesContrats() {
        return getTousLesContrats(null);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getTousLesContrats(Integer annee) {
        return ContratDto.create(filtrerContratsParAnnee(contratRepository.findAllByOrderByDateCreationDesc(), annee));
    }

    @Transactional(readOnly = true)
    public ContratDto getContratById(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return ContratDto.create(contrat);
    }

    @Transactional(readOnly = true)
    public byte[] getContratPdf(Long id) throws Exception {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new Exception("Contrat introuvable avec l'identifiant : " + id));
        return contrat.getData();
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEtudiant(String email) {
        return getContratsEtudiant(email, null);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEtudiant(String email, Integer annee) {
        return ContratDto.create(filtrerContratsParAnnee(contratRepository.findByCandidatureEtudiantEmail(email), annee));
    }

    @Transactional(readOnly = true)
    public List<Integer> getAnneesContratsEtudiant(String email) {
        Set<Integer> annees = new TreeSet<>(Collections.reverseOrder());
        annees.add(AcademicSessionUtils.getAnneeActuelle());
        List<Contrat> contrats = contratRepository.findByCandidatureEtudiantEmail(email);
        if (contrats != null) {
            for (Contrat contrat : contrats) {
                if (contrat.getOffreStage() != null) {
                    annees.add(contrat.getOffreStage().getAnnee());
                }
            }
        }
        return new ArrayList<>(annees);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEmployeur(String email) {
        return getContratsEmployeur(email, null);
    }

    @Transactional(readOnly = true)
    public List<ContratDto> getContratsEmployeur(String email, Integer annee) {
        return ContratDto.create(filtrerContratsParAnnee(contratRepository.findByCandidatureOffreStageEmployeurEmail(email), annee));
    }

    private List<Contrat> filtrerContratsParAnnee(List<Contrat> contrats, Integer annee) {
        if (contrats == null || annee == null) {
            return contrats != null ? contrats : List.of();
        }
        return contrats.stream()
                .filter(c -> c.getOffreStage() != null && annee.equals(c.getOffreStage().getAnnee()))
                .toList();
    }

    private static final int MAX_HORAIRE_LENGTH = 255;
    private static final int MAX_SALAIRE_LENGTH = 100;
    private static final int MAX_TEXT_LENGTH = 5000;

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
        if (request.horaire().trim().length() > MAX_HORAIRE_LENGTH) {
            throw new Exception("L'horaire de travail ne peut pas dépasser " + MAX_HORAIRE_LENGTH + " caractères.");
        }
        if (request.salaire().trim().length() > MAX_SALAIRE_LENGTH) {
            throw new Exception("Le salaire ne peut pas dépasser " + MAX_SALAIRE_LENGTH + " caractères.");
        }
        if (request.descriptionTaches().trim().length() > MAX_TEXT_LENGTH) {
            throw new Exception("La description des tâches ne peut pas dépasser " + MAX_TEXT_LENGTH + " caractères.");
        }
        if (request.conditions().trim().length() > MAX_TEXT_LENGTH) {
            throw new Exception("Les conditions de travail ne peuvent pas dépasser " + MAX_TEXT_LENGTH + " caractères.");
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

    private void validerSignatairePourContrat(Contrat contrat, UserApp utilisateur) throws Exception {
        if (contrat.getStatut() == StatutContrat.REFUSE) {
            throw new Exception("Le contrat a été refusé");
        }
        if (utilisateur instanceof Etudiant etudiant) {
            if (!Objects.equals(etudiant.getId(), contrat.getEtudiant().getId())) {
                throw new Exception("signataire est invalide");
            }
            if (contrat.isSigneParEtudiant()) {
                throw new Exception("signature existe déjà");
            }
            if (aDejaSigneUnAutreContrat(etudiant, contrat)) {
                throw new Exception("Vous avez déjà signé un contrat de stage et ne pouvez pas en signer plusieurs.");
            }
        } else if (utilisateur instanceof Employeur employeur) {
            if (!Objects.equals(employeur.getId(), contrat.getEmployeur().getId())) {
                throw new Exception("signataire est invalide");
            }
            if (contrat.isSigneParEmployeur()) {
                throw new Exception("signature existe déjà");
            }
        } else if (utilisateur instanceof Gestionnaire) {
            if (contrat.isSigneParGestionnaire()) {
                throw new Exception("signature existe déjà");
            }
            if (!contrat.isSigneParEtudiant() || !contrat.isSigneParEmployeur()) {
                throw new Exception("L'étudiant et l'employeur doivent avoir signé le contrat avant le gestionnaire.");
            }
        } else {
            throw new Exception("signataire inconnu");
        }
    }

    private void validerSignatairePourRejet(Contrat contrat, UserApp utilisateur) throws Exception {
        if (contrat.getStatut() == StatutContrat.REFUSE) {
            throw new Exception("Le contrat a deja ete refuse");
        }        if (utilisateur instanceof Etudiant etudiant) {
            if (!Objects.equals(etudiant.getId(), contrat.getEtudiant().getId())) {
                throw new Exception("signataire est invalide");
            }
        } else if (utilisateur instanceof Employeur employeur) {
            if (!Objects.equals(employeur.getId(), contrat.getEmployeur().getId())) {
                throw new Exception("signataire est invalide");
            }
        } else if (!(utilisateur instanceof Gestionnaire)) {
            throw new Exception("signataire inconnu");
        }
    }

    private boolean aDejaSigneUnAutreContrat(Etudiant etudiant, Contrat contratActuel) {
        List<Contrat> contratsEtudiant = contratRepository.findByCandidatureEtudiantEmail(etudiant.getEmail());
        if (contratsEtudiant == null) {
            return false;
        }
        int anneeContrat = contratActuel.getOffreStage() != null
                ? contratActuel.getOffreStage().getAnnee()
                : AcademicSessionUtils.getAnneeActuelle();
        return contratsEtudiant.stream()
                .anyMatch(c -> c != contratActuel
                        && (contratActuel.getId() == null || !Objects.equals(c.getId(), contratActuel.getId()))
                        && c.isSigneParEtudiant()
                        && c.getStatut() != StatutContrat.REFUSE
                        && (c.getOffreStage() == null || c.getOffreStage().getAnnee() == anneeContrat));
    }
}