import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ClipboardCheck, ArrowLeft, AlertCircle, CheckCircle2, Check,
    GraduationCap, Building2, Briefcase, Calendar, Lock, Clock, DollarSign
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getDossierStage, getEvaluationMilieu, soumettreEvaluationMilieu } from "../../services/api/ProfesseurService.js";
import { getEvaluationMilieuEtudiant } from "../../services/api/GestionnaireService.js";

const CRITERES_MILIEU = [
    "TACHES_CONFORMES", "MESURES_ACCUEIL", "TEMPS_ENCADREMENT_SUFFISANT", "ENVIRONNEMENT_SECURITAIRE",
    "CLIMAT_TRAVAIL_AGREABLE", "ACCESSIBLE_TRANSPORT_COMMUN", "SALAIRE_INTERESSANT",
    "COMMUNICATION_SUPERVISEUR", "EQUIPEMENT_ADEQUAT", "VOLUME_TRAVAIL_ACCEPTABLE"
];
const NIVEAUX = ["TOTALEMENT_EN_ACCORD", "PLUTOT_EN_ACCORD", "PLUTOT_EN_DESACCORD", "TOTALEMENT_EN_DESACCORD", "NON_APPLICABLE"];
const STAGES_CIBLES = ["PREMIER_STAGE", "DEUXIEME_STAGE"];
const CAPACITES_ACCUEIL = ["UN", "DEUX", "TROIS", "PLUS_DE_TROIS"];
const CODE_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
const SALAIRE_REGEX = /^\d+([.,]\d{1,2})?$/;
const CHAMPS_QUARTS = ["quart1Debut", "quart1Fin", "quart2Debut", "quart2Fin", "quart3Debut", "quart3Fin"];
const CHAMPS_STRING = [
    "nomEntreprise", "personneContact", "adresse", "ville", "codePostal", "telephone", "telecopieur",
    "nomStagiaire", "dateStage", "salaireHoraire", "commentaires", "milieuAPrivilegier",
    "nombreStagiairesAccueillis", ...CHAMPS_QUARTS, "signatureEnseignant", "dateEvaluation"
];

const CHAMPS_SECTION_1 = [
    { id: "nom-entreprise", champ: "nomEntreprise", labelKey: "nom_entreprise" },
    { id: "personne-contact", champ: "personneContact", labelKey: "personne_contact" },
    { id: "adresse-entreprise", champ: "adresse", labelKey: "adresse", placeholderKey: "adresse_placeholder", spanClass: "md:col-span-2" },
    { id: "ville-entreprise", champ: "ville", labelKey: "ville", placeholderKey: "ville_placeholder" },
    { id: "code-postal-entreprise", champ: "codePostal", labelKey: "code_postal", placeholderKey: "code_postal_placeholder" },
    { id: "telephone-entreprise", champ: "telephone", labelKey: "telephone" },
    { id: "telecopieur-entreprise", champ: "telecopieur", labelKey: "telecopieur", placeholderKey: "telecopieur_placeholder", obligatoire: false }
];

const CHAMPS_TEXTE_OBLIGATOIRES = [
    ["nomEntreprise", "nom_entreprise"], ["personneContact", "personne_contact"], ["adresse", "adresse"],
    ["ville", "ville"], ["telephone", "telephone"], ["nomStagiaire", "nom_stagiaire"],
    ["dateStage", "date_stage"], ["milieuAPrivilegier", "milieu_privilegier"],
    ["nombreStagiairesAccueillis", "capacite_accueil"], ["signatureEnseignant", "signature"]
];

