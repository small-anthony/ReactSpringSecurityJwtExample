import { BASE_URL } from "../../components/config/Config";

export async function registerProfesseur(professeurData) {
  const response = await fetch(`${BASE_URL}/professeur/inscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(professeurData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "defaultError");
  }

  return response.json();
}

export async function getEtudiantsAssignes(authHeader, annee = null) {
  const url = annee
    ? `${BASE_URL}/professeur/etudiants-assignes?annee=${annee}`
    : `${BASE_URL}/professeur/etudiants-assignes`;
  const response = await fetch(url, { headers: authHeader });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération des étudiants assignés");
  }
  return response.json();
}

export async function getEtudiantDetail(etudiantId, authHeader) {
  const response = await fetch(`${BASE_URL}/professeur/etudiants-assignes/${etudiantId}`, {
    headers: authHeader,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération des détails de l'étudiant");
  }
  return response.json();
}

export async function getAnneesProfesseur(authHeader) {
  const response = await fetch(`${BASE_URL}/professeur/annees`, {
    headers: authHeader,
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function getDossierStage(etudiantId, authHeader) {
  const response = await fetch(`${BASE_URL}/professeur/etudiants/${etudiantId}/stage`, {
    headers: authHeader,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération du dossier de stage");
  }
  return response.json();
}

export async function getEvaluationMilieu(etudiantId, authHeader) {
  const response = await fetch(`${BASE_URL}/professeur/etudiants/${etudiantId}/evaluation-milieu`, {
    headers: authHeader,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Évaluation du milieu de stage introuvable");
  }
  return response.json();
}

export async function soumettreEvaluationMilieu(etudiantId, payload, authHeader) {
  const response = await fetch(`${BASE_URL}/professeur/etudiants/${etudiantId}/evaluation-milieu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la soumission de l'évaluation du milieu");
  }
  return response.json();
}
