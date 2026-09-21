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
