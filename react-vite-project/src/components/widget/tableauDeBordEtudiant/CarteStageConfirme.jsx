import { Building2, FileText } from "lucide-react";

export default function CarteStageConfirme({ contratSigneActif, changerOnglet, t }) {
    const { titreOffre, nomEntreprise, dateDebut, dateFin, salaire, statut } = contratSigneActif;
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-extrabold text-slate-900 break-words">
                        {titreOffre}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 mt-0.5 min-w-0">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="break-words">{nomEntreprise}</span>
                    </p>
                </div>
                <span className="self-start px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    {t("contrats_etudiant.status_stage_trouve")}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.dates")}
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block break-words">
                        {dateDebut} → {dateFin}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.salary")}
                    </span>
                    <span className="font-bold text-emerald-700 mt-0.5 block break-words">
                        {salaire}
                    </span>
                </div>
            </div>

            <p className="text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 font-medium">
                {statut === "COMPLETE"
                    ? t("etudiant_dashboard.next_step.stage_confirmed_complete")
                    : t("etudiant_dashboard.next_step.stage_confirmed_waiting_others")}
            </p>

            <button
                type="button"
                onClick={() => changerOnglet("contrats")}
                className="btn-outline w-full text-xs py-2.5"
            >
                <FileText className="w-4 h-4" />
                <span>{t("etudiant_dashboard.next_step.view_contract_cta")}</span>
            </button>
        </div>
    );
}

