import { ArrowRight, Compass } from "lucide-react";

export default function SectionDecouvrirOffres({
    offresDisponiblesNonPostulees,
    traduireDiscipline,
    changerOnglet,
    onSelectionnerOffre,
    t
}) {
    const apercuOffres = offresDisponiblesNonPostulees.slice(0, 3);
    return (
        <section className="ds-card p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.discover.title")}</span>
                </h2>
                <button
                    type="button"
                    onClick={() => changerOnglet("toutes")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                    <span>
                        {t("etudiant_dashboard.discover.view_all", {
                            count: offresDisponiblesNonPostulees.length
                        })}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {apercuOffres.map((offre) => {
                    const { id, titre, nomEntreprise, discipline } = offre;
                    return (
                        <div
                            key={id}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <h3 className="text-xs font-bold text-slate-900 truncate">
                                    {titre}
                                </h3>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {nomEntreprise}
                                    {discipline ? ` • ${traduireDiscipline(discipline)}` : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onSelectionnerOffre(offre)}
                                className="btn-ghost text-xs py-1.5 px-2.5 shrink-0 text-blue-600 hover:text-blue-700"
                            >
                                {t("offres_etudiant.btn_see_details")}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

