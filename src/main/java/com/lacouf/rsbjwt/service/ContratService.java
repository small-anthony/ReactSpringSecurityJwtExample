package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.*;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.auth.Role;
import com.lacouf.rsbjwt.model.embeddable.Signature;
import com.lacouf.rsbjwt.presentation.RequestDto.CreationContratRequest;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.repository.ContratRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.CandidaturePourContratDto;
import com.lacouf.rsbjwt.service.dto.ContratDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.lacouf.rsbjwt.model.ENUM.StatutContrat;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;

@Service
@Transactional(rollbackFor = Exception.class)
public class ContratService {

    private final ContratRepository contratRepository;
    private final CandidatureRepository candidatureRepository;
    private final UserAppRepository userAppRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final NotificationService notificationService;

    @Autowired
    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository,
                          UserAppRepository userAppRepository,
                          GestionnaireRepository gestionnaireRepository,
                          NotificationService notificationService) {
        this.contratRepository = contratRepository;
        this.candidatureRepository = candidatureRepository;
        this.userAppRepository = userAppRepository;
        this.gestionnaireRepository = gestionnaireRepository;
        this.notificationService = notificationService;
    }

    public ContratService(ContratRepository contratRepository,
                          CandidatureRepository candidatureRepository,
                          UserAppRepository userAppRepository) {
        this(contratRepository, candidatureRepository, userAppRepository, null, null);
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
        candidatures.addAll(candidatureRepository.findByStatut(StatutCandidature.EN_ATTENTE_CHOIX_STAGE));
        candidatures.addAll(candidatureRepository.findByStatut(StatutCandidature.EMBAUCHEE));

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

        validerEligibiliteCandidature(candidature);

        Contrat contrat = new Contrat(
                candidature,
                request.dateDebut(),
                request.dateFin(),
                request.horaire().trim(),
                request.salaire().trim(),
                request.descriptionTaches().trim(),
                request.conditions().trim());

        candidature.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
        candidatureRepository.save(candidature);
        Contrat savedContrat = contratRepository.save(contrat);
        notifierCreationContrat(candidature, savedContrat);
        return ContratDto.create(savedContrat);
    }

    public ContratDto genererContratAutomatique(Long candidatureId) throws Exception {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new Exception("Candidature introuvable avec l'identifiant : " + candidatureId));

        validerEligibiliteCandidature(candidature);

        OffreStage offre = candidature.getOffreStage();
        int annee = offre != null ? offre.getAnnee() : AcademicSessionUtils.getAnneeActuelle();
        validerAbsenceAutreStageActif(candidature, annee);
        LocalDate dateDebut = LocalDate.of(annee, 5, 11);
        long semaines = extraireSemainesDuree(offre != null ? offre.getDuree() : null);
        LocalDate dateFin = dateDebut.plusWeeks(semaines);
        String horaire = "Du lundi au vendredi, 9h à 17h (35h/semaine)";
        String salaire = (offre != null && !estVide(offre.getSalaire())) ? offre.getSalaire().trim() : "Non spécifié";
        String descriptionTaches = (offre != null && !estVide(offre.getDescription()))
                ? offre.getDescription().trim()
                : (offre != null && !estVide(offre.getTitre()) ? offre.getTitre().trim() : "Stage en informatique");
        String conditions = (offre != null && !estVide(offre.getExigences()))
                ? offre.getExigences().trim()
                : "Conditions standards du milieu de stage.";

        Contrat contrat = new Contrat(
                candidature,
                dateDebut,
                dateFin,
                horaire,
                salaire,
                descriptionTaches,
                conditions);

        candidature.setStatut(StatutCandidature.EN_ATTENTE_SIGNATURE);
        candidatureRepository.save(candidature);
        refuserAutresCandidaturesEtudiant(candidature, annee);
        Contrat savedContrat = contratRepository.save(contrat);
        notifierCreationContrat(candidature, savedContrat);
        return ContratDto.create(savedContrat);
    }

    private void notifierCreationContrat(Candidature candidature, Contrat savedContrat) {
        if (notificationService == null || candidature == null) {
            return;
        }
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
        if (contrat.getStatut() == StatutContrat.COMPLETE && contrat.getCandidature() != null) {
            contrat.getCandidature().setStatut(StatutCandidature.EMBAUCHEE);
            candidatureRepository.save(contrat.getCandidature());
        }

        Contrat contratSauvegarde = contratRepository.save(contrat);
        if (!(utilisateur instanceof Gestionnaire)
                && contratSauvegarde.getStatut() == StatutContrat.SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR) {
            notifierGestionnaires(() -> Notification.contratPretPourSignatureGestionnaire(contratSauvegarde));
        }

        return ContratDto.create(contratSauvegarde);
    }

    public ContratDto rejeterContrat(Long contratId, String actorEmail) throws Exception {
        UserApp utilisateur = userAppRepository.findUserAppByEmail(actorEmail)
                .orElseThrow(() -> new Exception("Utilisateur introuvable"));

        Contrat contrat = contratRepository.findById(contratId)
                .orElseThrow(() -> new Exception("Contrat introuvable"));

        validerSignatairePourRejet(contrat, utilisateur);
        contrat.rejeter(utilisateur);
        if (contrat.getCandidature() != null) {
            contrat.getCandidature().setStatut(StatutCandidature.REFUSEE);
            candidatureRepository.save(contrat.getCandidature());
        }
        Contrat contratSauvegarde = contratRepository.save(contrat);
        if (utilisateur instanceof Etudiant || utilisateur instanceof Employeur) {
            notifierGestionnaires(() -> Notification.contratRefuse(contratSauvegarde));
        }
        return ContratDto.create(contratSauvegarde);
    }

    private void notifierGestionnaires(Supplier<Notification> notificationFactory) {
        if (notificationService == null || gestionnaireRepository == null) {
            return;
        }
        gestionnaireRepository.findAll().forEach(gestionnaire ->
                notificationService.pushNotification(notificationFactory.get(), gestionnaire.getId())
        );
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
        return ContratPdfGenerator.generer(contrat, getNomGestionnaire());
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

    private void validerEligibiliteCandidature(Candidature candidature) throws Exception {
        if (candidature.getStatut() != StatutCandidature.EN_ATTENTE_CHOIX_STAGE
                && candidature.getStatut() != StatutCandidature.EMBAUCHEE) {
            throw new Exception("L'étudiant n'a pas été embauché par l'employeur, impossible de créer un contrat.");
        }
        if (contratRepository.existsByCandidatureId(candidature.getId())) {
            throw new Exception("Un contrat existe dans pour cet étudiant et cet employeur.");
        }
    }

    private void validerAbsenceAutreStageActif(Candidature candidatureChoisie, int annee) throws Exception {
        if (candidatureChoisie.getEtudiant() == null) {
            return;
        }
        List<Candidature> candidaturesEtudiant = candidatureRepository.findByEtudiant(candidatureChoisie.getEtudiant());
        if (candidaturesEtudiant == null) {
            return;
        }
        boolean dejaStageActif = candidaturesEtudiant.stream()
                .anyMatch(autre -> !Objects.equals(autre.getId(), candidatureChoisie.getId())
                        && (autre.getOffreStage() == null || autre.getOffreStage().getAnnee() == annee)
                        && (autre.getStatut() == StatutCandidature.EN_ATTENTE_SIGNATURE
                                || autre.getStatut() == StatutCandidature.EMBAUCHEE));
        if (dejaStageActif) {
            throw new Exception("Vous avez déjà un stage en cours ou confirmé pour cette session.");
        }
    }

    private long extraireSemainesDuree(String duree) {
        if (estVide(duree)) {
            return 15L;
        }
        Matcher matcher = Pattern.compile("(\\d{1,3})").matcher(duree);
        if (matcher.find()) {
            long valeur = Long.parseLong(matcher.group(1));
            if (valeur > 0) {
                return valeur;
            }
        }
        return 15L;
    }

    private void refuserAutresCandidaturesEtudiant(Candidature candidatureChoisie, int annee) {
        if (candidatureChoisie.getEtudiant() == null) {
            return;
        }
        List<Candidature> candidaturesEtudiant = candidatureRepository.findByEtudiant(candidatureChoisie.getEtudiant());
        if (candidaturesEtudiant == null) {
            return;
        }
        LocalDateTime maintenant = LocalDateTime.now();
        for (Candidature autre : candidaturesEtudiant) {
            if (Objects.equals(autre.getId(), candidatureChoisie.getId())) {
                continue;
            }
            if (autre.getOffreStage() != null && autre.getOffreStage().getAnnee() != annee) {
                continue;
            }
            if (autre.getStatut() != StatutCandidature.REFUSEE) {
                autre.setStatut(StatutCandidature.REFUSEE);
                autre.setMessageReponse("L'étudiant a choisi une autre offre de stage.");
                autre.setDateDecision(maintenant);
                candidatureRepository.save(autre);
            }
        }
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