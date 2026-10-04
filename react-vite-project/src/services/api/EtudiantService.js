import { BASE_URL } from "../../components/config/Config";

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



export async function getMesCandidatures(authHeader) {
  const response = await APIHelper.get("/etudiant/candidatures", authHeader);

  if(!response.ok) {
    throw new Error(await response.text() || "Unknown error")
  }

  return await response.json();
}
export async function verifierMatricule(matricule, authHeader) {
  const response = await fetch(`${BASE_URL}/etudiant/matricule/${matricule}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader, // On passe l'objet de sécurité correctement !
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Étudiant non trouvé");
  }
  return response.json();
}
