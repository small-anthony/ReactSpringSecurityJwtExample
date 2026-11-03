import { BASE_URL } from "../../components/config/Config";
import { getTokenCookie } from "../AuthService.tsx";
import APIHelper from "../../utils/APIHelper.ts";

function getHeaders(authHeader) {
  const token = getTokenCookie() || localStorage.getItem("token");
  const auth = (authHeader && authHeader.Authorization)
    ? authHeader.Authorization
    : (token ? `Bearer ${token}` : "");
  return {
    "Content-Type": "application/json",
    Authorization: auth,
  };
}

export async function getConvocationsEtudiant(authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/convocations`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de récupérer les convocations");
  }

  return response.json();
}

export async function getConvocationsAcceptees(authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/convocations/acceptees`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de récupérer les entrevues acceptées");
  }

  return response.json();
}

export async function proposeConvocation(candidatureId, message, rendezVousPossibles, authHeader) {
  const response = await APIHelper.post(`/employeur/candidatures/${candidatureId}/convoquer`, authHeader,
      {
        messageEmployeur: message,
        rendezVousPossibles: rendezVousPossibles,
      });

  if(!response.ok) {
    throw new Error(await response.text() || "Unknown error");
  }

  return response.json();
}

export async function accepterConvocation(id, rendezVousDto, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/convocations/${id}/accepter`, {
    method: "POST",
    headers: getHeaders(authHeader),
    body: JSON.stringify(rendezVousDto),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de l'acceptation de la convocation");
  }

  return response.json();
}

export async function refuserConvocation(id, motif, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/convocations/${id}/refuser`, {
    method: "POST",
    headers: getHeaders(authHeader),
    body: JSON.stringify({ motif }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors du refus de la convocation");
  }

  return response.json();
}

export async function proposerAutreDate(id, nouvelleDate, motif, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/convocations/${id}/conflit`, {
    method: "POST",
    headers: getHeaders(authHeader),
    body: JSON.stringify({ nouvelleDate, motif }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la proposition d'une nouvelle date");
  }

  return response.json();
}

export async function getConvocationsGestionnaire(authHeader) {
  const response = await fetch(`${BASE_URL}/gestionnaire/convocations`, {
    method: "GET",
    headers: getHeaders(authHeader),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Impossible de récupérer les convocations gestionnaire");
  }

  return response.json();
}
