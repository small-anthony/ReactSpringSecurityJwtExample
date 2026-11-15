import React from "react";
import { useTranslation } from "react-i18next";
import { STAGES_CIBLES, CAPACITES_ACCUEIL } from "./evaluationMilieuHelpers.js";
import { ChampTexteEvaluation, ErreurChampInline, GroupeRadioEvaluation } from "./ChampsEvaluationMilieu.jsx";

export default function SectionObservationsGeneralesMilieu({
    formulaire,
    erreursChamps,
    lecture,
    majChamp,
    effacerErreurChamp
}) {
    const { t } = useTranslation("main");

    const optionsOuiNon = (cleSection) => [
        { valeur: true, radioValeur: "oui", libelle: t(`evaluation_milieu.section4.${cleSection}.oui`) },
        { valeur: false, radioValeur: "non", libelle: t(`evaluation_milieu.section4.${cleSection}.non`) }
    ];

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section4.title")}</h2>

            <GroupeRadioEvaluation
                nom="milieuAPrivilegier"
                label={t("evaluation_milieu.section4.milieu_privilegier.label")}
                options={STAGES_CIBLES.map((c) => ({
                    valeur: c,
                    libelle: t(`evaluation_milieu.section4.milieu_privilegier.${c}`)
                }))}
                valeurSelectionnee={formulaire.milieuAPrivilegier}
                erreur={erreursChamps.milieuAPrivilegier}
                disabled={lecture}
                onSelect={(val) => majChamp("milieuAPrivilegier", val)}
            />

            <GroupeRadioEvaluation
                nom="nombreStagiairesAccueillis"
                label={t("evaluation_milieu.section4.capacite_accueil.label")}
                options={CAPACITES_ACCUEIL.map((c) => ({
                    valeur: c,
                    libelle: t(`evaluation_milieu.section4.capacite_accueil.${c}`)
                }))}
                valeurSelectionnee={formulaire.nombreStagiairesAccueillis}
                erreur={erreursChamps.nombreStagiairesAccueillis}
                disabled={lecture}
                onSelect={(val) => majChamp("nombreStagiairesAccueillis", val)}
            />

            <GroupeRadioEvaluation
                nom="accueillirMemeStagiaire"
                label={t("evaluation_milieu.section4.meme_stagiaire.label")}
                options={optionsOuiNon("meme_stagiaire")}
                valeurSelectionnee={formulaire.accueillirMemeStagiaire}
                erreur={erreursChamps.accueillirMemeStagiaire}
                disabled={lecture}
                onSelect={(val) => majChamp("accueillirMemeStagiaire", val)}
            />

            <div className="space-y-3">
                <GroupeRadioEvaluation
                    nom="quartsTravailVariables"
                    label={t("evaluation_milieu.section4.quarts_variables.label")}
                    options={optionsOuiNon("quarts_variables")}
                    valeurSelectionnee={formulaire.quartsTravailVariables}
                    erreur={erreursChamps.quartsTravailVariables}
                    disabled={lecture}
                    onSelect={(val) => majChamp("quartsTravailVariables", val)}
                />

                {formulaire.quartsTravailVariables === true && (
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                        <p className="text-xs font-bold text-slate-700">
                            {t("evaluation_milieu.section4.quarts_variables.plages_label")}
                        </p>
                        {[1, 2, 3].map((idx) => {
                            const debutKey = `quart${idx}Debut`;
                            const finKey = `quart${idx}Fin`;
                            const errKey = `quart${idx}`;
                            const erreurQuart = erreursChamps[errKey];
                            const borderTime = erreurQuart ? "border-rose-400 bg-rose-50/40" : "border-gray-200 bg-white";
                            return (
                                <div key={idx} data-champ-erreur={Boolean(erreurQuart)} className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="font-semibold text-gray-700 w-16">
                                            {t("evaluation_milieu.section4.quarts_variables.plage", { index: idx })}
                                            {idx === 1 ? <span className="text-rose-500 ml-1">*</span> : ""}
                                        </span>
                                        <span className="text-gray-500">
                                            {t("evaluation_milieu.section4.quarts_variables.de")}
                                        </span>
                                        <input
                                            type="time"
                                            value={formulaire[debutKey]}
                                            onChange={(e) => {
                                                majChamp(debutKey, e.target.value);
                                                effacerErreurChamp(errKey);
                                            }}
                                            disabled={lecture}
                                            className={`rounded-lg border px-2.5 py-1.5 text-xs text-gray-800 disabled:bg-gray-50 ${borderTime}`}
                                        />
                                        <span className="text-gray-500">
                                            {t("evaluation_milieu.section4.quarts_variables.a")}
                                        </span>
                                        <input
                                            type="time"
                                            value={formulaire[finKey]}
                                            onChange={(e) => {
                                                majChamp(finKey, e.target.value);
                                                effacerErreurChamp(errKey);
                                            }}
                                            disabled={lecture}
                                            className={`rounded-lg border px-2.5 py-1.5 text-xs text-gray-800 disabled:bg-gray-50 ${borderTime}`}
                                        />
                                    </div>
                                    <ErreurChampInline message={erreurQuart} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <ChampTexteEvaluation
                    id="signature-enseignant"
                    label={t("evaluation_milieu.section4.signature_label")}
                    champ="signatureEnseignant"
                    formulaire={formulaire}
                    erreursChamps={erreursChamps}
                    lecture={lecture}
                    majChamp={majChamp}
                    placeholder={t("evaluation_milieu.section4.signature_placeholder")}
                />
                <ChampTexteEvaluation
                    id="date-evaluation"
                    label={t("evaluation_milieu.section4.date_label")}
                    champ="dateEvaluation"
                    type="date"
                    obligatoire={false}
                    formulaire={formulaire}
                    erreursChamps={erreursChamps}
                    lecture={lecture}
                    majChamp={majChamp}
                />
            </div>
        </section>
    );
}
