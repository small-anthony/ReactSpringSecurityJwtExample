package com.lacouf.rsbjwt.service;

import com.lacouf.rsbjwt.model.Employeur;
import com.lacouf.rsbjwt.model.Gestionnaire;
import com.lacouf.rsbjwt.model.Notification;
import com.lacouf.rsbjwt.model.OffreStage;
import com.lacouf.rsbjwt.model.UserApp;
import com.lacouf.rsbjwt.repository.EmployeurRepository;
import com.lacouf.rsbjwt.repository.GestionnaireRepository;
import com.lacouf.rsbjwt.repository.OffreStageRepository;
import com.lacouf.rsbjwt.repository.UserAppRepository;
import com.lacouf.rsbjwt.service.dto.OffreStageDto;
import com.lacouf.rsbjwt.util.AcademicSessionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.lacouf.rsbjwt.model.Cv;
import com.lacouf.rsbjwt.model.Candidature;
import com.lacouf.rsbjwt.model.Convocation;
import com.lacouf.rsbjwt.model.ENUM.StatutCandidature;
import com.lacouf.rsbjwt.model.ENUM.StatutConvocation;
import com.lacouf.rsbjwt.repository.CandidatureRepository;
import com.lacouf.rsbjwt.service.dto.CandidatureDto;

@Service
public class EmployeurService {
    private final UserAppRepository userAppRepository;
    private final EmployeurRepository employeurRepository;
    private final OffreStageRepository offreStageRepository;
    private final CandidatureRepository candidatureRepository;
    private final NotificationService notificationService;
    private final GestionnaireRepository gestionnaireRepository;
    private final ContratService contratService;

    @Autowired
    public EmployeurService(UserAppRepository userAppRepository,
                            EmployeurRepository employeurRepository,
                            OffreStageRepository offreStageRepository,
                            CandidatureRepository candidatureRepository,
                            NotificationService notificationService,
                            GestionnaireRepository gestionnaireRepository,
                            ContratService contratService) {
        this.userAppRepository = userAppRepository;
        this.employeurRepository = employeurRepository;
        this.offreStageRepository = offreStageRepository;
        this.candidatureRepository = candidatureRepository;
        this.notificationService = notificationService;
        this.gestionnaireRepository = gestionnaireRepository;
        this.contratService = contratService;
    }

    public EmployeurService(UserAppRepository userAppRepository,
                            EmployeurRepository employeurRepository,
                            OffreStageRepository offreStageRepository,
                            CandidatureRepository candidatureRepository,
                            NotificationService notificationService,
                            GestionnaireRepository gestionnaireRepository) {
        this(userAppRepository, employeurRepository, offreStageRepository, candidatureRepository, notificationService, gestionnaireRepository, null);
    }

    public EmployeurService(UserAppRepository userAppRepository,
                            EmployeurRepository employeurRepository,
                            OffreStageRepository offreStageRepository,
                            CandidatureRepository candidatureRepository) {
        this(userAppRepository, employeurRepository, offreStageRepository, candidatureRepository, null, null, null);
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String adresse, String ville, String codePostal, String telephone,
                                          String emailEmployeur, Integer annee) throws Exception {
        return createOffreStage(titre, nomEntreprise, description, discipline, duree, salaire, exigences,
                adresse, ville, codePostal, telephone, emailEmployeur, annee, null, null);
    }

    public OffreStageDto createOffreStage(String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String adresse, String ville, String codePostal, String telephone,
                                          String emailEmployeur, Integer annee,
                                          LocalDate dateDebut, LocalDate dateFin) throws Exception {
        if (titre == null || titre.trim().isEmpty()) {
            throw new Exception("Le titre est obligatoire");
        }

        if (nomEntreprise == null || nomEntreprise.trim().isEmpty()) {
            throw new Exception("Le nom de l'entreprise est obligatoire");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new Exception("La description est obligatoire");
        }

        validerLieuEtContact(adresse, ville, codePostal, telephone);
        validerDatesOffre(dateDebut, dateFin);

        if (emailEmployeur == null || emailEmployeur.trim().isEmpty()) {
            throw new Exception("Le courriel de l'employeur est obligatoire");
        }

        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        OffreStage offreStage = new OffreStage(
                titre.trim(),
                description.trim(),
                nomEntreprise.trim(),
                discipline != null && !discipline.trim().isEmpty() ? discipline.trim() : null,
                salaire != null && !salaire.trim().isEmpty() ? salaire.trim() : null,
                duree != null && !duree.trim().isEmpty() ? duree.trim() : null,
                exigences != null && !exigences.trim().isEmpty() ? exigences.trim() : null
        );
        offreStage.setAdresse(adresse.trim());
        offreStage.setVille(ville.trim());
        offreStage.setCodePostal(codePostal.trim().toUpperCase());
        offreStage.setTelephone(telephone.trim());
        offreStage.setDateDebut(dateDebut);
        offreStage.setDateFin(dateFin);

        if (annee != null && annee > 0) {
            if (annee < AcademicSessionUtils.getAnneeActuelle()) {
                throw new Exception("Impossible de créer une offre pour une ancienne session.");
            }
            offreStage.setAnnee(annee);
        }

        employeur.ajouterOffre(offreStage);

        OffreStage savedOffre = offreStageRepository.save(offreStage);
        if (notificationService != null && gestionnaireRepository != null) {
            List<Gestionnaire> gestionnaires = gestionnaireRepository.findAll();
            gestionnaires.forEach(gestionnaire ->
                    notificationService.pushNotification(Notification.offreCreated(savedOffre), gestionnaire.getId())
            );
        }

        return OffreStageDto.create(savedOffre);
    }

