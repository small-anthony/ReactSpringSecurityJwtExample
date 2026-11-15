export const CRITERES_MILIEU = [
    "TACHES_CONFORMES",
    "MESURES_ACCUEIL",
    "TEMPS_ENCADREMENT_SUFFISANT",
    "ENVIRONNEMENT_SECURITAIRE",
    "CLIMAT_TRAVAIL_AGREABLE",
    "ACCESSIBLE_TRANSPORT_COMMUN",
    "SALAIRE_INTERESSANT",
    "COMMUNICATION_SUPERVISEUR",
    "EQUIPEMENT_ADEQUAT",
    "VOLUME_TRAVAIL_ACCEPTABLE"
];

export const NIVEAUX = [
    "TOTALEMENT_EN_ACCORD",
    "PLUTOT_EN_ACCORD",
    "PLUTOT_EN_DESACCORD",
    "TOTALEMENT_EN_DESACCORD",
    "NON_APPLICABLE"
];

export const STAGES_CIBLES = ["PREMIER_STAGE", "DEUXIEME_STAGE"];
export const CAPACITES_ACCUEIL = ["UN", "DEUX", "TROIS", "PLUS_DE_TROIS"];
export const CODE_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

const CHAMPS_QUARTS = ["quart1Debut", "quart1Fin", "quart2Debut", "quart2Fin", "quart3Debut", "quart3Fin"];
const CHAMPS_STRING = [
    "nomEntreprise", "personneContact", "adresse", "ville", "codePostal", "telephone", "telecopieur",
    "nomStagiaire", "dateStage", "salaireHoraire", "commentaires", "milieuAPrivilegier",
    "nombreStagiairesAccueillis", ...CHAMPS_QUARTS, "signatureEnseignant", "dateEvaluation"
];

export const FORMULAIRE_INITIAL = {
    ...Object.fromEntries(CHAMPS_STRING.map((c) => [c, ""])),
    numeroStage: null,
    reponses: {},
    heuresEncadrementMois1: "",
    heuresEncadrementMois2: "",
    heuresEncadrementMois3: "",
    accueillirMemeStagiaire: null,
    quartsTravailVariables: null,
    dateEvaluation: new Date().toISOString().split("T")[0]
};

export const extraireSalaireTexte = (salaireBrut) => {
    if (!salaireBrut) return "";
    const match = String(salaireBrut).match(/\d+([.,]\d+)?/);
    if (match) {
        const val = parseFloat(match[0].replace(",", "."));
        if (!Number.isNaN(val)) return val.toFixed(2);
    }
    return String(salaireBrut).trim();
};

export const formulaireDepuisEvaluation = (evaluation) => ({
    ...Object.fromEntries(CHAMPS_STRING.map((c) => [c, evaluation[c] || ""])),
    numeroStage: evaluation.numeroStage ?? null,
    reponses: evaluation.reponses || {},
    heuresEncadrementMois1: String(evaluation.heuresEncadrementMois1 ?? ""),
    heuresEncadrementMois2: String(evaluation.heuresEncadrementMois2 ?? ""),
    heuresEncadrementMois3: String(evaluation.heuresEncadrementMois3 ?? ""),
    accueillirMemeStagiaire: evaluation.accueillirMemeStagiaire,
    quartsTravailVariables: evaluation.quartsTravailVariables
});

export const formulaireDepuisDossier = (dossierData) => ({
    ...FORMULAIRE_INITIAL,
    nomEntreprise: dossierData.nomEntreprise || "",
    personneContact: dossierData.personneContact || "",
    telephone: dossierData.telephoneEntreprise || "",
    nomStagiaire: dossierData.nomStagiaire || "",
    dateStage: dossierData.dateStage || "",
    salaireHoraire: extraireSalaireTexte(dossierData.salaireHoraire),
    signatureEnseignant: dossierData.nomProfesseur || "",
    dateEvaluation: new Date().toISOString().split("T")[0]
});

export const aReponseNegative = (reponses) =>
    Object.values(reponses || {}).some(
        (niveau) => niveau === "PLUTOT_EN_DESACCORD" || niveau === "TOTALEMENT_EN_DESACCORD"
    );

export const compterCriteresRepondus = (reponses) =>
    CRITERES_MILIEU.filter((c) => Boolean(reponses?.[c])).length;

