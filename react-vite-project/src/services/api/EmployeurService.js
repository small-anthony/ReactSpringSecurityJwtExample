import { BASE_URL } from "../../components/config/Config";

export async function registerEmployeur(employeurData) {
  const response = await fetch(`${BASE_URL}/employeur/inscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeurData),
  });

  if (!response.ok) {
    const messageErreur = await response.text();
    throw new Error(messageErreur || "defaultError");
  }

  return await response.json();
}
