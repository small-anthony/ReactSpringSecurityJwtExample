import React from "react";
import { Users, CheckCircle, HelpCircle, Clock, AlertTriangle, AlertCircle, ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const CARTES = [
    {
        key: "TOUS",
        statKey: "total",
        labelKey: "gestionnaire_dashboard.kpi_total",
        Icon: Users,
        activeClass: "bg-gray-900 text-white border-gray-900 shadow-sm ring-2 ring-gray-900/20",
        inactiveClass: "bg-white border-gray-200 hover:border-gray-300",
        labelActive: "text-gray-200",
        labelInactive: "text-gray-500",
        iconInactive: "text-gray-500",
        valueInactive: "text-gray-900",
    },
    {
        key: "STAGE_TROUVE",
        statKey: "stageTrouve",
        labelKey: "gestionnaire_dashboard.status.STAGE_TROUVE",
        Icon: CheckCircle,
        activeClass: "bg-green-700 text-white border-green-700 shadow-sm ring-2 ring-green-600/30",
        inactiveClass: "bg-white border-green-200 hover:border-green-300",
        labelActive: "text-green-100",
        labelInactive: "text-green-700",
        iconInactive: "text-green-600",
        valueInactive: "text-green-700",
    },
    {
        key: "NON_EVALUE_PROFESSEUR",
        statKey: "nonEvalueProfesseur",
        labelKey: "gestionnaire_dashboard.status.NON_EVALUE_PROFESSEUR",
        Icon: ClipboardCheck,
        activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30",
        inactiveClass: "bg-white border-amber-200 hover:border-amber-300",
        labelActive: "text-amber-100",
        labelInactive: "text-amber-700",
        iconInactive: "text-amber-600",
        valueInactive: "text-amber-700",
    },
    {
        key: "EN_ATTENTE_REPONSE",
        statKey: "attenteReponse",
        labelKey: "gestionnaire_dashboard.status.EN_ATTENTE_REPONSE",
        Icon: HelpCircle,
        activeClass: "bg-purple-700 text-white border-purple-700 shadow-sm ring-2 ring-purple-600/30",
        inactiveClass: "bg-white border-purple-200 hover:border-purple-300",
        labelActive: "text-purple-100",
        labelInactive: "text-purple-700",
        iconInactive: "text-purple-600",
        valueInactive: "text-purple-700",
    },
    {
        key: "EN_ATTENTE_ENTREVUE",
        statKey: "attenteEntrevue",
        labelKey: "gestionnaire_dashboard.status.EN_ATTENTE_ENTREVUE",
        Icon: Clock,
        activeClass: "bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-blue-600/30",
        inactiveClass: "bg-white border-blue-200 hover:border-blue-300",
        labelActive: "text-blue-100",
        labelInactive: "text-blue-700",
        iconInactive: "text-blue-600",
        valueInactive: "text-blue-700",
    },
    {
        key: "SANS_CONVOCATION",
        statKey: "sansConvocation",
        labelKey: "gestionnaire_dashboard.status.SANS_CONVOCATION",
        Icon: AlertTriangle,
        activeClass: "bg-orange-700 text-white border-orange-700 shadow-sm ring-2 ring-orange-600/30",
        inactiveClass: "bg-white border-orange-200 hover:border-orange-300",
        labelActive: "text-orange-100",
        labelInactive: "text-orange-700",
        iconInactive: "text-orange-600",
        valueInactive: "text-orange-700",
    },
    {
        key: "AUCUNE_CANDIDATURE",
        statKey: "aucuneCandidature",
        labelKey: "gestionnaire_dashboard.status.AUCUNE_CANDIDATURE",
        Icon: AlertCircle,
        activeClass: "bg-red-700 text-white border-red-700 shadow-sm ring-2 ring-red-600/30",
        inactiveClass: "bg-white border-red-200 hover:border-red-300",
        labelActive: "text-red-100",
        labelInactive: "text-red-700",
        iconInactive: "text-red-600",
        valueInactive: "text-red-700",
    },
];

export default function CartesKpiRapportGestionnaire({ stats, filtreStatut, onSelectFiltre }) {
    const { t } = useTranslation("main");

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {CARTES.map(({ key, statKey, labelKey, Icon, activeClass, inactiveClass, labelActive, labelInactive, iconInactive, valueInactive }) => {
                const actif = filtreStatut === key;
                const handleClick = () => {
                    if (key === "TOUS") {
                        onSelectFiltre("TOUS");
                        return;
                    }
                    onSelectFiltre(actif ? "TOUS" : key);
                };

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={handleClick}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${actif ? activeClass : inactiveClass}`}
                    >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                            <span className={`text-[11px] font-bold uppercase tracking-wider leading-tight ${actif ? labelActive : labelInactive}`}>
                                {t(labelKey)}
                            </span>
                            <Icon className={`w-4 h-4 shrink-0 ${actif ? "text-white" : iconInactive}`} />
                        </div>
                        <div className={`text-2xl font-extrabold ${actif ? "text-white" : valueInactive}`}>
                            {stats[statKey] ?? 0}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