const FORMULAIRE_INITIAL = {
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

const extraireSalaireTexte = (salaireBrut) => {
    if (!salaireBrut) return "";
    const match = String(salaireBrut).match(/\d+([.,]\d+)?/);
    if (match) {
        const val = parseFloat(match[0].replace(",", "."));
        if (!Number.isNaN(val)) return val.toFixed(2);
    }
    return String(salaireBrut).trim();
};

const formulaireDepuisEvaluation = (ev) => ({
    ...Object.fromEntries(CHAMPS_STRING.map((c) => [c, ev[c] || ""])),
    numeroStage: ev.numeroStage ?? null,
    reponses: ev.reponses || {},
    heuresEncadrementMois1: String(ev.heuresEncadrementMois1 ?? ""),
    heuresEncadrementMois2: String(ev.heuresEncadrementMois2 ?? ""),
    heuresEncadrementMois3: String(ev.heuresEncadrementMois3 ?? ""),
    accueillirMemeStagiaire: ev.accueillirMemeStagiaire,
    quartsTravailVariables: ev.quartsTravailVariables
});

const formulaireDepuisDossier = (d) => ({
    ...FORMULAIRE_INITIAL,
    nomEntreprise: d.nomEntreprise || "",
    personneContact: d.personneContact || "",
    telephone: d.telephoneEntreprise || "",
    nomStagiaire: d.nomStagiaire || "",
    dateStage: d.dateStage || "",
    salaireHoraire: extraireSalaireTexte(d.salaireHoraire),
    signatureEnseignant: d.nomProfesseur || "",
    dateEvaluation: new Date().toISOString().split("T")[0]
});

const aReponseNegative = (reponses) =>
    Object.values(reponses || {}).some((n) => n === "PLUTOT_EN_DESACCORD" || n === "TOTALEMENT_EN_DESACCORD");

const parseHeures = (v) => Number(String(v).trim().replace(",", "."));

const validerFormulaireEvaluationMilieu = (formulaire, t) => {
    const erreurs = {};
    for (const [champ, key] of CHAMPS_TEXTE_OBLIGATOIRES) {
        if (!String(formulaire[champ] || "").trim()) erreurs[champ] = t(`evaluation_milieu.errors.${key}`);
    }
    const codePostalTrim = formulaire.codePostal.trim();
    if (!codePostalTrim) erreurs.codePostal = t("evaluation_milieu.errors.code_postal_required");
    else if (!CODE_POSTAL_REGEX.test(codePostalTrim)) erreurs.codePostal = t("evaluation_milieu.errors.code_postal_format");

    const salaireTrim = formulaire.salaireHoraire.trim();
    if (!salaireTrim || !SALAIRE_REGEX.test(salaireTrim)) erreurs.salaireHoraire = t("evaluation_milieu.errors.salaire");

    if (formulaire.numeroStage !== 1 && formulaire.numeroStage !== 2) erreurs.numeroStage = t("evaluation_milieu.errors.numero_stage");
    for (const critere of CRITERES_MILIEU) {
        if (!formulaire.reponses[critere]) erreurs[`critere_${critere}`] = t("evaluation_milieu.errors.critere_requis");
    }
    for (const champ of ["heuresEncadrementMois1", "heuresEncadrementMois2", "heuresEncadrementMois3"]) {
        const texte = String(formulaire[champ]).trim().replace(",", ".");
        const val = Number(texte);
        if (texte === "" || Number.isNaN(val) || val < 0) erreurs[champ] = t("evaluation_milieu.errors.heures_mois");
    }
    if (aReponseNegative(formulaire.reponses) && !formulaire.commentaires.trim()) {
        erreurs.commentaires = t("evaluation_milieu.errors.commentaires_requis");
    }
    if (formulaire.accueillirMemeStagiaire === null) erreurs.accueillirMemeStagiaire = t("evaluation_milieu.errors.meme_stagiaire");
    if (formulaire.quartsTravailVariables === null) {
        erreurs.quartsTravailVariables = t("evaluation_milieu.errors.quarts_variables");
    } else if (formulaire.quartsTravailVariables === true) {
        if (!formulaire.quart1Debut.trim() || !formulaire.quart1Fin.trim()) erreurs.quart1 = t("evaluation_milieu.errors.quart1_requis");
        for (const idx of [2, 3]) {
            const d = formulaire[`quart${idx}Debut`].trim();
            const f = formulaire[`quart${idx}Fin`].trim();
            if ((d && !f) || (!d && f)) erreurs[`quart${idx}`] = t("evaluation_milieu.errors.quart_paire");
        }
    }
    return erreurs;
};

const construirePayload = (formulaire) => {
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

const classeChamp = (erreurs, champ) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 transition focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600 ${
        erreurs[champ] ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500" : "border-gray-200 bg-white focus:ring-blue-200 focus:border-blue-500"
    }`;

function ErreurInline({ message }) {
    if (!message) return null;
    return (
        <p role="alert" className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

function OptionRadio({ nom, valeur, selectionnee, onSelect, disabled, ariaLabel, children }) {
    const couleurs = selectionnee
        ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-100"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40";
    return (
        <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all focus-within:ring-2 focus-within:ring-blue-300 ${couleurs} ${disabled ? "cursor-default opacity-90" : "cursor-pointer"}`}>
            <input type="radio" name={nom} value={valeur} checked={selectionnee} disabled={disabled} onChange={onSelect} aria-label={ariaLabel} className="sr-only" />
            {selectionnee && <Check className="w-3.5 h-3.5 shrink-0" />}
            <span>{children}</span>
        </label>
    );
}

