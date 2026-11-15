import React, { useState, useEffect, useContext, useMemo } from "react";
import { LayoutDashboard, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getRapportEtudiants } from "../../services/api/GestionnaireService.js";
import { getAnneesGestionnaire } from "../../services/api/OffreStageService.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import CartesKpiRapportGestionnaire from "../widget/CartesKpiRapportGestionnaire.jsx";
import TableRapportsEtudiants from "../widget/TableRapportsEtudiants.jsx";
import ModalCandidaturesEtudiant from "../modal/ModalCandidaturesEtudiant.jsx";
import FormulaireEvaluationMilieuStage from "../widget/FormulaireEvaluationMilieuStage.jsx";

export default function RapportsEtudiants() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const rawEvalId = Number(searchParams.get("etudiantEvaluationId"));
    const etudiantEvaluationId = Number.isInteger(rawEvalId) && rawEvalId > 0 ? rawEvalId : null;

    const [etudiants, setEtudiants] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);
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
        getAnneesGestionnaire(authService.buildAuthHeader())
            .then((data) => {
                setAnnees(data);
                if (data && data.length > 0) {
                    setAnneeChoisie(data[0]);
                }
            })
            .catch(() => setAnnees([]));
    }, [authService]);

    useEffect(() => {
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
    }, [authService, anneeChoisie, t]);

    const stats = useMemo(() => ({
        total: etudiants.length,
        stageTrouve: etudiants.filter((e) => e.statutStage === "STAGE_TROUVE").length,
        nonEvalueProfesseur: etudiants.filter((e) => e.statutStage === "STAGE_TROUVE" && !e.milieuEvalue).length,
        attenteReponse: etudiants.filter((e) => e.statutStage === "EN_ATTENTE_REPONSE").length,
        attenteEntrevue: etudiants.filter((e) => e.statutStage === "EN_ATTENTE_ENTREVUE").length,
        sansConvocation: etudiants.filter((e) => e.statutStage === "SANS_CONVOCATION").length,
        aucuneCandidature: etudiants.filter((e) => e.statutStage === "AUCUNE_CANDIDATURE").length,
    }), [etudiants]);

    const etudiantsFiltres = useMemo(() => {
        let resultat = etudiants;

        if (filtreStatut === "NON_EVALUE_PROFESSEUR") {
            resultat = resultat.filter((e) => e.statutStage === "STAGE_TROUVE" && !e.milieuEvalue);
        } else if (filtreStatut !== "TOUS") {
            resultat = resultat.filter((e) => e.statutStage === filtreStatut);
        }

        if (recherche.trim()) {
            const terme = recherche.trim().toLowerCase();
            resultat = resultat.filter((e) =>
                `${e.firstName} ${e.lastName} ${e.email} ${e.matricule}`.toLowerCase().includes(terme)
            );
        }

        return resultat;
    }, [etudiants, filtreStatut, recherche]);

    return (
        <main className="flex flex-col md:flex-row w-full min-h-screen bg-gray-50/30">
            <SidePanelGestionnaire activeTab="dashboard" />

            <div className="flex-1 p-6 md:p-10 animate-in fade-in duration-300">
                {etudiantEvaluationId ? (
                    <div className="max-w-5xl mx-auto">
                        <FormulaireEvaluationMilieuStage
                            etudiantId={etudiantEvaluationId}
                            mode="gestionnaire"
                            onRetour={fermerEvaluation}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                                    <LayoutDashboard className="w-7 h-7 text-blue-600" />
                                    <span>{t("gestionnaire_dashboard.title")}</span>
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
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

                        <CartesKpiRapportGestionnaire
                            stats={stats}
                            filtreStatut={filtreStatut}
                            onSelectFiltre={setFiltreStatut}
                        />

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={recherche}
                                        onChange={(e) => setRecherche(e.target.value)}
                                        placeholder={t("gestionnaire_dashboard.search_placeholder")}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                    />
                                </div>

                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {t(
                                        etudiantsFiltres.length > 1
                                            ? "gestionnaire_dashboard.total_plural"
                                            : "gestionnaire_dashboard.total",
                                        { count: etudiantsFiltres.length }
                                    )}
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-sm text-gray-500">
                                    {t("gestionnaire_dashboard.loading")}
                                </div>
                            ) : etudiantsFiltres.length === 0 ? (
                                <div className="p-12 text-center text-sm text-gray-500">
                                    {t("gestionnaire_dashboard.empty")}
                                </div>
                            ) : (
                                <TableRapportsEtudiants
                                    etudiants={etudiantsFiltres}
                                    onVoirCandidatures={setEtudiantSelectionne}
                                    onConsulterEvaluation={ouvrirEvaluation}
                                />
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
