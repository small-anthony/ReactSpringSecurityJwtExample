import {BASE_URL} from "../../components/config/Config.jsx";

export async function getCvsEnAttente(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/cv/en-attente`, {
        headers: authHeader,
    });

    if (!response.ok) throw new Error("Erreur lors de la récupération des CVs");

    return response.json();
}

export async function accepterCv(id, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/cv/accepter`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify({ id, message: null })
    });

    if (!response.ok) throw new Error("Erreur lors de l'acceptation du CV");

    return response.json();
}

export async function refuserCv(id, message, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/cv/refuser`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify({ id, message })
    });

    if (!response.ok) throw new Error("Erreur lors du refus du CV");

    return response.json();
}

export async function voirCvPdf(id, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/cv/pdf`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...authHeader
        },
        body: JSON.stringify({ id, message: null })
    });

    if (!response.ok) throw new Error("Impossible d'ouvrir le PDF");

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    return URL.createObjectURL(pdfBlob);
}

export async function getEtudiantsInscrits(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/rapports/etudiants-inscrits`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants inscrits");
    return response.json();
}
export async function getEtudiantsSansConvocation(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/rapports/etudiants-sans-convocation`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants sans convocation");
    return response.json();
}
export async function getEtudiantsAttenteEntrevue(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/rapports/etudiants-attente-entrevue`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants en attente d'entrevue");
    return response.json();
}
export async function getEtudiantsAttenteReponse(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/rapports/etudiants-attente-reponse`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants en attente de réponse");
    return response.json();
}
export async function getEtudiantsTrouveStage(authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/rapports/etudiants-trouve-stage`, {
        headers: authHeader,
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants ayant trouvé un stage");
    return response.json();
}