function LienRetour({ estGestionnaire, onRetour, t }) {
    const libelle = estGestionnaire ? t("evaluation_milieu.back_gestionnaire") : t("evaluation_milieu.back_professeur");
    const classes = "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition cursor-pointer";
    if (onRetour) {
        return (
            <button type="button" onClick={onRetour} className={classes}>
                <ArrowLeft className="w-4 h-4" />
                <span>{libelle}</span>
            </button>
        );
    }
    return (
        <Link to={estGestionnaire ? "/gestionnaire" : "/professeur"} className={classes}>
            <ArrowLeft className="w-4 h-4" />
            <span>{libelle}</span>
        </Link>
    );
}

export default function FormulaireEvaluationMilieuStage({ etudiantId, mode = "professeur", onRetour, onEvaluationSoumise }) {
    const { t, i18n } = useTranslation("main");
    const { etudiantId: paramEtudiantId } = useParams();
    const cibleEtudiantId = etudiantId ?? paramEtudiantId;
    const authService = useContext(AuthServiceContext);
    const hautRef = useRef(null);
    const estGestionnaire = mode === "gestionnaire";

    const [dossier, setDossier] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [formulaire, setFormulaire] = useState(FORMULAIRE_INITIAL);
    const [loading, setLoading] = useState(true);
    const [soumission, setSoumission] = useState(false);
    const [erreurChargement, setErreurChargement] = useState("");
    const [erreursChamps, setErreursChamps] = useState({});
    const [erreurSoumission, setErreurSoumission] = useState("");
    const [succes, setSucces] = useState(false);

    const lecture = estGestionnaire || evaluation !== null;
    const remonter = () => hautRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                setLoading(true);
                setErreurChargement("");
                setEvaluation(null);
                setDossier(null);
                setSucces(false);
                setErreursChamps({});
                setErreurSoumission("");
                const authHeader = authService.buildAuthHeader();

                if (estGestionnaire) {
                    const evalData = await getEvaluationMilieuEtudiant(cibleEtudiantId, authHeader);
                    if (!actif) return;
                    setEvaluation(evalData);
                    setFormulaire(formulaireDepuisEvaluation(evalData));
                } else {
                    const dossierData = await getDossierStage(cibleEtudiantId, authHeader);
                    if (!actif) return;
                    setDossier(dossierData);
                    if (dossierData.milieuEvalue) {
                        const evalData = await getEvaluationMilieu(cibleEtudiantId, authHeader);
                        if (!actif) return;
                        setEvaluation(evalData);
                        setFormulaire(formulaireDepuisEvaluation(evalData));
                    } else {
                        setFormulaire(formulaireDepuisDossier(dossierData));
                    }
                }
            } catch (e) {
                if (actif) setErreurChargement(e.message || t("evaluation_milieu.error_load"));
            } finally {
                if (actif) setLoading(false);
            }
        };
        charger();
        return () => { actif = false; };
    }, [cibleEtudiantId, estGestionnaire, authService]);

    const effacerErreur = (champ) => setErreursChamps((prev) => {
        if (!prev[champ]) return prev;
        const copie = { ...prev };
        delete copie[champ];
        return copie;
    });

    const majChamp = (champ, valeur) => {
        setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
        effacerErreur(champ);
    };

    const majReponse = (critere, niveau) => {
        setFormulaire((prev) => ({ ...prev, reponses: { ...prev.reponses, [critere]: niveau } }));
        effacerErreur(`critere_${critere}`);
        effacerErreur("commentaires");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (lecture || soumission) return;
        const erreurs = validerFormulaireEvaluationMilieu(formulaire, t);
        if (Object.keys(erreurs).length > 0) {
            setErreursChamps(erreurs);
            setErreurSoumission("");
            remonter();
            return;
        }
        try {
            setSoumission(true);
            setErreurSoumission("");
            setErreursChamps({});
            const resultat = await soumettreEvaluationMilieu(cibleEtudiantId, construirePayload(formulaire), authService.buildAuthHeader());
            setEvaluation(resultat);
            setFormulaire(formulaireDepuisEvaluation(resultat));
            setSucces(true);
            onEvaluationSoumise?.(resultat);
            remonter();
        } catch (e) {
            setErreurSoumission(e.message || t("evaluation_milieu.error_submit"));
            remonter();
        } finally {
            setSoumission(false);
        }
    };

    const renderInput = ({ id, label, champ, obligatoire = true, type = "text", placeholder, spanClass = "", labelClass = "block text-sm font-semibold text-gray-700 mb-1.5", inputMode }) => (
        <div key={id} className={spanClass} data-champ-erreur={Boolean(erreursChamps[champ])}>
            <label htmlFor={id} className={labelClass}>
                {label}{obligatoire && !lecture ? <span className="text-rose-500 ml-1">*</span> : ""}
            </label>
            <input
                id={id} type={type} inputMode={inputMode} value={formulaire[champ]}
                onChange={(e) => majChamp(champ, e.target.value)} placeholder={placeholder}
                disabled={lecture} aria-invalid={Boolean(erreursChamps[champ])} className={classeChamp(erreursChamps, champ)}
            />
            <ErreurInline message={erreursChamps[champ]} />
        </div>
    );

    const renderGroupeRadio = (nom, label, options) => (
        <div data-champ-erreur={Boolean(erreursChamps[nom])} className={erreursChamps[nom] ? "rounded-xl p-3 -mx-3 bg-rose-50/40 ring-1 ring-inset ring-rose-200 transition-colors" : "transition-colors"}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{label} <span className="text-rose-500">*</span></p>
            <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <OptionRadio
                        key={String(opt.valeur)} nom={nom} valeur={String(opt.radioValeur ?? opt.valeur)}
                        selectionnee={formulaire[nom] === opt.valeur} onSelect={() => majChamp(nom, opt.valeur)}
                        disabled={lecture} ariaLabel={opt.libelle}
                    >
                        {opt.libelle}
                    </OptionRadio>
                ))}
            </div>
            <ErreurInline message={erreursChamps[nom]} />
        </div>
    );

    const optionsOuiNon = (cle) => [
        { valeur: true, radioValeur: "oui", libelle: t(`evaluation_milieu.section4.${cle}.oui`) },
        { valeur: false, radioValeur: "non", libelle: t(`evaluation_milieu.section4.${cle}.non`) }
    ];

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-500">{t("evaluation_milieu.loading")}</p>
            </div>
        );
    }

    if (erreurChargement) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <LienRetour estGestionnaire={estGestionnaire} onRetour={onRetour} t={t} />
                <div role="alert" className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-sm shadow-xs flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{erreurChargement}</span>
                </div>
            </div>
        );
    }

    const criteresRepondus = CRITERES_MILIEU.filter((c) => Boolean(formulaire.reponses?.[c])).length;
    const progression = Math.round((criteresRepondus / CRITERES_MILIEU.length) * 100);
    const complet = criteresRepondus === CRITERES_MILIEU.length;

    return (
        <form onSubmit={handleSubmit} noValidate className="max-w-4xl mx-auto space-y-6">
            <div ref={hautRef} className="scroll-mt-24" />
            <div className="sticky top-20 z-20">
                <LienRetour estGestionnaire={estGestionnaire} onRetour={onRetour} t={t} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t("evaluation_milieu.program_header")}</p>
                <h1 className="text-3xl font-bold text-gray-800 mt-1">{lecture ? t("evaluation_milieu.title_view") : t("evaluation_milieu.title")}</h1>
                {!lecture && <p className="text-gray-500 mt-1">{t("evaluation_milieu.subtitle")}</p>}
            </div>

            {erreurSoumission && (
                <div role="alert" className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-sm shadow-xs flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-semibold">{erreurSoumission}</p>
                </div>
            )}

            {succes && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl flex items-center gap-2 text-sm shadow-xs">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>{t("evaluation_milieu.success")}</span>
                </div>
            )}

            {lecture && evaluation && (
                <div className="p-4 bg-blue-50 border border-blue-200/80 text-blue-800 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 shrink-0 text-blue-600" />
                        <span>{t("evaluation_milieu.readonly_notice")}</span>
                    </div>
                    {evaluation.dateEvaluation && (
                        <span>
                            {t("evaluation_milieu.submitted_on", {
                                date: (String(evaluation.dateEvaluation).length === 10 ? new Date(`${evaluation.dateEvaluation}T00:00:00`) : new Date(evaluation.dateEvaluation)).toLocaleDateString(i18n?.language),
                                professeur: evaluation.nomProfesseur || evaluation.signatureEnseignant
                            })}
                        </span>
                    )}
                </div>
            )}

            {dossier && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { icon: <GraduationCap className="w-4 h-4" />, label: "student", val: dossier.nomStagiaire },
                            { icon: <Building2 className="w-4 h-4" />, label: "company", val: dossier.nomEntreprise },
                            { icon: <Briefcase className="w-4 h-4" />, label: "position", val: dossier.titreOffre },
                            { icon: <Calendar className="w-4 h-4" />, label: "period", val: dossier.dateStage }
                        ].map(({ icon, label, val }) => (
                            <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">{icon}</div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t(`evaluation_milieu.summary_card.${label}`)}</span>
                                    <span className="block text-xs font-semibold text-gray-800 truncate">{val || "—"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section1.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CHAMPS_SECTION_1.map(({ id, champ, labelKey, placeholderKey, spanClass, obligatoire }) =>
                        renderInput({ id, champ, label: t(`evaluation_milieu.section1.${labelKey}`), placeholder: placeholderKey ? t(`evaluation_milieu.section1.${placeholderKey}`) : undefined, spanClass, obligatoire })
                    )}
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section2.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput({ id: "nom-stagiaire", champ: "nomStagiaire", label: t("evaluation_milieu.section2.nom_stagiaire") })}
                    {renderInput({ id: "date-stage", champ: "dateStage", label: t("evaluation_milieu.section2.date_stage"), placeholder: t("evaluation_milieu.section2.date_stage_placeholder") })}
                </div>
                {renderGroupeRadio("numeroStage", t("evaluation_milieu.section2.numero_stage"), [1, 2].map((num) => ({ valeur: num, radioValeur: String(num), libelle: t(`evaluation_milieu.section2.stage_${num}`) })))}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section3.title")}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{t("evaluation_milieu.section3.subtitle")}</p>
                        </div>
                        {!lecture && (
                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${complet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                {t("evaluation_milieu.section3.progress_label", { repondus: criteresRepondus, total: CRITERES_MILIEU.length })}
                            </span>
                        )}
                    </div>
                    {!lecture && (
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${complet ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${progression}%` }} />
                        </div>
                    )}
                </div>

                <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2.5">
                    {t("evaluation_milieu.section3.asterisk_note")}
                </p>

                <div>
                    {CRITERES_MILIEU.map((critere, index) => {
                        const libelle = t(`evaluation_milieu.section3.criteres.${critere}`);
                        const errCritere = erreursChamps[`critere_${critere}`];
                        return (
                            <div key={critere} data-champ-erreur={Boolean(errCritere)} className={`py-4 border-b border-gray-100 last:border-b-0 space-y-3 transition-colors ${errCritere ? "rounded-xl px-4 my-1 bg-rose-50/40 ring-1 ring-inset ring-rose-200 border-b-0" : ""}`}>
                                <p className="text-sm font-medium text-gray-800">{index + 1}. {libelle}</p>
                                <div role="radiogroup" aria-label={libelle} className="flex flex-wrap gap-2">
                                    {NIVEAUX.map((niveau) => {
                                        const libelleNiveau = t(`evaluation_milieu.section3.levels.${niveau}`);
                                        return (
                                            <OptionRadio key={niveau} nom={critere} valeur={niveau} selectionnee={formulaire.reponses[critere] === niveau} onSelect={() => majReponse(critere, niveau)} disabled={lecture} ariaLabel={`${libelle} : ${libelleNiveau}`}>
                                                {libelleNiveau}
                                            </OptionRadio>
                                        );
                                    })}
                                </div>
                                <ErreurInline message={errCritere} />

                                {critere === "TEMPS_ENCADREMENT_SUFFISANT" && (
                                    <div className="mt-3 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span>{t("evaluation_milieu.section3.heures_encadrement.titre")}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[1, 2, 3].map((mois) => renderInput({
                                                id: `heures-mois-${mois}`,
                                                champ: `heuresEncadrementMois${mois}`,
                                                label: t(`evaluation_milieu.section3.heures_encadrement.mois${mois}`),
                                                inputMode: "decimal",
                                                placeholder: t("evaluation_milieu.section3.heures_encadrement.placeholder"),
                                                labelClass: "block text-xs font-semibold text-gray-700 mb-1"
                                            }))}
                                        </div>
                                    </div>
                                )}

                                {critere === "SALAIRE_INTERESSANT" && (
                                    <div data-champ-erreur={Boolean(erreursChamps.salaireHoraire)} className="mt-3 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80">
                                        <label htmlFor="salaire-horaire" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                            <DollarSign className="w-4 h-4 text-blue-600" />
                                            <span>{t("evaluation_milieu.section3.salaire.label")} *</span>
                                        </label>
                                        <div className="flex items-center max-w-xs gap-2">
                                            <input id="salaire-horaire" type="text" inputMode="decimal" value={formulaire.salaireHoraire} onChange={(e) => majChamp("salaireHoraire", e.target.value.replace(/[^0-9.,]/g, ""))} placeholder={t("evaluation_milieu.section3.salaire.placeholder")} disabled={lecture} aria-invalid={Boolean(erreursChamps.salaireHoraire)} className={classeChamp(erreursChamps, "salaireHoraire")} />
                                            <span className="shrink-0 text-xs font-semibold text-gray-600">{t("evaluation_milieu.section3.salaire.unite")}</span>
                                        </div>
                                        <ErreurInline message={erreursChamps.salaireHoraire} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div data-champ-erreur={Boolean(erreursChamps.commentaires)} className="pt-2">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label htmlFor="commentaires-milieu" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <span>{t("evaluation_milieu.section3.commentaires.label")}</span>
                            {aReponseNegative(formulaire.reponses) && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    {t("evaluation_milieu.section3.commentaires.obligatoire_badge")}
                                </span>
                            )}
                        </label>
                        <span className="text-xs text-gray-400">{formulaire.commentaires.length} / 2000</span>
                    </div>
                    <textarea id="commentaires-milieu" rows={4} maxLength={2000} value={formulaire.commentaires} onChange={(e) => majChamp("commentaires", e.target.value)} placeholder={t("evaluation_milieu.section3.commentaires.placeholder")} disabled={lecture} aria-invalid={Boolean(erreursChamps.commentaires)} className={classeChamp(erreursChamps, "commentaires")} />
                    <ErreurInline message={erreursChamps.commentaires} />
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section4.title")}</h2>
                {renderGroupeRadio("milieuAPrivilegier", t("evaluation_milieu.section4.milieu_privilegier.label"), STAGES_CIBLES.map((c) => ({ valeur: c, libelle: t(`evaluation_milieu.section4.milieu_privilegier.${c}`) })))}
                {renderGroupeRadio("nombreStagiairesAccueillis", t("evaluation_milieu.section4.capacite_accueil.label"), CAPACITES_ACCUEIL.map((c) => ({ valeur: c, libelle: t(`evaluation_milieu.section4.capacite_accueil.${c}`) })))}
                {renderGroupeRadio("accueillirMemeStagiaire", t("evaluation_milieu.section4.meme_stagiaire.label"), optionsOuiNon("meme_stagiaire"))}

                <div className="space-y-3">
                    {renderGroupeRadio("quartsTravailVariables", t("evaluation_milieu.section4.quarts_variables.label"), optionsOuiNon("quarts_variables"))}
                    {formulaire.quartsTravailVariables === true && (
                        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                            <p className="text-xs font-bold text-slate-700">{t("evaluation_milieu.section4.quarts_variables.plages_label")}</p>
                            {[1, 2, 3].map((idx) => {
                                const errKey = `quart${idx}`;
                                const borderTime = erreursChamps[errKey] ? "border-rose-400 bg-rose-50/40" : "border-gray-200 bg-white";
                                return (
                                    <div key={idx} data-champ-erreur={Boolean(erreursChamps[errKey])} className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-700 w-16">
                                                {t("evaluation_milieu.section4.quarts_variables.plage", { index: idx })}{idx === 1 ? <span className="text-rose-500 ml-1">*</span> : ""}
                                            </span>
                                            <span className="text-gray-500">{t("evaluation_milieu.section4.quarts_variables.de")}</span>
                                            <input type="time" value={formulaire[`quart${idx}Debut`]} onChange={(e) => { majChamp(`quart${idx}Debut`, e.target.value); effacerErreur(errKey); }} disabled={lecture} className={`rounded-lg border px-2.5 py-1.5 text-xs text-gray-800 disabled:bg-gray-50 ${borderTime}`} />
                                            <span className="text-gray-500">{t("evaluation_milieu.section4.quarts_variables.a")}</span>
                                            <input type="time" value={formulaire[`quart${idx}Fin`]} onChange={(e) => { majChamp(`quart${idx}Fin`, e.target.value); effacerErreur(errKey); }} disabled={lecture} className={`rounded-lg border px-2.5 py-1.5 text-xs text-gray-800 disabled:bg-gray-50 ${borderTime}`} />
                                        </div>
                                        <ErreurInline message={erreursChamps[errKey]} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    {renderInput({ id: "signature-enseignant", champ: "signatureEnseignant", label: t("evaluation_milieu.section4.signature_label"), placeholder: t("evaluation_milieu.section4.signature_placeholder") })}
                    {renderInput({ id: "date-evaluation", champ: "dateEvaluation", label: t("evaluation_milieu.section4.date_label"), type: "date", obligatoire: false })}
                </div>
            </section>

            {!lecture && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 md:px-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    <LienRetour estGestionnaire={estGestionnaire} onRetour={onRetour} t={t} />
                    <button type="submit" disabled={soumission} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>{soumission ? t("evaluation_milieu.submitting") : t("evaluation_milieu.submit")}</span>
                    </button>
                </div>
            )}
        </form>
    );
}
