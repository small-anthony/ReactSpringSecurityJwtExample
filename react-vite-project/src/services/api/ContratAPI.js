import { BASE_URL } from "../../components/config/Config.jsx";
import APIHelper from "../../utils/APIHelper.ts";

export async function getCandidaturesAccepteesPourContrat(authHeader) {
    const response = await APIHelper.get(`/contrats/candidatures-acceptees`, authHeader);
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

export async function getTousLesContrats(authHeader) {
    const response = await APIHelper.get(`/contrats`, authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération des contrats");
    }
    return response.json();
}

export async function getContratDocumentBlob(id, authHeader) {
    const response = await fetch(`/contrats/${id}/document`, authHeader);
    if (!response.ok) {
        throw new Error("Impossible de télécharger le document du contrat");
    }
    return response.blob();
}

export async function signerContrat(id, signatureData, authHeader) {
    const response = await APIHelper.post_raw(`/contrats/${id}/signer`, authHeader, signatureData);
    if (!response.ok) {
        throw new Error(await response.text() || "Erreur interne");
    }
    return response.json();
}

export async function rejeterContrat(id, authHeader) {
    const response = await APIHelper.post(`/contrats/${id}/rejeter`, authHeader);
    if (!response.ok) {
        throw new Error(await response.text() || "Erreur interne");
    }
    return response.json();
}