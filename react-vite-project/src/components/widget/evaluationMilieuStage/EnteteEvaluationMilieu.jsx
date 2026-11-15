import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    GraduationCap,
    Building2,
    Briefcase,
    Calendar,
    Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoCase } from "./ChampsEvaluationMilieu.jsx";

export function LienRetourEvaluation({ estGestionnaire, onRetour }) {
    const { t } = useTranslation("main");
    const libelle = estGestionnaire
        ? t("evaluation_milieu.back_gestionnaire")
        : t("evaluation_milieu.back_professeur");

    if (onRetour) {
        return (
            <button
                type="button"
                onClick={onRetour}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>{libelle}</span>
            </button>
        );
    }

    return (
        <Link
            to={estGestionnaire ? "/gestionnaire" : "/professeur"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>{libelle}</span>
        </Link>
    );
}

export function ChargementEvaluationMilieu() {
    const { t } = useTranslation("main");
    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-500">{t("evaluation_milieu.loading")}</p>
        </div>
    );
}

export function ErreurChargementEvaluationMilieu({ estGestionnaire, erreurChargement, onRetour }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <LienRetourEvaluation estGestionnaire={estGestionnaire} onRetour={onRetour} />
            <div role="alert" className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-sm shadow-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{erreurChargement}</span>
            </div>
        </div>
    );
}

export default function EnteteEvaluationMilieu({
    estGestionnaire,
    lecture,
    erreurSoumission,
    erreursChamps,
    succes,
    evaluation,
    dossier,
    hautRef,
    onRetour
}) {
    const { t, i18n } = useTranslation("main");

    return (
        <>
            <div ref={hautRef} className="space-y-4 scroll-mt-24">
                <LienRetourEvaluation estGestionnaire={estGestionnaire} onRetour={onRetour} />
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        {t("evaluation_milieu.program_header")}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-800 mt-1">
                        {lecture ? t("evaluation_milieu.title_view") : t("evaluation_milieu.title")}
                    </h1>
                    {!lecture && <p className="text-gray-500 mt-1">{t("evaluation_milieu.subtitle")}</p>}
                </div>
            </div>

            {erreurSoumission && (
                <div role="alert" className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-sm shadow-xs">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="font-semibold">{erreurSoumission}</p>
                    </div>
                </div>
            )}

            {succes && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl flex items-center gap-2 text-sm shadow-xs">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>{t("evaluation_milieu.success")}</span>
                </div>
            )}

            {lecture && evaluation && (
                <div className="p-4 bg-blue-50 border border-blue-200/80 text-blue-800 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 shrink-0 text-blue-600" />
                        <span>{t("evaluation_milieu.readonly_notice")}</span>
                    </div>
                    {evaluation.dateEvaluation && (
                        <span>
                            {t("evaluation_milieu.submitted_on", {
                                date: (String(evaluation.dateEvaluation).length === 10
                                    ? new Date(`${evaluation.dateEvaluation}T00:00:00`)
                                    : new Date(evaluation.dateEvaluation)
                                ).toLocaleDateString(i18n?.language),
                                professeur: evaluation.nomProfesseur || evaluation.signatureEnseignant
                            })}
                        </span>
                    )}
                </div>
            )}

            {dossier && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoCase icone={<GraduationCap className="w-4 h-4" />} libelle={t("evaluation_milieu.summary_card.student")} valeur={dossier.nomStagiaire} />
                        <InfoCase icone={<Building2 className="w-4 h-4" />} libelle={t("evaluation_milieu.summary_card.company")} valeur={dossier.nomEntreprise} />
                        <InfoCase icone={<Briefcase className="w-4 h-4" />} libelle={t("evaluation_milieu.summary_card.position")} valeur={dossier.titreOffre} />
                        <InfoCase icone={<Calendar className="w-4 h-4" />} libelle={t("evaluation_milieu.summary_card.period")} valeur={dossier.dateStage} />
                    </div>
                </section>
            )}
        </>
    );
}
