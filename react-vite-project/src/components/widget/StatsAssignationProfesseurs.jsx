import React from "react";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const CARTES_KPI = [
    {
        key: "tous",
        statKey: "total",
        labelKey: "assignation_professeurs.stats_total",
        icon: GraduationCap,
        activeCard: "border-2 border-gray-900",
        inactiveCard: "border border-gray-200 hover:border-gray-300",
        labelClass: "text-gray-500",
        iconClass: "text-gray-500",
        valueClass: "text-gray-900"
    },
    {
        key: "assignes",
        statKey: "assignes",
        labelKey: "assignation_professeurs.stats_assignes",
        icon: UserCheck,
        activeCard: "border-2 border-green-600",
        inactiveCard: "border border-green-200 hover:border-green-300",
        labelClass: "text-green-700",
        iconClass: "text-green-600",
        valueClass: "text-green-700"
    },
    {
        key: "non_assignes",
        statKey: "nonAssignes",
        labelKey: "assignation_professeurs.stats_non_assignes",
        icon: Users,
        activeCard: "border-2 border-orange-600",
        inactiveCard: "border border-orange-200 hover:border-orange-300",
        labelClass: "text-orange-700",
        iconClass: "text-orange-600",
        valueClass: "text-orange-700"
    }
];

export default function StatsAssignationProfesseurs({ stats, filtreStatut = "tous", onChangeFiltre }) {
    const { t } = useTranslation("main");

    const gererClic = (key) => {
        if (!onChangeFiltre) return;
        if (key === "tous") {
            onChangeFiltre("tous");
            return;
        }
        onChangeFiltre(filtreStatut === key ? "tous" : key);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
            {CARTES_KPI.map((carte) => {
                const Icon = carte.icon;
                const estActif = filtreStatut === carte.key;
                return (
                    <button
                        key={carte.key}
                        type="button"
                        onClick={() => gererClic(carte.key)}
                        className={`min-w-0 overflow-hidden p-3.5 rounded-xl bg-white text-left transition cursor-pointer ${
                            estActif ? carte.activeCard : carte.inactiveCard
                        }`}
                    >
                        <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                            <span
                                className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${carte.labelClass}`}
                            >
                                {t(carte.labelKey)}
                            </span>
                            <Icon
                                className={`w-4 h-4 shrink-0 mt-0.5 ${carte.iconClass}`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-extrabold ${carte.valueClass}`}
                        >
                            {stats[carte.statKey]}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
