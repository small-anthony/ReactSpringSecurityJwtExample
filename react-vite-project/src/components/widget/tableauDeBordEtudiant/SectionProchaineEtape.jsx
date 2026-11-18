import { Compass } from "lucide-react";
import CarteStageConfirme from "./CarteStageConfirme.jsx";
import CarteContratRefuse from "./CarteContratRefuse.jsx";
import CarteProchaineEntrevue from "./CarteProchaineEntrevue.jsx";

export default function SectionProchaineEtape({
    contratSigneActif,
    contratRefuse,
    prochaineEntrevue,
    totalCandidatures,
    nombreOffresDisponibles,
    formatShortDate,
    changerOnglet,
    t
}) {
    return (
        <section className="ds-card p-5 sm:p-6 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                {t("etudiant_dashboard.next_step.label")}
            </span>

            {contratSigneActif ? (
                <CarteStageConfirme
                    contratSigneActif={contratSigneActif}
                    changerOnglet={changerOnglet}
                    t={t}
                />
            ) : contratRefuse ? (
                <CarteContratRefuse
                    contratRefuse={contratRefuse}
                    changerOnglet={changerOnglet}
                    t={t}
                />
            ) : prochaineEntrevue ? (
                <CarteProchaineEntrevue
                    prochaineEntrevue={prochaineEntrevue}
                    formatShortDate={formatShortDate}
                    changerOnglet={changerOnglet}
                    t={t}
                />
            ) : totalCandidatures > 0 ? (
                <div className="space-y-3.5">
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.in_progress_title", {
                            count: totalCandidatures
                        })}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {t("etudiant_dashboard.next_step.in_progress_desc")}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => changerOnglet("mes_candidatures")}
                            className="btn-secondary text-xs py-2 px-3.5"
                        >
                            {t("etudiant_dashboard.next_step.view_applications_cta")}
                        </button>
                        {nombreOffresDisponibles > 0 && (
                            <button
                                type="button"
                                onClick={() => changerOnglet("toutes")}
                                className="btn-outline text-xs py-2 px-3.5"
                            >
                                <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-3.5">
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.no_application_title")}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {t("etudiant_dashboard.next_step.no_application_desc", {
                            count: nombreOffresDisponibles
                        })}
                    </p>
                    <button
                        type="button"
                        onClick={() => changerOnglet("toutes")}
                        className="btn-primary w-full text-xs py-2.5"
                    >
                        <Compass className="w-4 h-4" />
                        <span>{t("etudiant_dashboard.todo.explore_cta")}</span>
                    </button>
                </div>
            )}
        </section>
    );
}