    public List<OffreStageDto> getOffres(String emailEmployeur) throws Exception {
        return getOffres(emailEmployeur, null);
    }

    public List<OffreStageDto> getOffres(String emailEmployeur, Integer annee) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        List<OffreStage> offres = (annee != null)
                ? offreStageRepository.findWithCandidaturesByEmployeurAndAnnee(employeur, annee)
                : offreStageRepository.findWithCandidaturesByEmployeur(employeur);

        List<OffreStageDto> dtos = new ArrayList<>(OffreStageDto.create(offres));
        dtos.sort((a, b) -> Integer.compare(b.id(), a.id()));

        return dtos;
    }

    public List<Integer> getAnnees(String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        Set<Integer> annees = new TreeSet<>(Collections.reverseOrder());

        annees.add(AcademicSessionUtils.getAnneeActuelle());

        annees.addAll(offreStageRepository.findDistinctAnneesByEmployeur(employeur));

        return new ArrayList<>(annees);
    }

    public List<CandidatureDto> getCandidatures(Long offreId, String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        return candidatureRepository.findByOffreStage(offre).stream()
                .map(CandidatureDto::create)
                .collect(Collectors.toList());
    }

    public byte[] getCvCandidat(Long candidatureId, String emailEmployeur) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        Candidature candidature = candidatureRepository.findByIdAndOffreStageEmployeur(candidatureId, employeur)
                .orElseThrow(() -> new Exception("Candidature introuvable pour cet employeur"));

        Cv cv = candidature.getEtudiant().getCv();
        if (cv == null || cv.getData() == null) {
            throw new Exception("Aucun CV disponible pour ce candidat");
        }

        return cv.getData();
    }

    public CandidatureDto refuserCandidature(Long candidatureId, String message, String emailEmployeur) throws Exception {
        String messageNettoye = (message == null || message.trim().isEmpty()) ? null : message.trim();
        return repondre(candidatureId, emailEmployeur,
                EnumSet.of(StatutCandidature.EN_ATTENTE_CONVOCATION, StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE, StatutCandidature.ENTREVUE_REFUSEE, StatutCandidature.EN_ATTENTE_ENTREVUE, StatutCandidature.EN_ATTENTE_CHOIX_STAGE),
                StatutCandidature.REFUSEE, messageNettoye,
                "Cette candidature a déjà reçu une réponse");
    }

    public CandidatureDto embaucherCandidature(Long candidatureId, String emailEmployeur) throws Exception {
        CandidatureDto dto = repondre(candidatureId, emailEmployeur,
                EnumSet.of(StatutCandidature.EN_ATTENTE_ENTREVUE),
                StatutCandidature.EN_ATTENTE_CHOIX_STAGE, null,
                "L'entrevue doit être confirmée par l'étudiant avant l'embauche");
        if (contratService != null) {
            contratService.genererContratAutomatique(candidatureId);
            return candidatureRepository.findById(candidatureId)
                    .map(CandidatureDto::create)
                    .orElse(dto);
        }
        return dto;
    }

    private CandidatureDto repondre(Long candidatureId, String emailEmployeur,
                                    Set<StatutCandidature> statutsAutorises,
                                    StatutCandidature nouveauStatut, String message,
                                    String erreurStatut) throws Exception {
        UserApp user = userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Utilisateur non trouvé avec l'email : " + emailEmployeur));

        Employeur employeur = employeurRepository.findById(user.getId())
                .orElseThrow(() -> new Exception("Employeur non trouvé avec cette id"));

        Candidature candidature = candidatureRepository.findByIdAndOffreStageEmployeur(candidatureId, employeur)
                .orElseThrow(() -> new Exception("Candidature introuvable pour cet employeur"));

        if (candidature.getOffreStage() != null
                && candidature.getOffreStage().getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible d'effectuer cette action sur une ancienne session.");
        }

        if (!statutsAutorises.contains(candidature.getStatut())) {
            throw new Exception(erreurStatut);
        }

        candidature.setStatut(nouveauStatut);
        candidature.setMessageReponse(message);
        candidature.setDateDecision(LocalDateTime.now());
        Candidature sauvegardee = candidatureRepository.save(candidature);

        return CandidatureDto.create(sauvegardee);
    }

    public void deleteOffre(Long offreId, String emailEmployeur) throws Exception {
        Employeur employeur = (Employeur) userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Employeur non trouvé"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        if (offre.getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible de supprimer une offre d'une ancienne session.");
        }

        offre.supprimer();

        Set<StatutCandidature> statutsARefuser = EnumSet.of(
                StatutCandidature.EN_ATTENTE_CONVOCATION,
                StatutCandidature.EN_ATTENTE_CONFIRMATION_ENTREVUE,
                StatutCandidature.EN_ATTENTE_ENTREVUE,
                StatutCandidature.ENTREVUE_REFUSEE,
                StatutCandidature.EN_ATTENTE_CHOIX_STAGE
        );
        List<Candidature> candidatures = candidatureRepository.findByOffreStage(offre);
        for (Candidature candidature : candidatures) {
            if (statutsARefuser.contains(candidature.getStatut())) {
                if (candidature.getConvocations() != null) {
                    for (Convocation convocation : candidature.getConvocations()) {
                        if (convocation.getStatut() == StatutConvocation.EN_ATTENTE) {
                            convocation.annuler();
                        }
                    }
                }
                refuserCandidature(candidature.getId(), "L'offre a été supprimée par l'employeur", emailEmployeur);
            }
        }

        offreStageRepository.save(offre);
    }

    public OffreStageDto updateOffreStage(Long offreId, String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String adresse, String ville, String codePostal, String telephone,
                                          String emailEmployeur) throws Exception {
        return updateOffreStage(offreId, titre, nomEntreprise, description, discipline, duree, salaire, exigences,
                adresse, ville, codePostal, telephone, emailEmployeur, null, null);
    }

    public OffreStageDto updateOffreStage(Long offreId, String titre, String nomEntreprise, String description,
                                          String discipline, String duree, String salaire, String exigences,
                                          String adresse, String ville, String codePostal, String telephone,
                                          String emailEmployeur,
                                          LocalDate dateDebut, LocalDate dateFin) throws Exception {

        if (titre == null || titre.trim().isEmpty()) {
            throw new Exception("Le titre est obligatoire");
        }

        if (nomEntreprise == null || nomEntreprise.trim().isEmpty()) {
            throw new Exception("Le nom de l'entreprise est obligatoire");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new Exception("La description est obligatoire");
        }

        validerLieuEtContact(adresse, ville, codePostal, telephone);
        validerDatesOffre(dateDebut, dateFin);

        Employeur employeur = (Employeur) userAppRepository.findUserAppByEmail(emailEmployeur)
                .orElseThrow(() -> new Exception("Employeur non trouvé"));

        OffreStage offre = offreStageRepository.findByIdAndEmployeurAndDateSuppressionIsNull(offreId, employeur)
                .orElseThrow(() -> new Exception("Offre introuvable pour cet employeur"));

        if (offre.getAnnee() < AcademicSessionUtils.getAnneeActuelle()) {
            throw new Exception("Impossible de modifier une offre d'une ancienne session.");
        }

        offre.setTitre(titre.trim());
        offre.setNomEntreprise(nomEntreprise.trim());
        offre.setDescription(description.trim());
        offre.setDiscipline(discipline != null && !discipline.trim().isEmpty() ? discipline.trim() : null);
        offre.setDuree(duree != null && !duree.trim().isEmpty() ? duree.trim() : null);
        offre.setSalaire(salaire != null && !salaire.trim().isEmpty() ? salaire.trim() : null);
        offre.setExigences(exigences != null && !exigences.trim().isEmpty() ? exigences.trim() : null);
        offre.setAdresse(adresse.trim());
        offre.setVille(ville.trim());
        offre.setCodePostal(codePostal.trim().toUpperCase());
        offre.setTelephone(telephone.trim());
        if (dateDebut != null && dateFin != null) {
            offre.setDateDebut(dateDebut);
            offre.setDateFin(dateFin);
        }

        offre.reinitialiserApprobation();

        return OffreStageDto.create(offreStageRepository.save(offre));
    }

    private void validerDatesOffre(LocalDate dateDebut, LocalDate dateFin) throws Exception {
        if ((dateDebut != null && dateFin == null) || (dateDebut == null && dateFin != null)) {
            throw new Exception("Les dates de début et de fin sont obligatoires ensemble");
        }
        if (dateDebut != null && !dateFin.isAfter(dateDebut)) {
            throw new Exception("La date de fin doit être postérieure à la date de début");
        }
    }

    private void validerLieuEtContact(String adresse, String ville, String codePostal, String telephone) throws Exception {
        if (adresse == null || adresse.trim().isEmpty()) {
            throw new Exception("L'adresse est obligatoire");
        }

        if (ville == null || ville.trim().isEmpty()) {
            throw new Exception("La ville est obligatoire");
        }

        if (codePostal == null || codePostal.trim().isEmpty()) {
            throw new Exception("Le code postal est obligatoire");
        }

        if (!codePostal.trim().matches("^[A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d$")) {
            throw new Exception("Le code postal est invalide");
        }

        if (telephone == null || telephone.trim().isEmpty()) {
            throw new Exception("Le téléphone est obligatoire");
        }

        String chiffres = telephone.replaceAll("\\D", "");
        boolean caracteresValides = telephone.trim().matches("^\\+?[0-9 ().-]+$");
        if (!caracteresValides || chiffres.length() < 10 || chiffres.length() > 15) {
            throw new Exception("Le numéro de téléphone est invalide");
        }
    }
}
