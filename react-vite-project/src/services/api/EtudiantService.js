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
