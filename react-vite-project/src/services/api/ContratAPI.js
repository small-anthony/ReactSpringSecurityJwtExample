import { BASE_URL } from "../../components/config/Config.jsx";
import APIHelper from "../../utils/APIHelper.ts";

const avecAnnee = (endpoint, annee) =>
    annee !== null && annee !== undefined ? `${endpoint}?annee=${annee}` : endpoint;

export async function getCandidaturesAccepteesPourContrat(authHeader, annee = null) {
    const response = await APIHelper.get(avecAnnee(`/contrats/candidatures-acceptees`, annee), authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des candidatures");
    }
    return response.json();
}

export async function creerContrat(data, authHeader) {
    const response = await APIHelper.post(`/contrats`, authHeader, data);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la création du contrat");
    }
    return response.json();
}

export async function getTousLesContrats(authHeader, annee = null) {
    const response = await APIHelper.get(avecAnnee(`/contrats`, annee), authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des contrats");
    }
    return response.json();
}

export async function getContratsEtudiant(authHeader, annee = null) {
    const response = await APIHelper.get(avecAnnee(`/contrats/etudiant`, annee), authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération de vos contrats");
    }
    return response.json();
}

export async function getAnneesContratsEtudiant(authHeader) {
    const response = await APIHelper.get(`/contrats/etudiant/annees`, authHeader);
    if (!response.ok) {
        return [];
    }
    return response.json();
}

export async function getContratsEmployeur(authHeader, annee = null) {
    const response = await APIHelper.get(avecAnnee(`/contrats/employeur`, annee), authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération de vos contrats");
    }
    return response.json();
}

export async function getContratDocumentBlob(id, authHeader) {
    const response = await fetch(`${BASE_URL}/contrats/${id}/document`, {
        headers: authHeader,
    });
    if (!response.ok) {
        throw new Error("Impossible de télécharger le document du contrat");
    }
    return response.blob();
}

export async function signerContrat(id, signatureFile, authHeader) {
    const formData = new FormData();
    formData.append("signature", signatureFile);
    const response = await fetch(`${BASE_URL}/contrats/${id}/signer`, {
        method: "POST",
        headers: {
            Authorization: authHeader.Authorization || authHeader.authorization,
        },
        body: formData,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la signature du contrat");
    }
    return response.json();
}

export async function rejeterContrat(id, authHeader) {
    const token = authHeader?.Authorization || authHeader?.authorization || (typeof authHeader === "string" ? authHeader : "");
    const response = await fetch(`${BASE_URL}/contrats/${id}/rejeter`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors du refus du contrat");
    }
    return response.json();
}

export async function choisirStageEtGenererContrat(candidatureId, authHeader) {
    const response = await APIHelper.post(`/contrats/generer/${candidatureId}`, authHeader, {});
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la sélection du stage");
    }
    return response.json();
}
