import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    ClipboardCheck,
    GraduationCap,
    Building2,
    User,
    Phone,
    Briefcase,
    Calendar
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStagiaire, getEvaluation, soumettreEvaluation } from "../../services/api/EvaluationAPI.js";

const SECTIONS = [
    {
        id: "PRODUCTIVITE",
        criteres: [
            "PLANIFIER_ORGANISER",
            "COMPRENDRE_DIRECTIVES",
            "RYTHME_SOUTENU",
            "ETABLIR_PRIORITES",
            "RESPECTER_ECHEANCIERS",
        ],
    },
    {
        id: "QUALITE_TRAVAIL",
        criteres: [
            "RESPECTER_MANDATS",
            "ATTENTION_DETAILS",
            "VERIFIER_TRAVAIL",
            "OCCASIONS_PERFECTIONNEMENT",
            "ANALYSE_PROBLEMES",
        ],
    },
    {
        id: "RELATIONS_INTERPERSONNELLES",
        criteres: [
            "CONTACTS_FACILES",
            "TRAVAIL_EQUIPE",
            "CULTURE_ENTREPRISE",
            "CRITIQUES_CONSTRUCTIVES",
            "RESPECT_ENVERS_LES_GENS",
            "ECOUTE_ACTIVE",
        ],
    },
    {
        id: "HABILETES_PERSONNELLES",
        criteres: [
            "INTERET_MOTIVATION",
            "EXPRIMER_IDEES",
            "INITIATIVE",
            "TRAVAIL_SECURITAIRE",
            "SENS_RESPONSABILITES",
            "PONCTUALITE_ASSIDUITE",
        ],
    },
];

const TOUS_LES_CRITERES = SECTIONS.flatMap((section) => section.criteres);

const NIVEAUX = [
    "TOTALEMENT_EN_ACCORD",
    "PLUTOT_EN_ACCORD",
    "PLUTOT_EN_DESACCORD",
    "TOTALEMENT_EN_DESACCORD",
    "NON_APPLICABLE",
];

const APPRECIATIONS = [
    "DEPASSENT_DE_BEAUCOUP_LES_ATTENTES",
    "DEPASSENT_LES_ATTENTES",
    "REPONDENT_PLEINEMENT_AUX_ATTENTES",
    "REPONDENT_PARTIELLEMENT_AUX_ATTENTES",
    "NE_REPONDENT_PAS_AUX_ATTENTES",
];

const ACCUEILS = ["OUI", "PEUT_ETRE", "NON"];

const FORMULAIRE_VIDE = {
    reponses: {},
    commentaires: {},
    appreciationGlobale: "",
    precisionAppreciation: "",
    discuteAvecStagiaire: null,
    heures: "",
    accueilProchainStage: "",
    formationTechnique: "",
    nomSignataire: "",
    fonctionSignataire: "",
};

const formulaireDepuisEvaluation = (evaluation) => ({
    reponses: evaluation.reponses || {},
    commentaires: evaluation.commentaires || {},
    appreciationGlobale: evaluation.appreciationGlobale || "",
    precisionAppreciation: evaluation.precisionAppreciation || "",
    discuteAvecStagiaire: evaluation.discuteAvecStagiaire,
    heures: String(evaluation.heuresEncadrementParSemaine ?? ""),
    accueilProchainStage: evaluation.accueilProchainStage || "",
    formationTechnique: evaluation.formationTechnique || "",
    nomSignataire: evaluation.nomSignataire || "",
    fonctionSignataire: evaluation.fonctionSignataire || "",
});

