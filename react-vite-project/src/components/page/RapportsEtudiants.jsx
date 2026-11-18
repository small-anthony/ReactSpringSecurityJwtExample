import React, { useState, useEffect, useContext, useMemo } from "react";
import { LayoutDashboard, Search, CheckCircle, Clock, AlertTriangle, AlertCircle, Users, HelpCircle, Eye, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getRapportEtudiants } from "../../services/api/GestionnaireService.js";
import { getAnneesGestionnaire } from "../../services/api/OffreStageService.js";
import { useSessionSelection } from "../../hooks/useSessionSelection.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import ModalCandidaturesEtudiant from "../modal/ModalCandidaturesEtudiant.jsx";
import FormulaireEvaluationMilieuStage from "../widget/FormulaireEvaluationMilieuStage.jsx";

const COULEURS_STATUT = {
    STAGE_TROUVE: "bg-green-100 text-green-800 border-green-200",
    EN_ATTENTE_REPONSE: "bg-purple-100 text-purple-800 border-purple-200",
    EN_ATTENTE_ENTREVUE: "bg-blue-100 text-blue-800 border-blue-200",
    SANS_CONVOCATION: "bg-orange-100 text-orange-800 border-orange-200",
    AUCUNE_CANDIDATURE: "bg-red-100 text-red-800 border-red-200",
};

