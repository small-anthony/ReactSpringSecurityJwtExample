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

export async function getEtudiantsSansConvocation(authHeader, annee = null) {
    const url = annee
        ? `${BASE_URL}/gestionnaire/rapports/etudiants-sans-convocation?annee=${annee}`
        : `${BASE_URL}/gestionnaire/rapports/etudiants-sans-convocation`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants sans convocation");
    return response.json();
}

export async function getEtudiantsAttenteEntrevue(authHeader, annee = null) {
    const url = annee
        ? `${BASE_URL}/gestionnaire/rapports/etudiants-attente-entrevue?annee=${annee}`
        : `${BASE_URL}/gestionnaire/rapports/etudiants-attente-entrevue`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants en attente d'entrevue");
    return response.json();
}

export async function getEtudiantsAttenteReponse(authHeader, annee = null) {
    const url = annee
        ? `${BASE_URL}/gestionnaire/rapports/etudiants-attente-reponse?annee=${annee}`
        : `${BASE_URL}/gestionnaire/rapports/etudiants-attente-reponse`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants en attente de réponse");
    return response.json();
}

export async function getEtudiantsTrouveStage(authHeader, annee = null) {
    const url = annee
        ? `${BASE_URL}/gestionnaire/rapports/etudiants-trouve-stage?annee=${annee}`
        : `${BASE_URL}/gestionnaire/rapports/etudiants-trouve-stage`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants ayant trouvé un stage");
    return response.json();
}

export async function getEtudiantsPourAssignation(authHeader, annee = null) {
    const url = annee
        ? `${BASE_URL}/gestionnaire/assignation-professeurs/etudiants?annee=${annee}`
        : `${BASE_URL}/gestionnaire/assignation-professeurs/etudiants`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des étudiants pour assignation");
    return response.json();
}

export async function getProfesseursPourAssignation(authHeader, nom = null) {
    const url = nom && nom.trim().length > 0
        ? `${BASE_URL}/gestionnaire/assignation-professeurs/professeurs?nom=${encodeURIComponent(nom.trim())}`
        : `${BASE_URL}/gestionnaire/assignation-professeurs/professeurs`;
    const response = await fetch(url, { headers: authHeader });
    if (!response.ok) throw new Error("Erreur lors de la récupération des professeurs");
    return response.json();
}

export async function assignerProfesseur(etudiantId, professeurId, authHeader, professeurNom = null) {
    const response = await fetch(`${BASE_URL}/gestionnaire/assignation-professeurs`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify({ etudiantId, professeurId, professeurNom })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'assignation du professeur");
    }

    return response.json();
}

export async function modifierAssignationProfesseur(etudiantId, professeurId, authHeader, professeurNom = null) {
    const response = await fetch(`${BASE_URL}/gestionnaire/assignation-professeurs`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            ...authHeader,
        },
        body: JSON.stringify({ etudiantId, professeurId, professeurNom })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la modification de l'assignation");
    }

    return response.json();
}

export async function desassignerProfesseur(etudiantId, authHeader) {
    const response = await fetch(`${BASE_URL}/gestionnaire/assignation-professeurs/${etudiantId}`, {
        method: 'DELETE',
        headers: authHeader,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de la désassignation du professeur");
    }

    return response.json();
}
