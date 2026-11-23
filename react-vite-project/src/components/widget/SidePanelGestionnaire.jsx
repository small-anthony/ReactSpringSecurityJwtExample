import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Briefcase,
    ChevronLeft,
    ChevronRight,
    FileCheck,
    FileText,
    LayoutDashboard,
    UserCheck
} from "lucide-react";

const STORAGE_KEY = "sidepanel_gestionnaire_retracte";

function lireEtatInitial() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

export default function SidePanelGestionnaire({ activeTab = "dashboard" }) {
    const { t } = useTranslation("main");
    const [retracte, setRetracte] = useState(lireEtatInitial);

    const toggleRetracte = () => {
        setRetracte((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
            }
            return next;
        });
    };

    const tabs = [
        { key: "dashboard", label: t("sidepanel.dashboard"), to: "/gestionnaire", Icon: LayoutDashboard },
        { key: "approbationsOffres", label: t("sidepanel.offres"), to: "/gestionnaire/approbations/offres", Icon: Briefcase },
        { key: "approbationsCvs", label: t("sidepanel.cvs"), to: "/gestionnaire/approbations/cvs", Icon: FileCheck },
        { key: "contrats", label: t("sidepanel.contrats"), to: "/gestionnaire/contrats", Icon: FileText },
        { key: "assignationProfesseurs", label: t("sidepanel.assignation_professeurs"), to: "/gestionnaire/assignation-professeurs", Icon: UserCheck },
    ];

    return (
        <aside
            className={`w-full bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 md:min-h-screen transition-all duration-200 ${
                retracte ? "md:w-20 p-3 md:py-6 md:px-3" : "md:w-72 p-5 sm:p-6"
            }`}
        >
            <div className={`flex items-center ${retracte ? "justify-between md:justify-center" : "justify-between"} gap-2 ${retracte ? "mb-2 md:mb-8" : "mb-6 md:mb-8"}`}>
                <h1 className={`text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight truncate ${retracte ? "md:hidden" : ""}`}>
                    {t("sidepanel.title")}
                </h1>
                <button
                    type="button"
                    id="btn-toggle-sidepanel-gestionnaire"
                    onClick={toggleRetracte}
                    title={retracte ? t("sidepanel.expand") : t("sidepanel.collapse")}
                    aria-label={retracte ? t("sidepanel.expand") : t("sidepanel.collapse")}
                    aria-expanded={!retracte}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer shrink-0"
                >
                    {retracte ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            <nav className={`flex flex-col gap-2.5 ${retracte ? "hidden md:flex" : "flex"}`}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.Icon;
                    return (
                        <Link
                            key={tab.key}
                            to={tab.to}
                            title={tab.label}
                            aria-label={tab.label}
                            className={`rounded-xl font-semibold transition-all flex items-center w-full ${
                                retracte ? "justify-center px-2 py-3" : "px-4 py-3 gap-3 text-left"
                            } ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!retracte && <span className="truncate">{tab.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}