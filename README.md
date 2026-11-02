# Rapport des Définitions de « Done » (Sprint 3)

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
