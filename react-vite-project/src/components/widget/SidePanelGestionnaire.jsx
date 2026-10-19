import React from "react";
import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next";

export default function SidePanelGestionnaire({ activeTab = "none" }) {
    const { t } = useTranslation("main");
    const tabs = [
        { key: "approbationsOffres", label: t('sidepanel.offres'), to: "/gestionnaire/approbations/offres" },
        { key: "approbationsCvs", label: t('sidepanel.cvs'), to: "/gestionnaire/approbations/cvs" },
    ];

    return (
        <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 p-6 min-h-full">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">
                {t('sidepanel.title')}
            </h1>

            <nav className="flex flex-col gap-3">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Link
                            key={tab.key}
                            to={tab.to}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 w-full text-left
                                ${isActive ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
                            }
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}