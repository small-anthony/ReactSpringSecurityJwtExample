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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {loading ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm font-medium">
                        {t("assignation_professeurs.chargement")}
                    </p>
                </div>
            ) : etudiants.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                        {t("assignation_professeurs.aucun_etudiant")}
                    </p>
                    <p className="text-xs text-gray-500 max-w-sm">
                        {rechercheEtudiant || filtreStatut !== "tous"
                            ? t("assignation_professeurs.aucun_resultat_filtre")
                            : t("assignation_professeurs.aucun_etudiant_stage")}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <th className="py-3.5 px-4 sm:px-6">{t("assignation_professeurs.th_etudiant")}</th>
                                <th className="py-3.5 px-4">{t("assignation_professeurs.th_stage")}</th>
                                <th className="py-3.5 px-4">{t("assignation_professeurs.th_professeur")}</th>
                                <th className="py-3.5 px-4 sm:px-6 text-right">{t("assignation_professeurs.th_action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {etudiants.map((etudiant) => (
                                <tr key={etudiant.id} className="hover:bg-gray-50/80 transition duration-150">
                                    <td className="py-4 px-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                {(etudiant.firstName || "").charAt(0)}
                                                {(etudiant.lastName || "").charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {etudiant.firstName} {etudiant.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <span>Matricule: {etudiant.matricule || "—"}</span>
                                                    {etudiant.discipline && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{traduireDiscipline(etudiant.discipline)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>{etudiant.nomEntreprise || "—"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-xs">{etudiant.titreOffreStage || "—"}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
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
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                {t("assignation_professeurs.non_assigne")}
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-4 px-4 sm:px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {etudiant.estAssigne ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onAssigner(etudiant)}
                                                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-150 cursor-pointer border border-blue-200"
                                                    >
                                                        {t("assignation_professeurs.btn_modifier")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDesassigner(etudiant)}
                                                        className="p-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-150 cursor-pointer"
                                                        title={t("assignation_professeurs.btn_desassigner")}
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onAssigner(etudiant)}
                                                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-sm transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
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
