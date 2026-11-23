import React from "react";
import { GraduationCap, UserCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const CARTES_KPI = [
    {
        key: "tous",
        statKey: "total",
        labelKey: "assignation_professeurs.stats_total",
        icon: GraduationCap,
        activeCard: "bg-gray-900 text-white border-gray-900 shadow-sm ring-2 ring-gray-900/20",
        inactiveCard: "bg-white border-gray-200 hover:border-gray-300",
        activeLabel: "text-gray-200",
        inactiveLabel: "text-gray-500",
        activeIcon: "text-white opacity-70",
        inactiveIcon: "opacity-70",
        activeValue: "text-white",
        inactiveValue: "text-gray-900"
    },
    {
        key: "assignes",
        statKey: "assignes",
        labelKey: "assignation_professeurs.stats_assignes",
        icon: UserCheck,
        activeCard: "bg-green-700 text-white border-green-700 shadow-sm ring-2 ring-green-600/30",
        inactiveCard: "bg-white border-green-200 hover:border-green-300",
        activeLabel: "text-green-100",
        inactiveLabel: "text-green-700",
        activeIcon: "text-white",
        inactiveIcon: "text-green-600",
        activeValue: "text-white",
        inactiveValue: "text-green-700"
    },
    {
        key: "non_assignes",
        statKey: "nonAssignes",
        labelKey: "assignation_professeurs.stats_non_assignes",
        icon: Users,
        activeCard: "bg-orange-700 text-white border-orange-700 shadow-sm ring-2 ring-orange-600/30",
        inactiveCard: "bg-white border-orange-200 hover:border-orange-300",
        activeLabel: "text-orange-100",
        inactiveLabel: "text-orange-700",
        activeIcon: "text-white",
        inactiveIcon: "text-orange-600",
        activeValue: "text-white",
        inactiveValue: "text-orange-700"
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
                        className={`min-w-0 overflow-hidden p-3.5 rounded-xl border text-left transition cursor-pointer ${
                            estActif ? carte.activeCard : carte.inactiveCard
                        }`}
                    >
                        <div className="flex items-start justify-between gap-1.5 mb-1 min-w-0">
                            <span
                                className={`min-w-0 flex-1 break-words text-[11px] font-bold uppercase tracking-wide ${
                                    estActif ? carte.activeLabel : carte.inactiveLabel
                                }`}
                            >
                                {t(carte.labelKey)}
                            </span>
                            <Icon
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                    estActif ? carte.activeIcon : carte.inactiveIcon
                                }`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-extrabold ${
                                estActif ? carte.activeValue : carte.inactiveValue
                            }`}
                        >
                            {stats[carte.statKey]}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
