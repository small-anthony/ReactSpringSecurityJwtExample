import { BASE_URL } from "../../components/config/Config";

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

export const fetchOffresEnAttente = async (authHeader) => {
  const response = await fetch(`${BASE_URL}/gestionnaire/offre/pending`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    }
  });
  if (!response.ok) throw new Error("Erreur de récupération");
  return response.json();
};

export const accepterOffre = async (id, etudiantsIds, authHeader) => {
  const response = await fetch(`${BASE_URL}/gestionnaire/offre/accepterOffre`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ id, etudiantsIds }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'acceptation");
  }

  return response.json();
};

export const refuserOffre = async (id, message, authHeader) => {
  const response = await fetch(`${BASE_URL}/gestionnaire/offre/refuserOffre`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
    body: JSON.stringify({ id, commentaire: message }),
  });
  if (!response.ok) {
    throw new Error("Erreur lors du refus");
  }
  return response.json();
};
