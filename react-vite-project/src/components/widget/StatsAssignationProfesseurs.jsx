import React from "react";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StatsAssignationProfesseurs({ stats }) {
    const { t } = useTranslation("main");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">
                        {t("assignation_professeurs.stats_total")}
                    </p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">
                        {t("assignation_professeurs.stats_assignes")}
                    </p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.assignes}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">
                        {t("assignation_professeurs.stats_non_assignes")}
                    </p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.nonAssignes}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
