import React from "react";
import { X, Calendar, Building, CheckCircle, Clock, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

const STATUT_STYLES = {
    EMBAUCHEE: {
        badge: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle
    },
    ACCEPTEE: {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle
    },
    REFUSEE: {
        badge: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle
    },
    EN_ATTENTE: {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock
    }
};

export default function ModalCandidaturesEtudiant({ etudiant, onClose }) {
    const { t } = useTranslation("main");
    const { traduireDiscipline } = useOffreFormater();

    if (!etudiant) return null;

    const candidatures = etudiant.candidatures || [];

    const formaterDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                            {etudiant.firstName} {etudiant.lastName}
                        </h2>
                        <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-2">
                            <span>{etudiant.email}</span>
                            <span>{etudiant.matricule}</span>
                            {etudiant.discipline && (
                                <>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        {traduireDiscipline(etudiant.discipline)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-3 flex-1">
                    {candidatures.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                            {t("gestionnaire_dashboard.modal_applications_empty")}
                        </div>
                    ) : (
                        candidatures.map((cand) => {
                            const style = STATUT_STYLES[cand.statut] || STATUT_STYLES.EN_ATTENTE;
                            const IconStatut = style.icon;
                            const dateAffichee = formaterDate(cand.dateCandidature);

                            return (
                                <div
                                    key={cand.id}
                                    className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition shadow-xs flex flex-col gap-2"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-sm">
                                                {cand.titreOffre || t("common.not_available")}
                                            </h3>
                                            <div className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                                                <Building className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-medium text-gray-800">
                                                    {cand.nomEntreprise || t("common.not_available")}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
                                            <IconStatut className="w-3 h-3" />
                                            <span>
                                                {t(`gestionnaire_dashboard.statut_candidature.${cand.statut}`, {
                                                    defaultValue: cand.statut
                                                })}
                                            </span>
                                        </span>
                                    </div>

                                    {dateAffichee && (
                                        <div className="text-[11px] text-gray-400 flex items-center gap-1 pt-1 border-t border-gray-50">
                                            <Calendar className="w-3 h-3" />
                                            <span>{dateAffichee}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-500">
                        {candidatures.length} {t(candidatures.length > 1 ? "gestionnaire_dashboard.applications_plural" : "gestionnaire_dashboard.application")}
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                        {t("common.close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