const CHAMPS_TEXTE_OBLIGATOIRES = [
    ["nomEntreprise", "evaluation_milieu.errors.nom_entreprise"],
    ["personneContact", "evaluation_milieu.errors.personne_contact"],
    ["adresse", "evaluation_milieu.errors.adresse"],
    ["ville", "evaluation_milieu.errors.ville"],
    ["telephone", "evaluation_milieu.errors.telephone"],
    ["nomStagiaire", "evaluation_milieu.errors.nom_stagiaire"],
    ["dateStage", "evaluation_milieu.errors.date_stage"],
    ["salaireHoraire", "evaluation_milieu.errors.salaire"],
    ["milieuAPrivilegier", "evaluation_milieu.errors.milieu_privilegier"],
    ["nombreStagiairesAccueillis", "evaluation_milieu.errors.capacite_accueil"],
    ["signatureEnseignant", "evaluation_milieu.errors.signature"]
];

export const validerFormulaireEvaluationMilieu = (formulaire, t) => {
    const erreurs = {};
    for (const [champ, key] of CHAMPS_TEXTE_OBLIGATOIRES) {
        if (!String(formulaire[champ] || "").trim()) erreurs[champ] = t(key);
    }
    const codePostalTrim = formulaire.codePostal.trim();
    if (!codePostalTrim) {
        erreurs.codePostal = t("evaluation_milieu.errors.code_postal_required");
    } else if (!CODE_POSTAL_REGEX.test(codePostalTrim)) {
        erreurs.codePostal = t("evaluation_milieu.errors.code_postal_format");
    }
    if (formulaire.numeroStage !== 1 && formulaire.numeroStage !== 2) {
        erreurs.numeroStage = t("evaluation_milieu.errors.numero_stage");
    }
    for (const critere of CRITERES_MILIEU) {
        if (!formulaire.reponses[critere]) {
            erreurs[`critere_${critere}`] = t("evaluation_milieu.errors.critere_requis");
        }
    }
    for (const champ of ["heuresEncadrementMois1", "heuresEncadrementMois2", "heuresEncadrementMois3"]) {
        const texte = String(formulaire[champ]).trim().replace(",", ".");
        const val = Number(texte);
        if (texte === "" || Number.isNaN(val) || val < 0) {
            erreurs[champ] = t("evaluation_milieu.errors.heures_mois");
        }
    }
    if (aReponseNegative(formulaire.reponses) && !formulaire.commentaires.trim()) {
        erreurs.commentaires = t("evaluation_milieu.errors.commentaires_requis");
    }
    if (formulaire.accueillirMemeStagiaire === null) {
        erreurs.accueillirMemeStagiaire = t("evaluation_milieu.errors.meme_stagiaire");
    }
    if (formulaire.quartsTravailVariables === null) {
        erreurs.quartsTravailVariables = t("evaluation_milieu.errors.quarts_variables");
    } else if (formulaire.quartsTravailVariables === true) {
        if (!formulaire.quart1Debut.trim() || !formulaire.quart1Fin.trim()) {
            erreurs.quart1 = t("evaluation_milieu.errors.quart1_requis");
        }
        for (const idx of [2, 3]) {
            const debut = formulaire[`quart${idx}Debut`].trim();
            const fin = formulaire[`quart${idx}Fin`].trim();
            if ((debut && !fin) || (!debut && fin)) erreurs[`quart${idx}`] = t("evaluation_milieu.errors.quart_paire");
        }
    }
    return erreurs;
};

const parseHeures = (v) => Number(String(v).trim().replace(",", "."));

export const construirePayloadEvaluationMilieu = (formulaire) => {
    const q = formulaire.quartsTravailVariables;
    return {
        ...Object.fromEntries(CHAMPS_STRING.map((c) => [c, formulaire[c].trim()])),
        ...Object.fromEntries(CHAMPS_QUARTS.map((c) => [c, q ? formulaire[c].trim() : ""])),
        codePostal: formulaire.codePostal.trim().toUpperCase(),
        numeroStage: Number(formulaire.numeroStage),
        reponses: formulaire.reponses,
        heuresEncadrementMois1: parseHeures(formulaire.heuresEncadrementMois1),
        heuresEncadrementMois2: parseHeures(formulaire.heuresEncadrementMois2),
        heuresEncadrementMois3: parseHeures(formulaire.heuresEncadrementMois3),
        accueillirMemeStagiaire: formulaire.accueillirMemeStagiaire,
        quartsTravailVariables: q,
        dateEvaluation: formulaire.dateEvaluation
    };
};
