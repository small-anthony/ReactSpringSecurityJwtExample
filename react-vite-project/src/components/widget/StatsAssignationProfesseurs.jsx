import React from "react";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StatsAssignationProfesseurs({ stats }) {
    const { t } = useTranslation("main");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="ds-card p-5 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                        {t("assignation_professeurs.stats_total")}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                </div>
            </div>

            <div className="ds-card p-5 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                        {t("assignation_professeurs.stats_assignes")}
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.assignes}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                </div>
            </div>

            <div className="ds-card p-5 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                        {t("assignation_professeurs.stats_non_assignes")}
                    </p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.nonAssignes}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