export default function RapportsEtudiants() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const rawEvalId = Number(searchParams.get("etudiantEvaluationId"));
    const etudiantEvaluationId = Number.isInteger(rawEvalId) && rawEvalId > 0 ? rawEvalId : null;

    const [etudiants, setEtudiants] = useState([]);
    const { annees, anneeChoisie, setAnneeChoisie, anneesChargees } = useSessionSelection(
        getAnneesGestionnaire,
        authService
    );
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);

    const [recherche, setRecherche] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("TOUS");
    const [etudiantSelectionne, setEtudiantSelectionne] = useState(null);

    const ouvrirEvaluation = (id) => {
        const next = new URLSearchParams(searchParams);
        next.set("etudiantEvaluationId", String(id));
        setSearchParams(next);
    };

    const fermerEvaluation = () => {
        const next = new URLSearchParams(searchParams);
        next.delete("etudiantEvaluationId");
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        if (!anneesChargees) return;
        let isMounted = true;
        const charger = async () => {
            try {
                setLoading(true);
                setErreur(null);
                const data = await getRapportEtudiants(authService.buildAuthHeader(), anneeChoisie);
                if (isMounted) setEtudiants(data || []);
            } catch {
                if (isMounted) setErreur(t("gestionnaire_dashboard.error_fetch"));
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void charger();
        return () => { isMounted = false; };
    }, [authService, anneesChargees, anneeChoisie, t]);

    const stats = {
        total: etudiants.length,
        stageTrouve: etudiants.filter((e) => e.statutStage === "STAGE_TROUVE").length,
        attenteReponse: etudiants.filter((e) => e.statutStage === "EN_ATTENTE_REPONSE").length,
        attenteEntrevue: etudiants.filter((e) => e.statutStage === "EN_ATTENTE_ENTREVUE").length,
        sansConvocation: etudiants.filter((e) => e.statutStage === "SANS_CONVOCATION").length,
        aucuneCandidature: etudiants.filter((e) => e.statutStage === "AUCUNE_CANDIDATURE").length,
    };

    const etudiantsFiltres = useMemo(() => {
        let resultat = etudiants;

        if (filtreStatut !== "TOUS") {
            resultat = resultat.filter((e) => e.statutStage === filtreStatut);
        }

        if (recherche) {
            resultat = resultat.filter((e) =>
                (e.firstName + " " + e.lastName + " " + e.email + " " + e.matricule)
                    .toLowerCase()
                    .includes(recherche.toLowerCase())
            );
        }

        return resultat;
    }, [etudiants, filtreStatut, recherche]);

    return (
        <main className="flex flex-col md:flex-row w-full min-w-0 min-h-screen bg-gray-50/30 overflow-x-hidden">
            <SidePanelGestionnaire activeTab="dashboard" />

            <div className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 animate-in fade-in duration-300">
                {etudiantEvaluationId ? (
                    <div className="max-w-5xl mx-auto">
                        <FormulaireEvaluationMilieuStage
                            mode="gestionnaire"
                            etudiantId={etudiantEvaluationId}
                            onRetour={fermerEvaluation}
                        />
                    </div>
                ) : (
                <div className="space-y-6 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                        <div className="min-w-0">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5 min-w-0">
                                <LayoutDashboard className="w-7 h-7 text-blue-600 shrink-0" />
                                <span className="break-words">{t("gestionnaire_dashboard.title")}</span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 break-words">
                                {t("gestionnaire_dashboard.subtitle")}
                            </p>
                        </div>

                        <SelecteurSession
                            annees={annees}
                            anneeSelectionnee={anneeChoisie}
                            onChangementAnnee={setAnneeChoisie}
                        />
                    </div>

                    {erreur && (
                        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-xl text-sm">
                            {erreur}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("TOUS")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "TOUS"
                                    ? "bg-gray-900 text-white border-gray-900 shadow-sm ring-2 ring-gray-900/20"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "TOUS" ? "text-gray-200" : "text-gray-500"}`}>
                                    {t("gestionnaire_dashboard.kpi_total")}
                                </span>
                                <Users className="w-4 h-4 opacity-70 shrink-0 mt-0.5" />
                            </div>
                            <div className="text-2xl font-extrabold">{stats.total}</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltreStatut(filtreStatut === "STAGE_TROUVE" ? "TOUS" : "STAGE_TROUVE")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "STAGE_TROUVE"
                                    ? "bg-green-700 text-white border-green-700 shadow-sm ring-2 ring-green-600/30"
                                    : "bg-white border-green-200 hover:border-green-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "STAGE_TROUVE" ? "text-green-100" : "text-green-700"}`}>
                                    {t("gestionnaire_dashboard.status.STAGE_TROUVE")}
                                </span>
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${filtreStatut === "STAGE_TROUVE" ? "text-white" : "text-green-600"}`} />
                            </div>
                            <div className={`text-2xl font-extrabold ${filtreStatut === "STAGE_TROUVE" ? "text-white" : "text-green-700"}`}>
                                {stats.stageTrouve}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltreStatut(filtreStatut === "EN_ATTENTE_REPONSE" ? "TOUS" : "EN_ATTENTE_REPONSE")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "EN_ATTENTE_REPONSE"
                                    ? "bg-purple-700 text-white border-purple-700 shadow-sm ring-2 ring-purple-600/30"
                                    : "bg-white border-purple-200 hover:border-purple-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "EN_ATTENTE_REPONSE" ? "text-purple-100" : "text-purple-700"}`}>
                                    {t("gestionnaire_dashboard.status.EN_ATTENTE_REPONSE")}
                                </span>
                                <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${filtreStatut === "EN_ATTENTE_REPONSE" ? "text-white" : "text-purple-600"}`} />
                            </div>
                            <div className={`text-2xl font-extrabold ${filtreStatut === "EN_ATTENTE_REPONSE" ? "text-white" : "text-purple-700"}`}>
                                {stats.attenteReponse}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltreStatut(filtreStatut === "EN_ATTENTE_ENTREVUE" ? "TOUS" : "EN_ATTENTE_ENTREVUE")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "EN_ATTENTE_ENTREVUE"
                                    ? "bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-blue-600/30"
                                    : "bg-white border-blue-200 hover:border-blue-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "EN_ATTENTE_ENTREVUE" ? "text-blue-100" : "text-blue-700"}`}>
                                    {t("gestionnaire_dashboard.status.EN_ATTENTE_ENTREVUE")}
                                </span>
                                <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${filtreStatut === "EN_ATTENTE_ENTREVUE" ? "text-white" : "text-blue-600"}`} />
                            </div>
                            <div className={`text-2xl font-extrabold ${filtreStatut === "EN_ATTENTE_ENTREVUE" ? "text-white" : "text-blue-700"}`}>
                                {stats.attenteEntrevue}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltreStatut(filtreStatut === "SANS_CONVOCATION" ? "TOUS" : "SANS_CONVOCATION")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "SANS_CONVOCATION"
                                    ? "bg-orange-700 text-white border-orange-700 shadow-sm ring-2 ring-orange-600/30"
                                    : "bg-white border-orange-200 hover:border-orange-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "SANS_CONVOCATION" ? "text-orange-100" : "text-orange-700"}`}>
                                    {t("gestionnaire_dashboard.status.SANS_CONVOCATION")}
                                </span>
                                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${filtreStatut === "SANS_CONVOCATION" ? "text-white" : "text-orange-600"}`} />
                            </div>
                            <div className={`text-2xl font-extrabold ${filtreStatut === "SANS_CONVOCATION" ? "text-white" : "text-orange-700"}`}>
                                {stats.sansConvocation}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFiltreStatut(filtreStatut === "AUCUNE_CANDIDATURE" ? "TOUS" : "AUCUNE_CANDIDATURE")}
                            className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                                filtreStatut === "AUCUNE_CANDIDATURE"
                                    ? "bg-red-700 text-white border-red-700 shadow-sm ring-2 ring-red-600/30"
                                    : "bg-white border-red-200 hover:border-red-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                                <span className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${filtreStatut === "AUCUNE_CANDIDATURE" ? "text-red-100" : "text-red-700"}`}>
                                    {t("gestionnaire_dashboard.status.AUCUNE_CANDIDATURE")}
                                </span>
                                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${filtreStatut === "AUCUNE_CANDIDATURE" ? "text-white" : "text-red-600"}`} />
                            </div>
                            <div className={`text-2xl font-extrabold ${filtreStatut === "AUCUNE_CANDIDATURE" ? "text-white" : "text-red-700"}`}>
                                {stats.aucuneCandidature}
                            </div>
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between min-w-0">
                        <div className="relative w-full sm:w-96 min-w-0">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type="text"
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                                placeholder={t("gestionnaire_dashboard.search_placeholder")}
                                className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            {recherche && (
                                <button
                                    type="button"
                                    onClick={() => setRecherche("")}
                                    aria-label={t("gestionnaire_dashboard.clear_search")}
                                    className="absolute right-2.5 top-2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/70 transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <span className="text-xs font-bold uppercase text-gray-500">
                            {t(etudiantsFiltres.length > 1 ? "gestionnaire_dashboard.total_plural" : "gestionnaire_dashboard.total", {
                                count: etudiantsFiltres.length
                            })}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-sm text-gray-500">
                                {t("gestionnaire_dashboard.loading")}
                            </div>
                        ) : etudiantsFiltres.length === 0 ? (
                            <div className="p-12 text-center text-sm text-gray-500">
                                {t("gestionnaire_dashboard.empty")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/70 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">{t("gestionnaire_dashboard.th_student")}</th>
                                            <th className="px-6 py-4">{t("gestionnaire_dashboard.th_status")}</th>
                                            <th className="px-6 py-4">{t("gestionnaire_dashboard.th_offers")}</th>
                                            <th className="px-6 py-4">{t("rapports_etudiants.th_milieu_evaluation")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {etudiantsFiltres.map((etudiant) => (
                                            <tr key={etudiant.id} className="hover:bg-gray-50/60 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="font-bold text-gray-900">
                                                            {etudiant.firstName} {etudiant.lastName}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <span>{etudiant.email}</span>
                                                        <span className="font-mono text-gray-400">{etudiant.matricule}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${COULEURS_STATUT[etudiant.statutStage] || "bg-gray-100 text-gray-700"}`}>
                                                        {t(`gestionnaire_dashboard.status.${etudiant.statutStage}`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {etudiant.candidatures && etudiant.candidatures.length > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEtudiantSelectionne(etudiant)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition-all shadow-2xs cursor-pointer group"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>
                                                                {t("gestionnaire_dashboard.view_count", {
                                                                    count: etudiant.candidatures.length
                                                                })}
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            {t("gestionnaire_dashboard.no_application")}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {etudiant.statutStage === "STAGE_TROUVE" ? (
                                                        etudiant.milieuEvalue ? (
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                    <span>{t("rapports_etudiants.milieu_evalue_badge")}</span>
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => ouvrirEvaluation(etudiant.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>{t("rapports_etudiants.voir_evaluation_milieu")}</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>{t("rapports_etudiants.milieu_non_evalue_badge")}</span>
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>

            {etudiantSelectionne && (
                <ModalCandidaturesEtudiant
                    etudiant={etudiantSelectionne}
                    onClose={() => setEtudiantSelectionne(null)}
                />
            )}
        </main>
    );
}
