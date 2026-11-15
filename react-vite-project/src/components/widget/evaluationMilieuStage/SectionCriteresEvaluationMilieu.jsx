import React from "react";
import { Clock, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    CRITERES_MILIEU,
    NIVEAUX,
    aReponseNegative,
    compterCriteresRepondus
} from "./evaluationMilieuHelpers.js";
import {
    ChampTexteEvaluation,
    ErreurChampInline,
    OptionRadio,
    classeChampEvaluation
} from "./ChampsEvaluationMilieu.jsx";

export default function SectionCriteresEvaluationMilieu({
    formulaire,
    erreursChamps,
    lecture,
    majChamp,
    majReponse
}) {
    const { t } = useTranslation("main");
    const criteresRepondus = compterCriteresRepondus(formulaire.reponses);
    const reponseNegativePresente = aReponseNegative(formulaire.reponses);
    const progression = Math.round((criteresRepondus / CRITERES_MILIEU.length) * 100);
    const complet = criteresRepondus === CRITERES_MILIEU.length;

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section3.title")}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{t("evaluation_milieu.section3.subtitle")}</p>
                    </div>
                    {!lecture && (
                        <span
                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${
                                complet
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                        >
                            {t("evaluation_milieu.section3.progress_label", {
                                repondus: criteresRepondus,
                                total: CRITERES_MILIEU.length
                            })}
                        </span>
                    )}
                </div>
                {!lecture && (
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${complet ? "bg-emerald-500" : "bg-blue-600"}`}
                            style={{ width: `${progression}%` }}
                        />
                    </div>
                )}
            </div>

            <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2.5">
                {t("evaluation_milieu.section3.asterisk_note")}
            </p>

            <div>
                {CRITERES_MILIEU.map((critere, index) => {
                    const libelle = t(`evaluation_milieu.section3.criteres.${critere}`);
                    const erreurCritere = erreursChamps[`critere_${critere}`];
                    return (
                        <div
                            key={critere}
                            data-champ-erreur={Boolean(erreurCritere)}
                            className={`py-4 border-b border-gray-100 last:border-b-0 space-y-3 transition-colors ${
                                erreurCritere ? "rounded-xl px-4 my-1 bg-rose-50/40 ring-1 ring-inset ring-rose-200 border-b-0" : ""
                            }`}
                        >
                            <p className="text-sm font-medium text-gray-800">
                                {index + 1}. {libelle}
                            </p>
                            <div role="radiogroup" aria-label={libelle} className="flex flex-wrap gap-2">
                                {NIVEAUX.map((niveau) => {
                                    const libelleNiveau = t(`evaluation_milieu.section3.levels.${niveau}`);
                                    return (
                                        <OptionRadio
                                            key={niveau}
                                            nom={critere}
                                            valeur={niveau}
                                            selectionnee={formulaire.reponses[critere] === niveau}
                                            onSelect={() => majReponse(critere, niveau)}
                                            disabled={lecture}
                                            ariaLabel={`${libelle} : ${libelleNiveau}`}
                                        >
                                            {libelleNiveau}
                                        </OptionRadio>
                                    );
                                })}
                            </div>
                            <ErreurChampInline message={erreurCritere} />

                            {critere === "TEMPS_ENCADREMENT_SUFFISANT" && (
                                <div className="mt-3 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>{t("evaluation_milieu.section3.heures_encadrement.titre")}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[1, 2, 3].map((mois) => (
                                            <ChampTexteEvaluation
                                                key={mois}
                                                id={`heures-mois-${mois}`}
                                                label={t(`evaluation_milieu.section3.heures_encadrement.mois${mois}`)}
                                                champ={`heuresEncadrementMois${mois}`}
                                                formulaire={formulaire}
                                                erreursChamps={erreursChamps}
                                                lecture={lecture}
                                                majChamp={majChamp}
                                                inputMode="decimal"
                                                placeholder={t("evaluation_milieu.section3.heures_encadrement.placeholder")}
                                                labelClass="block text-xs font-semibold text-gray-700 mb-1"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {critere === "SALAIRE_INTERESSANT" && (
                                <div
                                    data-champ-erreur={Boolean(erreursChamps.salaireHoraire)}
                                    className="mt-3 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80"
                                >
                                    <label htmlFor="salaire-horaire" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <span>{t("evaluation_milieu.section3.salaire.label")} *</span>
                                    </label>
                                    <div className="flex items-center max-w-xs gap-2">
                                        <input
                                            id="salaire-horaire"
                                            type="text"
                                            value={formulaire.salaireHoraire}
                                            onChange={(e) => majChamp("salaireHoraire", e.target.value)}
                                            placeholder={t("evaluation_milieu.section3.salaire.placeholder")}
                                            disabled={lecture}
                                            aria-invalid={Boolean(erreursChamps.salaireHoraire)}
                                            className={classeChampEvaluation(erreursChamps, "salaireHoraire")}
                                        />
                                        <span className="shrink-0 text-xs font-semibold text-gray-600">
                                            {t("evaluation_milieu.section3.salaire.unite")}
                                        </span>
                                    </div>
                                    <ErreurChampInline message={erreursChamps.salaireHoraire} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div data-champ-erreur={Boolean(erreursChamps.commentaires)} className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label htmlFor="commentaires-milieu" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>{t("evaluation_milieu.section3.commentaires.label")}</span>
                        {reponseNegativePresente && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {t("evaluation_milieu.section3.commentaires.obligatoire_badge")}
                            </span>
                        )}
                    </label>
                    <span className="text-xs text-gray-400">
                        {formulaire.commentaires.length} / 2000
                    </span>
                </div>
                <textarea
                    id="commentaires-milieu"
                    rows={4}
                    maxLength={2000}
                    value={formulaire.commentaires}
                    onChange={(e) => majChamp("commentaires", e.target.value)}
                    placeholder={t("evaluation_milieu.section3.commentaires.placeholder")}
                    disabled={lecture}
                    aria-invalid={Boolean(erreursChamps.commentaires)}
                    className={classeChampEvaluation(erreursChamps, "commentaires")}
                />
                <ErreurChampInline message={erreursChamps.commentaires} />
            </div>
        </section>
    );
}

