import { ArrowRight, Briefcase, Building2, Calendar } from "lucide-react";

const MESSAGE_OFFRE_SUPPRIMEE = "L'offre a été supprimée par l'employeur";
const MESSAGE_AUTRE_STAGE_CHOISI = "L'étudiant a choisi une autre offre de stage.";

export default function SectionCandidaturesRecentes({
    candidaturesTrieesApercu,
    totalCandidatures,
    nombreOffresDisponibles,
    candidaturesParOffre,
    renderCandidatureBadge,
    formatShortDate,
    changerOnglet,
    onSelectionnerOffre,
    t
}) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{t("etudiant_dashboard.applications.title")}</span>
                </h2>
                {totalCandidatures > 0 && (
                    <button
                        type="button"
                        onClick={() => changerOnglet("mes_candidatures")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>
                            {t("etudiant_dashboard.applications.view_all", {
                                count: totalCandidatures
                            })}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {candidaturesTrieesApercu.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-2.5 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-800">
                        {t("etudiant_dashboard.applications.empty_title")}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {t("etudiant_dashboard.applications.empty_desc")}
                    </p>
                    {nombreOffresDisponibles > 0 && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={() => changerOnglet("toutes")}
                                className="btn-outline text-xs py-2 px-4"
                            >
                                <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {candidaturesTrieesApercu.map((offre) => {
                        const { id, titre, nomEntreprise, dateDebut, dateFin } = offre;
                        const candidature = candidaturesParOffre[id];
                        const statut = candidature ? candidature.statut : null;
                        const messageReponse = candidature ? candidature.messageReponse : null;
                        const estAutreStageChoisi = messageReponse === MESSAGE_AUTRE_STAGE_CHOISI;
                        const texteRefus =
                            messageReponse === MESSAGE_OFFRE_SUPPRIMEE
                                ? t("candidature_etudiant.offer_deleted")
                                : estAutreStageChoisi
                                    ? t("candidature_etudiant.other_stage_chosen")
                                    : messageReponse;

                        return (
                            <div
                                key={id}
                                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 break-words">
                                            {titre}
                                        </h3>
                                        {renderCandidatureBadge(id)}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-wrap min-w-0">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="break-words">{nomEntreprise}</span>
                                        {(dateDebut || dateFin) && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                <span>
                                                    {dateDebut && dateFin
                                                        ? `${formatShortDate ? formatShortDate(dateDebut) : dateDebut} → ${formatShortDate ? formatShortDate(dateFin) : dateFin}`
                                                        : (formatShortDate ? formatShortDate(dateDebut || dateFin) : (dateDebut || dateFin))}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    {statut === "REFUSEE" && texteRefus && (
                                        <p className={`text-xs line-clamp-1 break-words ${estAutreStageChoisi ? "text-slate-600" : "text-rose-600"}`}>
                                            {texteRefus}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onSelectionnerOffre(offre)}
                                    className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                                >
                                    {t("offres_etudiant.btn_see_details")}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

