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

export async function getContratsEtudiant(authHeader) {
    const response = await APIHelper.get(`/contrats/etudiant`, authHeader);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la récupération de vos contrats");
    }
    return response.json();
}

export async function getContratsEmployeur(authHeader) {
    const response = await APIHelper.get(`/contrats/employeur`, authHeader);
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
