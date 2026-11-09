import { Calendar, MapPin, Video } from "lucide-react";
import {
    estLienVirtuel,
    extraireCreneauEntrevue,
    extraireEntrepriseConvocation,
    extraireTitreConvocation
} from "./helpers.js";

export default function CarteProchaineEntrevue({
    prochaineEntrevue,
    formatShortDate,
    changerOnglet,
    t
}) {
    const { statut } = prochaineEntrevue;
    const titrePoste = extraireTitreConvocation(
        prochaineEntrevue,
        t("convocation.default_position")
    );
    const nomEntreprise = extraireEntrepriseConvocation(prochaineEntrevue, "");
    const creneau = extraireCreneauEntrevue(prochaineEntrevue);
    const dateCreneau = creneau ? creneau.date : null;
    const lieuCreneau = creneau ? creneau.lieu : null;
    const estAcceptee = statut === "ACCEPTEE";

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        {t("etudiant_dashboard.next_step.upcoming_interview_title")}
                    </h2>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {titrePoste}
                    </p>
                    <p className="text-xs text-slate-500">
                        {nomEntreprise}
                    </p>
                </div>
                <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                        estAcceptee
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                    }`}
                >
                    {estAcceptee
                        ? t("convocation.status.acceptee")
                        : t("convocation.filter_pending")}
                </span>
            </div>

            {creneau && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="capitalize">
                            {formatShortDate(dateCreneau)}
                        </span>
                    </div>
                    {lieuCreneau && (
                        <div className="flex items-center gap-2 text-slate-600">
                            {estLienVirtuel(lieuCreneau) ? (
                                <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                            )}
                            <span className="truncate">
                                {lieuCreneau}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => changerOnglet("convocations")}
                className="btn-outline w-full text-xs py-2.5"
            >
                <Calendar className="w-4 h-4" />
                <span>{t("etudiant_dashboard.next_step.manage_interviews_cta")}</span>
            </button>
        </div>
    );
}

