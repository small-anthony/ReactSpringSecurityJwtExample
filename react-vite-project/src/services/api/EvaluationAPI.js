import APIHelper from "../../utils/APIHelper.ts";

async function lireErreur(response, messageParDefaut) {
    const texte = await response.text();
    try {
        const json = JSON.parse(texte);
        return json.message || json.error || messageParDefaut;
    } catch {
        return texte || messageParDefaut;
    }
}

export async function getStagiaires(authHeader) {
    const response = await APIHelper.get(`/evaluations/stagiaires`, authHeader);
    if (!response.ok) {
        throw new Error(await lireErreur(response, "Erreur lors de la récupération de vos stagiaires"));
    }
    return response.json();
}

export async function getStagiaire(contratId, authHeader) {
    const response = await APIHelper.get(`/evaluations/stagiaires/${contratId}`, authHeader);
    if (!response.ok) {
        throw new Error(await lireErreur(response, "Stagiaire introuvable"));
    }
    return response.json();
}

export async function getEvaluation(contratId, authHeader) {
    const response = await APIHelper.get(`/evaluations/contrats/${contratId}`, authHeader);
    if (!response.ok) {
        throw new Error(await lireErreur(response, "Évaluation introuvable"));
    }
    return response.json();
}

export async function soumettreEvaluation(contratId, data, authHeader) {
    const response = await APIHelper.post(`/evaluations/contrats/${contratId}`, authHeader, data);
    if (!response.ok) {
        throw new Error(await lireErreur(response, "Erreur lors de l'enregistrement de l'évaluation"));
    }
    return response.json();
}