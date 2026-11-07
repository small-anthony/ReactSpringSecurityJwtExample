import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Briefcase, FileCheck2, FileSignature, BarChart3, ShieldCheck } from "lucide-react";

export default function SidePanelGestionnaire({ activeTab = "none" }) {
    const { t } = useTranslation("main");
    const tabs = [
        {
            key: "approbationsOffres",
            label: t("sidepanel.offres"),
            to: "/gestionnaire/approbations/offres",
            icon: Briefcase
        },
        {
            key: "approbationsCvs",
            alias: "approbations",
            label: t("sidepanel.cvs"),
            to: "/gestionnaire/approbations/cvs",
            icon: FileCheck2
        },
        {
            key: "contrats",
            label: t("sidepanel.contrats"),
            to: "/gestionnaire/contrats",
            icon: FileSignature
        },
        {
            key: "rapports",
            label: t("sidepanel.rapports"),
            to: "/gestionnaire/rapports",
            icon: BarChart3
        },
    ];

    return (
        <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200/90 flex-shrink-0 p-6 min-h-full">
            <Link
                to="/gestionnaire"
                className="flex items-center gap-2.5 mb-8 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            >
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {t("sidepanel.title")}
                </h1>
            </Link>

            <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key || (tab.alias && activeTab === tab.alias);
                    const IconComponent = tab.icon;
                    return (
                        <Link
                            key={tab.key}
                            to={tab.to}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-3 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900"
                            }`}
                        >
                            <IconComponent
                                className={`w-4 h-4 shrink-0 ${
                                    isActive ? "text-white" : "text-slate-400"
                                }`}
                            />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
