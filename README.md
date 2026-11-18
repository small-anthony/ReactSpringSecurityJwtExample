# Rapport des Définitions de « Done » (Sprint 5)

## Scrum master : Alrik
## Modèle Général de Définition de "Done"
- [x] Tâches complétées
- [x] Tests validés
- [x] Critères de succès respectés

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé

- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé



## 1. [EQ2-110] FIX-Sprint4

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-136` : Remplacement de l'affichage infini du CV PDF (`ModalCvPdf`) par un défilement continu avec `react-pdf`, sans manipulation directe du DOM (suivi de la page courante par le calcul de la hauteur des pages, affichage des pages voisines seulement) et remplacement du bouton Imprimer par un lien d'ouverture du PDF.
  - [x] `EQ2-135` : Correction de la page des candidatures de l'employeur (`CandidaturesOffre`) : un candidat embauché n'affiche plus la boîte de date d'entrevue.
  - [x] Révision de la loi de Déméter : délégation dans `Contrat` (`nomEtudiant()`, `nomSuperviseur()`, etc.), `Candidature.messageRefusConvocation()`, `Convocation.motifRefus()` et `Etudiant.approuverCv()`.
  - [x] `EQ2-132` : FE - je vois les rapports des étudiants
  - [x] `EQ2-133` : BE - je vois les rapports des étudiants
  - [x] `EQ2-131` : Ameliorer le UX de la page d'etudiant
  - [x] `EQ2-137` : Assurer le meme design sur tout le site
  - [x] `EQ2-111` : Ameliorer le landing page du gestionnaire
  - [x] `EQ2-140` : Modification du contrat avec Itext
  - [x] `EQ2-134` : Plan de demo - Je vois les rapports des etudiants
  - [x] `EQ2-138` : Assurer la gestion d'historique des donnees a tout les acteurs
  - [x] `EQ2-139` : Notifier l'etudiant de l'embauche
- [x] **Tests validés**
  - [x] Backend : `CandidatureDtoTest` (exposition de la dernière convocation seulement, motif de refus de la dernière convocation).
  - [x] Frontend : `CandidaturesOffre.test.jsx` (4 tests ajoutés : boîte jaune d'entrevue en attente, boîte verte d'entrevue confirmée, aucune boîte pour une candidature acceptée sans convocation, aucune boîte pour un candidat embauché).
- [x] **Critères de succès respectés**
  - [x] Le visualiseur de CV affiche toutes les pages en défilement continu et indique « Page X / Y » selon la page au centre.
  - [x] Un candidat embauché n'affiche plus de date d'entrevue ; les boîtes jaune et verte ne s'affichent que dans les bons états.
  - [x] Les appels en chaîne (`getX().getY()`) sont remplacés par des méthodes de délégation dans le modèle.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---

## 2. [EQ2-21] En tant que gestionnaire, j'assigne un prof à un stagiaire

### Définitions de "Done"
> **À COMPLÉTER par la personne qui a réalisé cette story** : remplacer les lignes entre crochets par les vrais numéros de tâches, classes, fichiers de tests et critères. Supprimer cette note ensuite.

- [ ] **Tâches complétées**
  - [ ] `EQ2-XXX` : [Backend : service, contrôleur et modèle pour l'assignation d'un professeur à un stagiaire]
  - [ ] `EQ2-XXX` : [Frontend : page `AssignationProfesseurs` et appels API]
- [ ] **Tests validés**
  - [ ] Backend : [classes de tests et cas couverts]
  - [ ] Frontend : [fichiers de tests et nombre de tests]
- [ ] **Critères de succès respectés**
  - [ ] [Le gestionnaire voit la liste des stagiaires et des professeurs disponibles]
  - [ ] [L'assignation est enregistrée et visible après rechargement]
  - [ ] [Cas d'erreur gérés : stagiaire déjà assigné, professeur introuvable]
  - [ ] Support bilingue FR / EN

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---

## 3. [EQ2-22] En tant que prof, j'évalue le milieu de stage

### Définitions de "Done"
> **À COMPLÉTER par la personne qui a réalisé cette story** : remplacer les lignes entre crochets par les vrais numéros de tâches, classes, fichiers de tests et critères. Supprimer cette note ensuite.

- [ ] **Tâches complétées**
  - [ ] `EQ2-XXX` : [Backend : modèle, service et contrôleur de l'évaluation du milieu de stage]
  - [ ] `EQ2-XXX` : [Frontend : page et formulaire d'évaluation du milieu de stage]
- [ ] **Tests validés**
  - [ ] Backend : [classes de tests et cas couverts]
  - [ ] Frontend : [fichiers de tests et nombre de tests]
- [ ] **Critères de succès respectés**
  - [ ] [Le professeur évalue seulement les milieux de ses stagiaires assignés]
  - [ ] [La grille est enregistrée une seule fois par stage]
  - [ ] [Validation des champs obligatoires avec messages explicites]
  - [ ] Support bilingue FR / EN

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---

## 4. [EQ2-23] En tant qu'employeur, j'évalue mon stagiaire

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-XXX` : Modèle et persistance : entité `Evaluation` (relation un-à-un avec `Contrat`), énumérations `SectionEvaluation`, `CritereEvaluation` (22 critères), `NiveauAccord`, `AppreciationGlobale` et `AccueilProchainStage`, `EvaluationRepository`.
  - [x] `EQ2-XXX` : Backend : `EvaluationService` (liste des stagiaires, consultation, enregistrement avec validation), `EvaluationController` (`/evaluations`), DTO `StagiaireDto`, `EvaluationDto` et `EvaluationRequest`, accès réservé au rôle employeur dans `SecurityConfiguration`.
  - [x] `EQ2-XXX` : Frontend : page « Mes stagiaires » (`EmployeurStagiaires`) avec onglets Tous / À évaluer / Évalués, formulaire d'évaluation (`EvaluationStagiaire`) basé sur la fiche d'évaluation du Collège André-Laurendeau, mode lecture seule après l'envoi, service `EvaluationAPI`, routes et lien « Mes stagiaires » dans le profil employeur.
  - [x] `EQ2-XXX` : Validation des champs avec messages d'erreur affichés à l'endroit du champ manquant et lien vers la première erreur.
  - [x] Traductions FR / EN des textes de la fiche.
