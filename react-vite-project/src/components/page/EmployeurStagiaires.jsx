import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    Briefcase,
    Calendar,
    Building2,
    Clock,
    CheckCircle2,
    AlertCircle,
    ClipboardCheck,
    Eye,
    Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStagiaires } from "../../services/api/EvaluationAPI.js";

export default function EmployeurStagiaires() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const navigate = useNavigate();

    const [stagiaires, setStagiaires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [filtre, setFiltre] = useState("TOUS");

    useEffect(() => {
        const charger = async () => {
            try {
                setLoading(true);
                setErreur(null);
                const data = await getStagiaires(authService.buildAuthHeader());
                setStagiaires(data || []);
            } catch (e) {
                setErreur(e.message || t("stagiaires.error_load", { defaultValue: "Erreur lors du chargement de vos stagiaires" }));
            } finally {
                setLoading(false);
            }
        };
        charger();
    }, []);

    const aEvaluerCount = stagiaires.filter((s) => !s.evalue).length;
    const evaluesCount = stagiaires.filter((s) => s.evalue).length;

    const stagiairesFiltres = stagiaires.filter((s) => {
        if (filtre === "A_EVALUER") return !s.evalue;
        if (filtre === "EVALUES") return s.evalue;
        return true;
    });

    const classeOnglet = (valeur) =>
        `px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            filtre === valeur ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
        }`;

    const getStatusBadge = (stagiaire) => {
        if (stagiaire.evalue) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t("stagiaires.status.evaluated", { defaultValue: "Évalué" })}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {t("stagiaires.status.to_evaluate", { defaultValue: "À évaluer" })}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {t("stagiaires.title", { defaultValue: "Mes stagiaires" })}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {t("stagiaires.subtitle", {
                            defaultValue: "Consultez vos stagiaires et remplissez leur fiche d'évaluation.",
                        })}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
                    <button type="button" onClick={() => setFiltre("TOUS")} className={classeOnglet("TOUS")}>
                        <Users className="w-4 h-4 text-blue-500" />
                        {t("stagiaires.tabs.all", { defaultValue: "Tous mes stagiaires" })} ({stagiaires.length})
                    </button>
                    <button type="button" onClick={() => setFiltre("A_EVALUER")} className={classeOnglet("A_EVALUER")}>
                        <Clock className="w-4 h-4 text-amber-500" />
                        {t("stagiaires.tabs.to_evaluate", { defaultValue: "À évaluer" })} ({aEvaluerCount})
                    </button>
                    <button type="button" onClick={() => setFiltre("EVALUES")} className={classeOnglet("EVALUES")}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {t("stagiaires.tabs.evaluated", { defaultValue: "Évalués" })} ({evaluesCount})
                    </button>
                </div>

                {erreur && (
                    <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl flex items-center justify-between text-sm shadow-xs">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{erreur}</span>
                        </div>
                        <button onClick={() => setErreur(null)} className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-500">
                            {t("stagiaires.loading", { defaultValue: "Chargement de vos stagiaires..." })}
                        </p>
                    </div>
                ) : stagiairesFiltres.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800 mb-1">
                            {t("stagiaires.empty.title", { defaultValue: "Aucun stagiaire trouvé" })}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {t("stagiaires.empty.subtitle", {
                                defaultValue: "Vos stagiaires apparaîtront ici lorsque leur contrat aura été signé par toutes les parties.",
                            })}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {stagiairesFiltres.map((s) => (
                            <article
                                key={s.contratId}
                                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-200 p-6 md:p-7 space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{s.nomEtudiant}</h2>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">{s.discipline}</p>
                                        <p className="text-sm text-blue-700 font-semibold flex items-center gap-1.5 pt-1">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <span>{s.titreOffre}</span>
                                        </p>
                                    </div>
                                    <div>{getStatusBadge(s)}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {t("stagiaires.period", { defaultValue: "Période" })}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-800">
                                                {s.dateDebut} → {s.dateFin}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {t("stagiaires.company", { defaultValue: "Entreprise" })}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-800">{s.entreprise}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-3 border-t border-gray-100">
                                    {s.evalue ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/employeur/stagiaires/${s.contratId}/evaluation`)}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{t("stagiaires.actions.view", { defaultValue: "Voir l'évaluation" })}</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/employeur/stagiaires/${s.contratId}/evaluation`)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                        >
                                            <ClipboardCheck className="w-3.5 h-3.5" />
                                            <span>{t("stagiaires.actions.evaluate", { defaultValue: "Évaluer le stagiaire" })}</span>
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}