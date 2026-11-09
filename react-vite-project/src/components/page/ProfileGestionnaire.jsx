import { Shield, Briefcase, FileCheck2, FileSignature, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import {useTranslation} from "react-i18next";

const ProfileGestionnaire = () => {
    const { t } = useTranslation("main");

    const shortcuts = [
        { to: "/gestionnaire/approbations/offres", labelKey: "sidePanel.approbationsOffres", icon: Briefcase, color: "bg-blue-50 text-blue-600 border-blue-100" },
        { to: "/gestionnaire/approbations/cvs", labelKey: "sidePanel.approbationsCvs", icon: FileCheck2, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
        { to: "/gestionnaire/contrats", labelKey: "sidePanel.contrats", icon: FileSignature, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
        { to: "/gestionnaire/rapports", labelKey: "sidePanel.rapports", icon: BarChart3, color: "bg-amber-50 text-amber-600 border-amber-100" },
    ];

    return (
        <main className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)] overflow-hidden">
            <SidePanelGestionnaire activeTab="accueil" />

            <div className="flex-1 p-6 sm:p-10 md:p-12 flex flex-col justify-center items-center">
                <div className="ds-card p-8 sm:p-12 max-w-3xl w-full text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
                        <Shield className="w-8 h-8" strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                        {t('gestionnaire_home.title')}
                    </h2>
                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                        {t('gestionnaire_home.subtitle')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-4 border-t border-slate-100">
                        {shortcuts.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                            {t(item.labelKey)}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

        </main>
    );
}

export default ProfileGestionnaire;