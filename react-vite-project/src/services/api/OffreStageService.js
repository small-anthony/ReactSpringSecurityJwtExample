import { BASE_URL } from "../../components/config/Config";
import APIHelper from "../../utils/APIHelper.ts";

export async function createOffreStage(titre, description, nomEntreprise, authHeader) {
  const response = await fetch(`${BASE_URL}/employeur/creerOffre`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ titre, description, nomEntreprise }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "defaultError");
  }

  return response.json();
}

export async function getOffresStages(authHeader) {
  const response = await fetch(`${BASE_URL}/employeur/offres`, {
    headers: authHeader,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de charger les offres");
  }

  return response.json();
}

export async function postuler(authHeader, offreId) {
  const response = await APIHelper.post(`/etudiant/offres/${offreId}`, authHeader);

  if(!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}