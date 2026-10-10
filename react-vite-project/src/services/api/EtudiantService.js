import { BASE_URL } from "../../components/config/Config";
import { getTokenCookie } from "../AuthService.tsx";

export async function registerEtudiant(etudiantData) {
  const response = await fetch(`${BASE_URL}/etudiant/inscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(etudiantData),
  });

  if (!response.ok) {
    const messageErreur = await response.text();
    throw new Error(messageErreur || "Erreur lors de l'inscription.");
  }

  return await response.json();
}



export async function verifierMatricule(matricule, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/matricule/${matricule}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Étudiant non trouvé");
  }
  return response.json();
}

export async function getMesCandidatures(authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/candidatures`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de récupérer les candidatures");
  }

  return response.json();
}
function getHeaders(authHeader) {
  if (authHeader) return authHeader;
  const token = getTokenCookie() || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getStatutCv(authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/cv/statut`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération du statut du CV");
  }

  return response.json();
}

export async function getOffresDisponibles(authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/offres`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération des offres");
  }

  return response.json();
}

export async function getOffreDetail(id, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/offres/${id}`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la récupération du détail de l'offre");
  }

  return response.json();
}

export async function rechercherEtudiants(query, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/recherche?motCle=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la recherche");
  }
  return response.json();
}
