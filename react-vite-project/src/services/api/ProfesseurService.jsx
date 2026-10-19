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
