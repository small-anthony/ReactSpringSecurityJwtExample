import { Building2, FileText } from "lucide-react";

export default function CarteStageConfirme({ contratSigneActif, changerOnglet, t }) {
    const { titreOffre, nomEntreprise, dateDebut, dateFin, salaire, statut } = contratSigneActif;
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                        {titreOffre}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-4 h-4" />
                        <span>{nomEntreprise}</span>
                    </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    {t("contrats_etudiant.status_stage_trouve")}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.dates")}
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                        {dateDebut} → {dateFin}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                        {t("contrats.table.salary")}
                    </span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
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