function OptionRadio({ nom, valeur, selectionnee, onSelect, disabled, ariaLabel, children }) {
    const couleurs = selectionnee
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
    const curseur = disabled ? "cursor-default" : "cursor-pointer";
    return (
        <label
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-blue-300 ${couleurs} ${curseur}`}
        >
            <input
                type="radio"
                name={nom}
                value={valeur}
                checked={selectionnee}
                disabled={disabled}
                onChange={onSelect}
                aria-label={ariaLabel}
                className="sr-only"
            />
            {children}
        </label>
    );
}

function InfoCase({ icone, libelle, valeur }) {
    return (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">{icone}</div>
            <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{libelle}</span>
                <span className="block text-xs font-semibold text-gray-800 truncate">{valeur}</span>
            </div>
        </div>
    );
}

export default function EvaluationStagiaire() {
    const { t, i18n } = useTranslation("main");
    const { contratId } = useParams();
    const authService = useContext(AuthServiceContext);
    const haut = useRef(null);

    const [stagiaire, setStagiaire] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [formulaire, setFormulaire] = useState(FORMULAIRE_VIDE);
    const [loading, setLoading] = useState(true);
    const [soumission, setSoumission] = useState(false);
    const [erreurs, setErreurs] = useState([]);
    const [succes, setSucces] = useState(false);

    const lecture = evaluation !== null;

    const remonter = () => {
        haut.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                setLoading(true);
                setErreurs([]);
                const authHeader = authService.buildAuthHeader();
                const donneesStagiaire = await getStagiaire(contratId, authHeader);
                if (!actif) return;
                setStagiaire(donneesStagiaire);
                if (donneesStagiaire.evalue) {
                    const donneesEvaluation = await getEvaluation(contratId, authHeader);
                    if (!actif) return;
                    setEvaluation(donneesEvaluation);
                    setFormulaire(formulaireDepuisEvaluation(donneesEvaluation));
                } else {
                    setFormulaire({ ...FORMULAIRE_VIDE, nomSignataire: donneesStagiaire.nomSuperviseur || "" });
                }
            } catch (e) {
                if (actif) setErreurs([e.message || t("evaluation.error_load")]);
            } finally {
                if (actif) setLoading(false);
            }
        };
        charger();
        return () => {
            actif = false;
        };
    }, [contratId]);

    const majChamp = (champ, valeur) => setFormulaire((prev) => ({ ...prev, [champ]: valeur }));

    const majReponse = (critere, niveau) =>
        setFormulaire((prev) => ({ ...prev, reponses: { ...prev.reponses, [critere]: niveau } }));

    const majCommentaire = (section, texte) =>
        setFormulaire((prev) => ({ ...prev, commentaires: { ...prev.commentaires, [section]: texte } }));

    const valider = () => {
        const problemes = [];
        const manquants = TOUS_LES_CRITERES.filter((critere) => !formulaire.reponses[critere]).length;
        if (manquants > 0) {
            problemes.push(t("evaluation.errors.incomplete", { nombre: manquants }));
        }
        if (!formulaire.appreciationGlobale) {
            problemes.push(t("evaluation.errors.overall"));
        }
        if (formulaire.discuteAvecStagiaire === null) {
            problemes.push(t("evaluation.errors.discussed"));
        }
        const texteHeures = String(formulaire.heures).trim().replace(",", ".");
        const heures = Number(texteHeures);
        if (texteHeures === "" || Number.isNaN(heures) || heures < 0) {
            problemes.push(t("evaluation.errors.hours"));
        }
        if (!formulaire.accueilProchainStage) {
            problemes.push(t("evaluation.errors.next_internship"));
        }
        if (!formulaire.nomSignataire.trim()) {
            problemes.push(t("evaluation.errors.name"));
        }
        if (!formulaire.fonctionSignataire.trim()) {
            problemes.push(t("evaluation.errors.role"));
        }
        return problemes;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const problemes = valider();
        if (problemes.length > 0) {
            setErreurs(problemes);
            remonter();
            return;
        }
        try {
            setSoumission(true);
            setErreurs([]);
            const resultat = await soumettreEvaluation(
                contratId,
                {
                    reponses: formulaire.reponses,
                    commentaires: formulaire.commentaires,
                    appreciationGlobale: formulaire.appreciationGlobale,
                    precisionAppreciation: formulaire.precisionAppreciation,
                    discuteAvecStagiaire: formulaire.discuteAvecStagiaire,
                    heuresEncadrementParSemaine: Number(String(formulaire.heures).trim().replace(",", ".")),
                    accueilProchainStage: formulaire.accueilProchainStage,
                    formationTechnique: formulaire.formationTechnique,
                    nomSignataire: formulaire.nomSignataire,
                    fonctionSignataire: formulaire.fonctionSignataire,
                },
                authService.buildAuthHeader()
            );
            setEvaluation(resultat);
            setFormulaire(formulaireDepuisEvaluation(resultat));
            setStagiaire((prev) => ({ ...prev, evalue: true }));
            setSucces(true);
            remonter();
        } catch (e) {
            setErreurs([e.message || t("evaluation.error_submit")]);
            remonter();
        } finally {
            setSoumission(false);
        }
    };

    const classeChamp =
        "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-600";

    const lienRetour = (
        <Link
            to="/employeur/stagiaires"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
            <ArrowLeft className="w-4 h-4" />
            {t("evaluation.back")}
        </Link>
    );

    const bandeauErreurs = erreurs.length > 0 && (
        <div role="alert" className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-sm shadow-xs">
            <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <ul className="space-y-1">
                    {erreurs.map((message) => (
                        <li key={message}>{message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium text-gray-500">{t("evaluation.loading")}</p>
                </div>
            </div>
        );
    }

    if (!stagiaire) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {lienRetour}
                    {bandeauErreurs}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} noValidate className="max-w-4xl mx-auto space-y-6">
                <div ref={haut} className="space-y-4">
                    {lienRetour}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {lecture ? t("evaluation.title_view") : t("evaluation.title")}
                        </h1>
                        {!lecture && <p className="text-gray-500 mt-1">{t("evaluation.subtitle")}</p>}
                    </div>
                </div>

                {bandeauErreurs}

                {succes && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl flex items-center gap-2 text-sm shadow-xs">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                        <span>{t("evaluation.success")}</span>
                    </div>
                )}

                {lecture && evaluation.dateEvaluation && (
                    <p className="text-xs font-semibold text-gray-500">
                        {t("evaluation.submitted_on", {
                            date: new Date(evaluation.dateEvaluation).toLocaleDateString(i18n?.language),
                        })}
                    </p>
                )}

                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoCase
                            icone={<GraduationCap className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.student")}
                            valeur={stagiaire.nomEtudiant}
                        />
                        <InfoCase
                            icone={<GraduationCap className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.program")}
                            valeur={stagiaire.discipline}
                        />
                        <InfoCase
                            icone={<Building2 className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.company")}
                            valeur={stagiaire.entreprise}
                        />
                        <InfoCase
                            icone={<User className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.supervisor")}
                            valeur={stagiaire.nomSuperviseur}
                        />
                        <InfoCase
                            icone={<Phone className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.phone")}
                            valeur={stagiaire.telephone}
                        />
                        <InfoCase
                            icone={<Briefcase className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.position")}
                            valeur={stagiaire.titreOffre}
                        />
                        <InfoCase
                            icone={<Calendar className="w-4 h-4" />}
                            libelle={t("evaluation.student_info.period")}
                            valeur={`${stagiaire.dateDebut} → ${stagiaire.dateFin}`}
                        />
                    </div>
                </section>

                {SECTIONS.map((section) => {
                    const titre = t(`evaluation.sections.${section.id}.title`);
                    const repondus = section.criteres.filter((critere) => formulaire.reponses[critere]).length;
                    return (
                        <section
                            key={section.id}
                            aria-label={titre}
                            className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{titre}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {t(`evaluation.sections.${section.id}.description`)}
                                    </p>
                                </div>
                                {!lecture && (
                                    <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        {repondus} / {section.criteres.length}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm font-semibold text-gray-600">{t("evaluation.able_to")}</p>

                            <div>
                                {section.criteres.map((critere, index) => {
                                    const libelleCritere = t(`evaluation.criteres.${critere}`);
                                    return (
                                        <div key={critere} className="py-4 border-b border-gray-100 last:border-b-0">
                                            <p className="text-sm font-medium text-gray-800 mb-2.5">
                                                {String.fromCharCode(97 + index)}) {libelleCritere}
                                            </p>
                                            <div role="radiogroup" aria-label={libelleCritere} className="flex flex-wrap gap-2">
                                                {NIVEAUX.map((niveau) => {
                                                    const libelleNiveau = t(`evaluation.levels.${niveau}`);
                                                    return (
                                                        <OptionRadio
                                                            key={niveau}
                                                            nom={critere}
                                                            valeur={niveau}
                                                            selectionnee={formulaire.reponses[critere] === niveau}
                                                            onSelect={() => majReponse(critere, niveau)}
                                                            disabled={lecture}
                                                            ariaLabel={`${libelleCritere} : ${libelleNiveau}`}
                                                        >
                                                            {libelleNiveau}
                                                        </OptionRadio>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div>
                                <label
                                    htmlFor={`commentaire-${section.id}`}
                                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                                >
                                    {t("evaluation.comments")}
                                </label>
                                <textarea
                                    id={`commentaire-${section.id}`}
                                    rows={3}
                                    maxLength={2000}
                                    value={formulaire.commentaires[section.id] || ""}
                                    onChange={(event) => majCommentaire(section.id, event.target.value)}
                                    disabled={lecture}
                                    className={classeChamp}
                                />
                            </div>
                        </section>
                    );
                })}

                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                    <h2 className="text-lg font-bold text-gray-900">{t("evaluation.overall.title")}</h2>

                    <div role="radiogroup" aria-label={t("evaluation.overall.title")} className="flex flex-col gap-2">
                        {APPRECIATIONS.map((appreciation) => (
                            <OptionRadio
                                key={appreciation}
                                nom="appreciationGlobale"
                                valeur={appreciation}
                                selectionnee={formulaire.appreciationGlobale === appreciation}
                                onSelect={() => majChamp("appreciationGlobale", appreciation)}
                                disabled={lecture}
                                ariaLabel={t(`evaluation.overall.options.${appreciation}`)}
                            >
                                {t(`evaluation.overall.options.${appreciation}`)}
                            </OptionRadio>
                        ))}
                    </div>

                    <div>
                        <label htmlFor="precision-appreciation" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {t("evaluation.overall.precision")}
                        </label>
                        <textarea
                            id="precision-appreciation"
                            rows={4}
                            maxLength={2000}
                            value={formulaire.precisionAppreciation}
                            onChange={(event) => majChamp("precisionAppreciation", event.target.value)}
                            disabled={lecture}
                            className={classeChamp}
                        />
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{t("evaluation.discussed.label")}</p>
                        <div role="radiogroup" aria-label={t("evaluation.discussed.label")} className="flex flex-wrap gap-2">
                            <OptionRadio
                                nom="discuteAvecStagiaire"
                                valeur="oui"
                                selectionnee={formulaire.discuteAvecStagiaire === true}
                                onSelect={() => majChamp("discuteAvecStagiaire", true)}
                                disabled={lecture}
                                ariaLabel={`${t("evaluation.discussed.label")} : ${t("evaluation.discussed.yes")}`}
                            >
                                {t("evaluation.discussed.yes")}
                            </OptionRadio>
                            <OptionRadio
                                nom="discuteAvecStagiaire"
                                valeur="non"
                                selectionnee={formulaire.discuteAvecStagiaire === false}
                                onSelect={() => majChamp("discuteAvecStagiaire", false)}
                                disabled={lecture}
                                ariaLabel={`${t("evaluation.discussed.label")} : ${t("evaluation.discussed.no")}`}
                            >
                                {t("evaluation.discussed.no")}
                            </OptionRadio>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="heures-encadrement" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {t("evaluation.hours.label")}
                        </label>
                        <input
                            id="heures-encadrement"
                            type="text"
                            inputMode="decimal"
                            value={formulaire.heures}
                            onChange={(event) => majChamp("heures", event.target.value)}
                            placeholder={t("evaluation.hours.placeholder")}
                            disabled={lecture}
                            className={`${classeChamp} max-w-xs`}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{t("evaluation.next_internship.label")}</p>
                        <div role="radiogroup" aria-label={t("evaluation.next_internship.label")} className="flex flex-wrap gap-2">
                            {ACCUEILS.map((accueil) => (
                                <OptionRadio
                                    key={accueil}
                                    nom="accueilProchainStage"
                                    valeur={accueil}
                                    selectionnee={formulaire.accueilProchainStage === accueil}
                                    onSelect={() => majChamp("accueilProchainStage", accueil)}
                                    disabled={lecture}
                                    ariaLabel={`${t("evaluation.next_internship.label")} : ${t(`evaluation.next_internship.options.${accueil}`)}`}
                                >
                                    {t(`evaluation.next_internship.options.${accueil}`)}
                                </OptionRadio>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="formation-technique" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {t("evaluation.technical_training.label")}
                        </label>
                        <textarea
                            id="formation-technique"
                            rows={3}
                            maxLength={2000}
                            value={formulaire.formationTechnique}
                            onChange={(event) => majChamp("formationTechnique", event.target.value)}
                            placeholder={t("evaluation.technical_training.placeholder")}
                            disabled={lecture}
                            className={classeChamp}
                        />
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">{t("evaluation.signatory.title")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nom-signataire" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {t("evaluation.signatory.name")}
                            </label>
                            <input
                                id="nom-signataire"
                                type="text"
                                value={formulaire.nomSignataire}
                                onChange={(event) => majChamp("nomSignataire", event.target.value)}
                                placeholder={t("evaluation.signatory.name_placeholder")}
                                disabled={lecture}
                                className={classeChamp}
                            />
                        </div>
                        <div>
                            <label htmlFor="fonction-signataire" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                {t("evaluation.signatory.role")}
                            </label>
                            <input
                                id="fonction-signataire"
                                type="text"
                                value={formulaire.fonctionSignataire}
                                onChange={(event) => majChamp("fonctionSignataire", event.target.value)}
                                placeholder={t("evaluation.signatory.role_placeholder")}
                                disabled={lecture}
                                className={classeChamp}
                            />
                        </div>
                    </div>
                </section>

                {!lecture && (
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={soumission}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            <span>{soumission ? t("evaluation.submitting") : t("evaluation.submit")}</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