- [x] **Tests validés**
  - [x] Backend : `EvaluationServiceTest` (19 tests : liste, consultation, enregistrement, contrat d'un autre employeur, déjà évalué, contrat incomplet, chaque règle de validation) et `EvaluationControllerTest` (8 tests : statuts 200, 201, 400 et 404).
  - [x] Frontend : `EvaluationStagiaire.test.jsx` (21 tests), `EmployeurStagiaires.test.jsx` (10 tests), `EvaluationAPI.test.js` (12 tests) et un test du lien « Mes stagiaires » dans `ProfileEmployeur.test.jsx`.
- [x] **Critères de succès respectés**
  - [x] Seuls les stagiaires dont le contrat est complété (signé par toutes les parties) apparaissent dans la liste de l'employeur.
  - [x] L'employeur remplit les 22 critères, l'appréciation globale, les heures d'encadrement, l'accueil d'un prochain stage et les informations du signataire.
  - [x] Un champ manquant affiche son erreur directement dans la section concernée.
  - [x] Un stagiaire ne peut être évalué qu'une seule fois ; l'évaluation est ensuite consultable en lecture seule (badge « Évalué », bouton « Voir l'évaluation »).
  - [x] Un employeur ne peut évaluer que les stagiaires de ses propres contrats.
  - [x] Support bilingue FR / EN complet.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---

## 5. [EQ2-24] En tant que système, je notifie le gestionnaire d'un nouveau CV

### Définitions de "Done"
> **À COMPLÉTER par la personne qui a réalisé cette story** : remplacer les lignes entre crochets par les vrais numéros de tâches, classes, fichiers de tests et critères. Supprimer cette note ensuite.

- [ ] **Tâches complétées**
  - [ ] `EQ2-XXX` : [Backend : création de la notification lors du téléversement d'un CV]
  - [ ] `EQ2-XXX` : [Frontend : affichage des notifications pour le gestionnaire]
- [ ] **Tests validés**
  - [ ] Backend : [classes de tests et cas couverts]
  - [ ] Frontend : [fichiers de tests et nombre de tests]
- [ ] **Critères de succès respectés**
  - [ ] [Le gestionnaire est notifié dès qu'un étudiant téléverse un CV]
  - [ ] [La notification mène vers l'approbation du CV]
  - [ ] [Une notification lue ne s'affiche plus comme nouvelle]
  - [ ] Support bilingue FR / EN

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---

## 6. [EQ2-26] En tant que système, je notifie l'étudiant que mon CV est accepté/refusé

### Définitions de "Done"
> **À COMPLÉTER par la personne qui a réalisé cette story** : remplacer les lignes entre crochets par les vrais numéros de tâches, classes, fichiers de tests et critères. Supprimer cette note ensuite.

- [ ] **Tâches complétées**
  - [ ] `EQ2-XXX` : [Backend : notification créée lors de l'acceptation ou du refus du CV, avec le motif de refus]
  - [ ] `EQ2-XXX` : [Frontend : affichage des notifications pour l'étudiant]
- [ ] **Tests validés**
  - [ ] Backend : [classes de tests et cas couverts]
  - [ ] Frontend : [fichiers de tests et nombre de tests]
- [ ] **Critères de succès respectés**
  - [ ] [L'étudiant est notifié quand son CV est accepté]
  - [ ] [L'étudiant est notifié avec le motif quand son CV est refusé]
  - [ ] [Les notifications sont visibles et peuvent être marquées comme lues]
  - [ ] Support bilingue FR / EN

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Créer un daily virtuel sur discord.
  - [ ] Respecté
  - [x] Aidé
  - [x] Préservé
- Avoir plus de communication avec tous les membres d'équipe sur discord.
  - [x] Respecté
  - [x] Aidé
  - [x] Préservé

---




# Rapport des Définitions de « Done » (Sprint 4)

## Scrum master : Valentin
## Modèle Général de Définition de "Done"
- [x] Tâches complétées
- [x] Tests validés
- [x] Critères de succès respectés

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

---






# Rapport des Définitions de « Done » (Sprint 3)

## Scrum master : Anthony
## Modèle Général de Définition de "Done"
- [x] Tâches complétées 
- [x] Tests validés
- [x] Critères de succès respectés 

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé



## 1. [EQ2-69] FIX-Sprint2 (Modification et suppression d'une offre)

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-76` : Implémentation backend dans `EmployeurService` des méthodes `updateOffreStage` et `deleteOffre` avec réinitialisation automatique au statut `EN_ATTENTE`.
  - [x] `EQ2-77` : Création de la modale de modification `ModalModifierOffre` et des actions de suppression sur la page profil employeur.
  - [x] Validation des champs obligatoires et gestion des messages d'erreur de saisie en temps réel.
- [x] **Tests validés**
  - [x] Backend : Tests unitaires dans `EmployeurServiceTest` (mise à jour, suppression, erreurs de validation, offre introuvable).
  - [x] Frontend : Tests dans `ModalModifierOffre.test.jsx` (4 tests) et `ProfileEmployeur.test.jsx` (7 tests).
- [x] **Critères de succès respectés**
  - [x] L'employeur peut modifier une offre existante ; l'offre repasse immédiatement au statut `En attente` pour réapprobation par le gestionnaire.
  - [x] L'employeur peut supprimer une offre, celle-ci disparaît instantanément de sa vue et de celle des étudiants.
  - [x] La validation des champs empêche la soumission d'offres incomplètes ou invalides avec des messages explicites.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté 
  - [ ] Aidé
  - [x] Préservé

---

## 2. [EQ2-4] En tant qu'étudiant, je téléverse mon CV

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-42` : Service et contrôleur backend `EtudiantService.uploadCv` avec validation multipart (format PDF, taille de fichier).
  - [x] `EQ2-43` : Composant React `ModalTeleverserCv` avec glisser-déposer, sélection de fichier et alertes d'erreur client.
  - [x] `EQ2-44` : Suivi du statut du CV (en attente, accepté, rejeté) et capacité de remplacer un CV existant.
- [x] **Tests validés**
  - [x] Backend : Tests unitaires dans `EtudiantServiceTest` (PDF valide, format non-conforme, fichier vide, remplacement de CV).
  - [x] Frontend : Tests dans `ModalTeleverserCv.test.jsx`.
- [x] **Critères de succès respectés**
  - [x] Seul le format PDF est accepté ; tout autre fichier (.png, .docx) est bloqué avec un message d'erreur clair.
  - [x] Le CV téléversé est sauvegardé en base de données et associé au profil de l'étudiant connecté.
  - [x] L'étudiant peut téléverser une nouvelle version pour remplacer son ancien CV.
  - [x] Statut du CV visible en temps réel (bannière ambrée si absent, bleue si `En attente`, verte si `Accepté`).
  - [x] Support bilingue FR / EN complet.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté 
  - [ ] Aidé
  - [x] Préservé

---

## 3. [EQ2-8] En tant que gestionnaire, j'accepte ou refuse une offre de stage

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-51` : Logique métier dans `GestionnaireService` (`accepterOffreStage` avec liste d'étudiants ciblés et `refuserOffreStage` avec motif obligatoire).
  - [x] `EQ2-52` : Endpoint de recherche avancée d'étudiants par mot-clé (nom, prénom, matricule) pour la sélection ciblée.
  - [x] `EQ2-53` : Interface React `ApprobationOffres` avec modales d'approbation ciblée et de refus avec justification.
- [x] **Tests validés**
  - [x] Backend : Tests unitaires dans `GestionnaireServiceTest` et `EtudiantServiceTest` (filtrage des offres autorisées pour l'étudiant ciblé vs non-ciblé).
  - [x] Frontend : Tests dans `ApprobationOffres.test.jsx` (4 tests).
- [x] **Critères de succès respectés**
  - [x] Consultation complète des détails de l'offre par le gestionnaire avant décision.
  - [x] Choix entre acceptation globale (tous les étudiants) ou restreinte (étudiants ciblés).
  - [x] Refus avec motif obligatoire (bouton désactivé tant qu'aucun motif valide n'est saisi).
  - [x] L'étudiant ciblé voit l'offre exclusive alors que l'étudiant non-ciblé ne la voit pas.
  - [x] Support bilingue FR / EN opérationnel.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

---

## 4. [EQ2-12] En tant qu'employeur, j'accepte ou refuse une candidature

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-66` : Contrôleur et service backend `EmployeurService` (`getCandidatures`, `getCvCandidat`, `accepterCandidature`, `refuserCandidature`).
  - [x] `EQ2-67` : Page frontend `CandidaturesOffre` avec cartes des candidats, compteur dynamique et modale de visualisation du CV PDF.
  - [x] `EQ2-68` : Page d'historique des décisions de l'employeur et garantie d'immuabilité d'une candidature déjà traitée.
- [x] **Tests validés**
  - [x] Backend : Tests unitaires dans `EmployeurServiceTest` (acceptation, refus avec message, rejet des doubles réponses).
  - [x] Frontend : Tests unitaires dans `CandidaturesOffre.test.jsx` (11 tests).
- [x] **Critères de succès respectés**
  - [x] Liste des étudiants ayant postulé disponible pour chaque offre avec compteur `Voir la candidature (N)`.
  - [x] Visualisation intégrée du CV PDF de chaque candidat.
  - [x] Décision d'acceptation ou de refus avec message explicatif optionnel.
  - [x] Immuabilité : une candidature traitée ne peut plus recevoir de nouvelle réponse.
  - [x] Historique chronologique complet des décisions consultable par l'employeur.
  - [x] Bilinguisme FR / EN fonctionnel sur toute l'interface.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé

---

## 5. [EQ2-14] En tant qu'étudiant, je répond à une convocation par la positive ou négative

### Définitions de "Done"
- [x] **Tâches complétées**
  - [x] `EQ2-73` : Backend Spring Boot (`ConvocationService`, modèle `Convocation`, embeddable `RendezVous`, et `ConvocationScheduler` pour l'expiration automatique).
  - [x] `EQ2-74` : Page `EtudiantConvocations` et composant `ConvocationCard` avec sélection de créneaux, confirmation, refus avec motif et filtres par statut.
  - [x] `EQ2-75` : Tableau de bord côté gestionnaire listant l'ensemble des entrevues et leur statut à jour.
- [x] **Tests validés**
  - [x] Backend : Tests unitaires dans `ConvocationServiceTest` (13 tests) et `EtudiantControllerTest`.
  - [x] Frontend : Tests dans `EtudiantConvocations.test.jsx` (6 tests) et `ConvocationCard.test.jsx`.
- [x] **Critères de succès respectés**
  - [x] Consultation complète des détails de l'entrevue (créneaux date/heure, lieu virtuel/physique, consignes, date limite).
  - [x] L'étudiant peut choisir son créneau et accepter l'entrevue ; l'information est enregistrée et confirmée.
  - [x] L'étudiant peut refuser une invitation avec transmission d'une justification.
  - [x] Expiration automatique : les convocations dont la date limite est passée deviennent `Expirée` et bloquent les boutons de réponse.
  - [x] Visibilité pour le gestionnaire avec tableau récapitulatif de toutes les entrevues.
  - [x] Support bilingue FR / EN complet.

### Points d'action
- Utiliser un chronomètre pour faire le log du temps
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
- Vérifier les plans de démo la veille pour corriger les incohérences
  - [x] Respecté
  - [ ] Aidé
  - [x] Préservé
