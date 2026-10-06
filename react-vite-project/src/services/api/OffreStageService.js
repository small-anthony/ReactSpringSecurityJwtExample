import { BASE_URL } from "../../components/config/Config";
import APIHelper from "../../utils/APIHelper.ts";

export async function createOffreStage(offreOrTitre, description, nomEntreprise, discipline, duree, salaire, exigences, authHeader) {
  let bodyData;
  let headers;

  if (typeof offreOrTitre === "object" && offreOrTitre !== null) {
    bodyData = offreOrTitre;
    headers = description;
  } else if (typeof discipline === "object" && discipline !== null && !duree) {
    bodyData = { titre: offreOrTitre, description, nomEntreprise };
    headers = discipline;
  } else {
    bodyData = {
      titre: offreOrTitre,
      description,
      nomEntreprise,
      discipline,
      duree,
      salaire,
      exigences,
    };
    headers = authHeader;
  }

  const response = await fetch(`${BASE_URL}/employeur/creerOffre`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(bodyData),
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

  const json = await response.json();
  return json;
}


export async function getCandidatures(offreId, authHeader) {
  const response = await fetch(`${BASE_URL}/employeur/offres/${offreId}/candidatures`, {
    headers: authHeader,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de charger les candidatures");
  }

  return response.json();
}

export async function getCvCandidat(candidatureId, authHeader) {
  const response = await fetch(`${BASE_URL}/employeur/candidatures/${candidatureId}/cv`, {
    headers: authHeader,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de charger le CV");
  }

  return response.blob();
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

export async function postuler(authHeader, offreId) {
  const response = await APIHelper.post(`/etudiant/offres/${offreId}`, authHeader);

  if(!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}


