import { ArrowRight, Compass, FileText, Info } from "lucide-react";

export default function CarteContratRefuse({
    contratRefuse,
    changerOnglet,
    t
}) {
    const { titreOffre, nomEntreprise } = contratRefuse;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.contract_refused_title")}
                    </h2>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {titreOffre}
                    </p>
                    <p className="text-xs text-slate-500">
                        {nomEntreprise}
                    </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 bg-slate-100 text-slate-700 border border-slate-200">
                    {t("etudiant_dashboard.applications.status_contract_refused")}
                </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                        {t("etudiant_dashboard.next_step.contract_refused_status", {
                            entreprise: nomEntreprise
                        })}
                    </span>
                </div>
                <p>
                    {t("etudiant_dashboard.next_step.contract_refused_desc")}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
                <button
                    type="button"
                    onClick={() => changerOnglet("toutes")}
                    className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
                <button
                    type="button"
                    onClick={() => changerOnglet("contrats")}
                    className="btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t("etudiant_dashboard.next_step.view_contract_cta")}</span>
                </button>
            </div>
        </div>
    );
}
