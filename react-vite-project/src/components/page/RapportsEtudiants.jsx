import React, { useState, useEffect, useContext } from "react";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getEtudiantsInscrits,
    getEtudiantsSansConvocation,
    getEtudiantsAttenteEntrevue,
    getEtudiantsAttenteReponse,
    getEtudiantsTrouveStage
} from "../../services/api/GestionnaireService.js";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import { getAnneesGestionnaire } from "../../services/api/OffreStageService.js";

export default function RapportsEtudiants() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline } = useOffreFormater();
    const [typeRapport, setTypeRapport] = useState("inscrits");
    const [etudiants, setEtudiants] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);

    const afficheOffres =
        typeRapport === "attente-entrevue" ||
        typeRapport === "attente-reponse" ||
        typeRapport === "trouve-stage";

    const chargerRapport = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();

            let data = [];
            if (typeRapport === "inscrits") {
                data = await getEtudiantsInscrits(authHeader);
            } else if (typeRapport === "sans-convocation") {
                data = await getEtudiantsSansConvocation(authHeader, anneeChoisie);
            } else if (typeRapport === "attente-entrevue") {
                data = await getEtudiantsAttenteEntrevue(authHeader, anneeChoisie);
            } else if (typeRapport === "attente-reponse") {
                data = await getEtudiantsAttenteReponse(authHeader, anneeChoisie);
            } else if (typeRapport === "trouve-stage") {
                data = await getEtudiantsTrouveStage(authHeader, anneeChoisie);
            }

            setEtudiants(data || []);
        } catch {
            setErreur(t("rapports_etudiants.error_fetch"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void chargerRapport();
    }, [typeRapport, authService, anneeChoisie]);

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

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
            <SidePanelGestionnaire activeTab="rapports" />

            <main className="flex-1 p-6 sm:p-10 space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <FileText className="w-7 h-7 text-blue-600" />
                        <span>{t("rapports_etudiants.title")}</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {t("rapports_etudiants.subtitle")}
                    </p>
                </div>

                <div className="ds-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                        <label htmlFor="select-rapport" className="text-sm font-semibold text-slate-700 shrink-0">
                            {t("rapports_etudiants.select_label")}
                        </label>
                        <select
                            id="select-rapport"
                            value={typeRapport}
                            onChange={(e) => setTypeRapport(e.target.value)}
                            className="w-full sm:w-96 ds-input"
                        >
                            <option value="inscrits">{t("rapports_etudiants.types.etudiants-inscrits")}</option>
                            <option value="sans-convocation">{t("rapports_etudiants.types.etudiants-sans-convocation")}</option>
                            <option value="attente-entrevue">{t("rapports_etudiants.types.etudiants-attente-entrevue")}</option>
                            <option value="attente-reponse">{t("rapports_etudiants.types.etudiants-attente-reponse")}</option>
                            <option value="trouve-stage">{t("rapports_etudiants.types.etudiants-trouve-stage")}</option>
                        </select>
                        {typeRapport !== "inscrits" && (
                            <SelecteurSession
                                annees={annees}
                                anneeSelectionnee={anneeChoisie}
                                onChangementAnnee={setAnneeChoisie}
                            />
                        )}
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80 self-start sm:self-auto">
                        {t(etudiants.length > 1 ? "rapports_etudiants.total_plural" : "rapports_etudiants.total", {
                            count: etudiants.length
                        })}
                    </span>
                </div>

                {erreur && (
                    <div className="ds-alert-error" role="alert">
                        {erreur}
                    </div>
                )}

                <div className="ds-card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500 font-medium">
                            {t("rapports_etudiants.loading")}
                        </div>
                    ) : etudiants.length === 0 ? (
                        <div className="p-12 text-center text-sm text-slate-500 font-medium">
                            {t("rapports_etudiants.empty")}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">{t("rapports_etudiants.th_student")}</th>
                                    <th className="px-6 py-4">{t("rapports_etudiants.th_matricule")}</th>
                                    <th className="px-6 py-4">{t("rapports_etudiants.th_email")}</th>
                                    <th className="px-6 py-4">{t("rapports_etudiants.th_discipline")}</th>
                                    {afficheOffres && (
                                        <th className="px-6 py-4">{t("rapports_etudiants.th_offers")}</th>
                                    )}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {etudiants.map((etudiant) => (
                                    <tr key={etudiant.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {etudiant.firstName} {etudiant.lastName}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-slate-700">
                                            {etudiant.matricule}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {etudiant.email}
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                                    {traduireDiscipline(etudiant.discipline)}
                                                </span>
                                        </td>
                                        {afficheOffres && (
                                            <td className="px-6 py-4">
                                                <details className="text-xs cursor-pointer">
                                                    <summary className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                                        ({etudiant.candidatures?.length || 0}) {t("offres_etudiant.btn_see_details")}
                                                    </summary>
                                                    <div className="mt-2 space-y-1 text-slate-700 pl-2 border-l-2 border-blue-200">
                                                        {(etudiant.candidatures || []).map((cand) => (
                                                            <div key={cand.id}>
                                                                {cand.titreOffre} - {cand.nomEntreprise}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}