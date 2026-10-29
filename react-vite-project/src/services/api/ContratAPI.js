import { BASE_URL } from "../../components/config/Config.jsx";

export async function getCandidaturesAccepteesPourContrat(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/contrats/candidatures-acceptees`, {
        headers: authHeader,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des candidatures");
    }
    return response.json();
}

export async function creerContrat(data, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/contrats`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la création du contrat");
    }
    return response.json();
}

export async function getTousLesContrats(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/contrats`, {
        headers: authHeader,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des contrats");
    }
    return response.json();
}

export async function getContratDocumentBlob(id, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/contrats/${id}/document`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Impossible de télécharger le document du contrat");
    return response.blob();
}
