import React from "react";
import { Eye, ClipboardCheck, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

const COULEURS_STATUT = {
    STAGE_TROUVE: "bg-green-100 text-green-800 border-green-200",
    EN_ATTENTE_REPONSE: "bg-purple-100 text-purple-800 border-purple-200",
    EN_ATTENTE_ENTREVUE: "bg-blue-100 text-blue-800 border-blue-200",
    SANS_CONVOCATION: "bg-orange-100 text-orange-800 border-orange-200",
    AUCUNE_CANDIDATURE: "bg-red-100 text-red-800 border-red-200",
};

export default function TableRapportsEtudiants({
    etudiants = [],
    onVoirCandidatures,
    onConsulterEvaluation,
}) {
    const { t } = useTranslation("main");
    const { traduireDiscipline } = useOffreFormater();

    const libelleStatut = (statut) => {
        if (!statut) return t("common.not_available");
        const key = `gestionnaire_dashboard.status.${statut}`;
        const translated = t(key);
        return translated === key ? statut : translated;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">{t("gestionnaire_dashboard.th_student")}</th>
                        <th className="px-6 py-4">{t("gestionnaire_dashboard.th_status")}</th>
                        <th className="px-6 py-4">{t("gestionnaire_dashboard.th_evaluation")}</th>
                        <th className="px-6 py-4">{t("gestionnaire_dashboard.th_offers")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {etudiants.map((etudiant) => (
                        <tr key={etudiant.id} className="hover:bg-gray-50/60 transition">
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-gray-900">
                                        {etudiant.firstName} {etudiant.lastName}
                                    </span>
                                    {etudiant.discipline && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            {traduireDiscipline(etudiant.discipline)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                    <span>{etudiant.email}</span>
                                    {etudiant.matricule && (
                                        <span className="font-mono text-gray-400">{etudiant.matricule}</span>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                        COULEURS_STATUT[etudiant.statutStage] || "bg-gray-100 text-gray-700 border-gray-200"
                                    }`}
                                >
                                    {libelleStatut(etudiant.statutStage)}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                {etudiant.milieuEvalue ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>{t("gestionnaire_dashboard.milieu_evalue")}</span>
                                        </span>
                                        {onConsulterEvaluation && (
                                            <button
                                                type="button"
                                                onClick={() => onConsulterEvaluation(etudiant.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition cursor-pointer"
                                            >
                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                <span>{t("gestionnaire_dashboard.voir_evaluation")}</span>
                                            </button>
                                        )}
                                    </div>
                                ) : etudiant.statutStage === "STAGE_TROUVE" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{t("gestionnaire_dashboard.en_attente_professeur")}</span>
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                )}
                            </td>

                            <td className="px-6 py-4">
                                {etudiant.candidatures && etudiant.candidatures.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => onVoirCandidatures?.(etudiant)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition-all shadow-2xs cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>
                                            {t("gestionnaire_dashboard.view_count", {
                                                count: etudiant.candidatures.length,
                                            })}
                                        </span>
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">
                                        {t("gestionnaire_dashboard.no_application")}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
