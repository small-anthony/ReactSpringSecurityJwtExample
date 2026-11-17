import React, { useState, useEffect, useContext, useCallback } from "react";
import { Users, GraduationCap, Search, CheckCircle2, Clock, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getEtudiantsAssignes, getAnneesProfesseur } from "../../services/api/ProfesseurService.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import CarteEtudiantAssigne from "../widget/CarteEtudiantAssigne.jsx";
import FormulaireEvaluationMilieuStage from "../widget/FormulaireEvaluationMilieuStage.jsx";

export default function ProfesseurEtudiants() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const userData = authService.getUserData();

    const [etudiants, setEtudiants] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [filtreEvaluation, setFiltreEvaluation] = useState("TOUS");
    const [etudiantEvaluationId, setEtudiantEvaluationId] = useState(null);

    const chargerDonnees = useCallback(async () => {
        try {
            setLoading(true);
            setErreur(null);
            const data = await getEtudiantsAssignes(authService.buildAuthHeader(), anneeChoisie);
            setEtudiants(data || []);
        } catch (err) {
            setErreur(err.message || t("professeur.erreur_chargement"));
        } finally {
            setLoading(false);
        }
    }, [authService, anneeChoisie, t]);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    useEffect(() => {
        getAnneesProfesseur(authService.buildAuthHeader())
            .then((data) => {
                setAnnees(data || []);
                if (data && data.length > 0 && anneeChoisie === null) {
                    setAnneeChoisie(data[0]);
                }
            })
            .catch(() => setAnnees([]));
    }, [authService]);

    const aEvaluerCount = etudiants.filter((e) => e.aStage && !e.milieuEvalue).length;
    const evaluesCount = etudiants.filter((e) => e.milieuEvalue).length;

    const etudiantsFiltres = etudiants.filter((e) => {
        if (filtreEvaluation === "A_EVALUER" && (!e.aStage || e.milieuEvalue)) return false;
        if (filtreEvaluation === "EVALUES" && !e.milieuEvalue) return false;

        const query = recherche.trim().toLowerCase();
        if (!query) return true;
        const nom = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
        const matricule = (e.matricule || "").toString();
        const entreprise = (e.entrepriseStage || "").toLowerCase();
        const titre = (e.titreOffreStage || "").toLowerCase();
        return nom.includes(query) || matricule.includes(query) || entreprise.includes(query) || titre.includes(query);
    });

    const classeOnglet = (valeur) =>
        `px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            filtreEvaluation === valeur ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
        }`;

    if (etudiantEvaluationId !== null) {
        return (
            <div className="min-h-[calc(100vh-4rem)] p-6 sm:p-10 max-w-7xl mx-auto w-full">
                <FormulaireEvaluationMilieuStage
                    etudiantId={etudiantEvaluationId}
                    mode="professeur"
                    onRetour={() => setEtudiantEvaluationId(null)}
                    onEvaluationSoumise={chargerDonnees}
                />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
            <div className="ds-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-2">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {t("professeur.badge_role")}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {t("professeur.titre_page")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {t("professeur.bienvenue", { nom: userData ? `${userData.firstName} ${userData.lastName}` : "" })}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <SelecteurSession annees={annees} anneeSelectionnee={anneeChoisie} onChangementAnnee={setAnneeChoisie} />
                </div>
            </div>

            {erreur && (
                <div className="ds-alert-error" role="alert">
                    {erreur}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
                <button type="button" onClick={() => setFiltreEvaluation("TOUS")} className={classeOnglet("TOUS")}>
                    <Users className="w-4 h-4 text-blue-500" />
                    {t("professeur.tabs.all")} ({etudiants.length})
                </button>
                <button type="button" onClick={() => setFiltreEvaluation("A_EVALUER")} className={classeOnglet("A_EVALUER")}>
                    <Clock className="w-4 h-4 text-amber-500" />
                    {t("professeur.tabs.to_evaluate")} ({aEvaluerCount})
                </button>
                <button type="button" onClick={() => setFiltreEvaluation("EVALUES")} className={classeOnglet("EVALUES")}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t("professeur.tabs.evaluated")} ({evaluesCount})
                </button>
            </div>

            <div className="ds-card p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder={t("professeur.recherche_placeholder")}
                        className="ds-input pl-10 pr-10"
                    />
                    {recherche && (
                        <button
                            type="button"
                            onClick={() => setRecherche("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 self-start sm:self-auto">
                    {t("professeur.total_etudiants", { count: etudiantsFiltres.length })}
                </span>
            </div>

            {loading ? (
                <div className="ds-card p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm">{t("professeur.chargement")}</p>
                </div>
            ) : etudiantsFiltres.length === 0 ? (
                <div className="ds-card p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t("professeur.aucun_etudiant_titre")}</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                        {recherche ? t("professeur.aucun_resultat_recherche") : t("professeur.aucun_etudiant_description")}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {etudiantsFiltres.map((etudiant) => (
                        <CarteEtudiantAssigne
                            key={etudiant.id}
                            etudiant={etudiant}
                            onOuvrirEvaluation={(id) => setEtudiantEvaluationId(id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
