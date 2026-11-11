import React from "react";
import {
    Users,
    UserCheck,
    UserX,
    Building2,
    Briefcase,
    RefreshCw
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

export default function TableEtudiantsAssignation({
    etudiants = [],
    loading = false,
    rechercheEtudiant = "",
    filtreStatut = "tous",
    onAssigner,
    onDesassigner
}) {
    const { t } = useTranslation("main");
    const { traduireDiscipline } = useOffreFormater();

    return (
        <div className="ds-card overflow-hidden">
            {loading ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm">
                        {t("assignation_professeurs.chargement")}
                    </p>
                </div>
            ) : etudiants.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-slate-800">
                        {t("assignation_professeurs.aucun_etudiant")}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                        {rechercheEtudiant || filtreStatut !== "tous"
                            ? t("assignation_professeurs.aucun_resultat_filtre")
                            : t("assignation_professeurs.aucun_etudiant_stage")}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">{t("assignation_professeurs.th_etudiant")}</th>
                                <th className="px-6 py-4">{t("assignation_professeurs.th_stage")}</th>
                                <th className="px-6 py-4">{t("assignation_professeurs.th_professeur")}</th>
                                <th className="px-6 py-4 text-right">{t("assignation_professeurs.th_action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {etudiants.map((etudiant) => (
                                <tr key={etudiant.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                {(etudiant.firstName || "").charAt(0)}
                                                {(etudiant.lastName || "").charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">
                                                    {etudiant.firstName} {etudiant.lastName}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <span>{t("assignation_professeurs.matricule_label")}: {etudiant.matricule || "—"}</span>
                                                    {etudiant.discipline && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                                                {traduireDiscipline(etudiant.discipline)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{etudiant.nomEntreprise || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate max-w-xs">{etudiant.titreOffreStage || "—"}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {etudiant.estAssigne && etudiant.professeurAssigne ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                                                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <div>
                                                    <div className="font-bold">
                                                        {etudiant.professeurAssigne.firstName} {etudiant.professeurAssigne.lastName}
                                                    </div>
                                                    <div className="text-[11px] text-emerald-700">
                                                        {etudiant.professeurAssigne.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                {t("assignation_professeurs.non_assigne")}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {etudiant.estAssigne ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onAssigner(etudiant)}
                                                        className="btn-secondary !py-1.5 !px-3 !text-xs"
                                                    >
                                                        {t("assignation_professeurs.btn_modifier")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDesassigner(etudiant)}
                                                        className="btn-danger-soft !py-1.5 !px-2.5 !text-xs"
                                                        title={t("assignation_professeurs.btn_desassigner")}
                                                        aria-label={t("assignation_professeurs.btn_desassigner")}
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onAssigner(etudiant)}
                                                    className="btn-primary !py-1.5 !px-3.5 !text-xs"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    {t("assignation_professeurs.btn_assigner")}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
