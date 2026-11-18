export function contientTexte(texteSource, texteRecherche) {
    if (typeof texteSource !== "string") {
        return false;
    }
    return texteSource.toLowerCase().includes(texteRecherche);
}

export function contientMotCleVirtuel(texte) {
    return (
        texte.includes("teams") ||
        texte.includes("meet") ||
        texte.includes("zoom") ||
        texte.includes("http")
    );
}

export function estLienVirtuel(lieu) {
    if (typeof lieu !== "string") {
        return false;
    }
    return contientMotCleVirtuel(lieu.toLowerCase());
}

export function extrairePremierElement(liste) {
    if (!Array.isArray(liste) || liste.length === 0) {
        return null;
    }
    return liste[0];
}

export function extraireCreneauEntrevue(convocation) {
    if (!convocation) {
        return null;
    }
    const { rendezVousSelection, rendezVousPossibles, dateHeure, lieu } = convocation;
    if (rendezVousSelection) {
        return rendezVousSelection;
    }
    const premierPossible = extrairePremierElement(rendezVousPossibles);
    if (premierPossible) {
        return premierPossible;
    }
    if (dateHeure) {
        return { date: dateHeure, lieu };
    }
    return null;
}

export function extraireTitreOffre(offreStage) {
    if (!offreStage) {
        return null;
    }
    return offreStage.titre;
}

export function extraireNomEntrepriseOffre(offreStage) {
    if (!offreStage) {
        return null;
    }
    return offreStage.nomEntreprise;
}

export function extraireTitreConvocation(convocation, titreParDefaut) {
    if (!convocation) {
        return titreParDefaut;
    }
    const { offreStage, titrePoste } = convocation;
    return extraireTitreOffre(offreStage) || titrePoste || titreParDefaut;
}

export function extraireEntrepriseConvocation(convocation, entrepriseParDefaut) {
    if (!convocation) {
        return entrepriseParDefaut;
    }
    const { offreStage, nomEntreprise } = convocation;
    return extraireNomEntrepriseOffre(offreStage) || nomEntreprise || entrepriseParDefaut;
}

export function extraireIdOffreConvocation(convocation) {
    if (!convocation) {
        return null;
    }
    const { offreStage, offreId } = convocation;
    if (offreStage && offreStage.id !== undefined) {
        return offreStage.id;
    }
    return offreId !== undefined ? offreId : null;
}

export function estConvocationActive(convocation, contrats = [], candidaturesParOffre = {}) {
    if (!convocation) {
        return false;
    }
    const offreId = extraireIdOffreConvocation(convocation);
    if (offreId !== null && offreId !== undefined) {
        const contratAssocie = contrats.find(
            (c) => c.offreId === offreId || String(c.offreId) === String(offreId)
        );
        if (contratAssocie) {
            return false;
        }
        const candidature = candidaturesParOffre[offreId];
        if (candidature && (candidature.statut === "EMBAUCHEE" || candidature.statut === "REFUSEE")) {
            return false;
        }
    }
    return true;
}

export function extrairePremiereCandidature(offre) {
    if (!offre) {
        return null;
    }
    return extrairePremierElement(offre.candidatures);
}

export function obtenirStatutCandidature(offre, candidaturesParOffre, contrats = []) {
    if (!offre) {
        return "EN_ATTENTE";
    }
    const contratAssocie = contrats.find(
        (c) => c.offreId === offre.id || String(c.offreId) === String(offre.id)
    );
    if (contratAssocie && contratAssocie.statut === "REFUSE") {
        return "REFUSE";
    }
    const candidature = candidaturesParOffre[offre.id] || extrairePremiereCandidature(offre);
    if (!candidature || !candidature.statut) {
        return "EN_ATTENTE";
    }
    return candidature.statut;
}

export function estContratSigneNonRefuse(contrat) {
    if (!contrat) {
        return false;
    }
    return Boolean(contrat.signeParEtudiant) && contrat.statut !== "REFUSE";
}

export function estContratActifNonArchive(contrat) {
    if (!estContratSigneNonRefuse(contrat)) {
        return false;
    }
    return !contientTexte(contrat.titreOffre, "archive");
}

export function trouverContratSigneActif(contrats, contratsASigner) {
    const nonArchive = contrats.filter(estContratActifNonArchive);
    if (nonArchive.length > 0) {
        return nonArchive.find((c) => c.statut === "COMPLETE") || nonArchive[0];
    }
    if (contratsASigner.length > 0) {
        return null;
    }
    return (
        contrats.find((c) => c.statut === "COMPLETE") ||
        contrats.find(estContratSigneNonRefuse) ||
        null
    );
}

export function calculerScoreStatut(statut) {
    if (statut === "EMBAUCHEE") return 4;
    if (statut === "ACCEPTE" || statut === "ACCEPTEE") return 3;
    if (statut === "EN_ATTENTE" || statut === "EN_ATTENTE_REPONSE") return 2;
    if (statut === "REFUSEE" || statut === "REFUSE") return 1;
    return 0;
}

export function aDesCandidaturesEnCours(mesCandidaturesOffres = [], candidaturesParOffre = {}, contrats = []) {
    return mesCandidaturesOffres.some((offre) => {
        const contratAssocie = contrats.find(
            (c) => c.offreId === offre.id || String(c.offreId) === String(offre.id)
        );
        if (contratAssocie) {
            return false;
        }
        const statut = obtenirStatutCandidature(offre, candidaturesParOffre, contrats);
        return statut === "EN_ATTENTE" || statut === "EN_ATTENTE_REPONSE";
    });
}

export function construireStatutParcours({
    contratsASigner,
    contratSigneActif,
    candidaturesEmbauchees,
    convocationsEnAttente,
    convocationsConfirmees,
    cvState,
    mesCandidaturesOffres,
    candidaturesParOffre = {},
    contrats = [],
    t
}) {
    const statutContratActif = contratSigneActif ? contratSigneActif.statut : null;
    const { cvExiste, status: statutCv } = cvState;

    if (contratsASigner.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.contract_to_sign"),
            tone: "bg-amber-50 text-amber-800 border-amber-200",
            dot: "bg-amber-500"
        };
    }
    if (statutContratActif === "COMPLETE") {
        return {
            label: t("etudiant_dashboard.journey_status.contract_validated"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (contratSigneActif) {
        return {
            label: t("etudiant_dashboard.journey_status.stage_found"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (candidaturesEmbauchees.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.hired_waiting_contract"),
            tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
            dot: "bg-emerald-500"
        };
    }
    if (convocationsEnAttente.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.interview_pending"),
            tone: "bg-amber-50 text-amber-800 border-amber-200",
            dot: "bg-amber-500"
        };
    }
    if (convocationsConfirmees.length > 0) {
        return {
            label: t("etudiant_dashboard.journey_status.interview_confirmed"),
            tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
            dot: "bg-indigo-500"
        };
    }
    if (cvExiste === false || statutCv === "REFUSE") {
        return {
            label: t("etudiant_dashboard.journey_status.cv_required"),
            tone: "bg-rose-50 text-rose-800 border-rose-200",
            dot: "bg-rose-500"
        };
    }
    if (aDesCandidaturesEnCours(mesCandidaturesOffres, candidaturesParOffre, contrats)) {
        return {
            label: t("etudiant_dashboard.journey_status.applications_in_progress"),
            tone: "bg-blue-50 text-blue-800 border-blue-200",
            dot: "bg-blue-500"
        };
    }
    return {
        label: t("etudiant_dashboard.journey_status.searching"),
        tone: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-blue-500"
    };
}

