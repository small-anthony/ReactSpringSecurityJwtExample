import React from "react";
import { AlertCircle, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STAGES_CIBLES, CAPACITES_ACCUEIL } from "../FormulaireEvaluationMilieuStage.jsx";

export function ErreurChampInline({ message }) {
    if (!message) return null;
    return (
        <p role="alert" className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

export const classeChampEvaluation = (erreursChamps, champ) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 transition focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600 ${
        erreursChamps[champ]
            ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500"
            : "border-gray-200 bg-white focus:ring-blue-200 focus:border-blue-500"
    }`;

export function OptionRadio({ nom, valeur, selectionnee, onSelect, disabled, ariaLabel, children }) {
    const couleurs = selectionnee
        ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-100"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40";
    const curseur = disabled ? "cursor-default opacity-90" : "cursor-pointer";
    return (
        <label
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all focus-within:ring-2 focus-within:ring-blue-300 ${couleurs} ${curseur}`}
        >
            <input
                type="radio"
                name={nom}
                value={valeur}
                checked={selectionnee}
                disabled={disabled}
                onChange={onSelect}
                aria-label={ariaLabel}
                className="sr-only"
            />
            {selectionnee && <Check className="w-3.5 h-3.5 shrink-0" />}
            <span>{children}</span>
        </label>
    );
}

export function GroupeRadioEvaluation({ nom, label, options, valeurSelectionnee, erreur, disabled, onSelect }) {
    return (
        <div
            data-champ-erreur={Boolean(erreur)}
            className={erreur ? "rounded-xl p-3 -mx-3 bg-rose-50/40 ring-1 ring-inset ring-rose-200 transition-colors" : "transition-colors"}
        >
            <p className="text-sm font-semibold text-gray-700 mb-2">
                {label} <span className="text-rose-500">*</span>
            </p>
            <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <OptionRadio
                        key={String(opt.valeur)}
                        nom={nom}
                        valeur={String(opt.radioValeur ?? opt.valeur)}
                        selectionnee={valeurSelectionnee === opt.valeur}
                        onSelect={() => onSelect(opt.valeur)}
                        disabled={disabled}
                        ariaLabel={opt.libelle}
                    >
                        {opt.libelle}
                    </OptionRadio>
                ))}
            </div>
            <ErreurChampInline message={erreur} />
        </div>
    );
}

export function InfoCase({ icone, libelle, valeur }) {
    return (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">{icone}</div>
            <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{libelle}</span>
                <span className="block text-xs font-semibold text-gray-800 truncate">{valeur || "—"}</span>
            </div>
        </div>
    );
}

export function ChampTexteEvaluation({
    id,
    label,
    champ,
    formulaire,
    erreursChamps,
    lecture,
    majChamp,
    obligatoire = true,
    type = "text",
    placeholder,
    spanClass = "",
    labelClass = "block text-sm font-semibold text-gray-700 mb-1.5",
    inputMode
}) {
    const erreur = erreursChamps[champ];
    return (
        <div className={spanClass} data-champ-erreur={Boolean(erreur)}>
            <label htmlFor={id} className={labelClass}>
                {label}{obligatoire && !lecture ? <span className="text-rose-500 ml-1">*</span> : ""}
            </label>
            <input
                id={id}
                type={type}
                inputMode={inputMode}
                value={formulaire[champ]}
                onChange={(e) => majChamp(champ, e.target.value)}
                placeholder={placeholder}
                disabled={lecture}
                aria-invalid={Boolean(erreur)}
                className={classeChampEvaluation(erreursChamps, champ)}
            />
            <ErreurChampInline message={erreur} />
        </div>
    );
}

export function SectionIdentificationMilieu({ formulaire, erreursChamps, lecture, majChamp }) {
    const { t } = useTranslation("main");
    const propsChamp = { formulaire, erreursChamps, lecture, majChamp };

    return (
        <>
            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section1.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChampTexteEvaluation id="nom-entreprise" label={t("evaluation_milieu.section1.nom_entreprise")} champ="nomEntreprise" {...propsChamp} />
                    <ChampTexteEvaluation id="personne-contact" label={t("evaluation_milieu.section1.personne_contact")} champ="personneContact" {...propsChamp} />
                    <ChampTexteEvaluation id="adresse-entreprise" label={t("evaluation_milieu.section1.adresse")} champ="adresse" {...propsChamp} placeholder={t("evaluation_milieu.section1.adresse_placeholder")} spanClass="md:col-span-2" />
                    <ChampTexteEvaluation id="ville-entreprise" label={t("evaluation_milieu.section1.ville")} champ="ville" {...propsChamp} placeholder={t("evaluation_milieu.section1.ville_placeholder")} />
                    <ChampTexteEvaluation id="code-postal-entreprise" label={t("evaluation_milieu.section1.code_postal")} champ="codePostal" {...propsChamp} placeholder={t("evaluation_milieu.section1.code_postal_placeholder")} />
                    <ChampTexteEvaluation id="telephone-entreprise" label={t("evaluation_milieu.section1.telephone")} champ="telephone" {...propsChamp} />
                    <ChampTexteEvaluation id="telecopieur-entreprise" label={t("evaluation_milieu.section1.telecopieur")} champ="telecopieur" {...propsChamp} obligatoire={false} placeholder={t("evaluation_milieu.section1.telecopieur_placeholder")} />
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section2.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChampTexteEvaluation id="nom-stagiaire" label={t("evaluation_milieu.section2.nom_stagiaire")} champ="nomStagiaire" {...propsChamp} />
                    <ChampTexteEvaluation id="date-stage" label={t("evaluation_milieu.section2.date_stage")} champ="dateStage" {...propsChamp} placeholder={t("evaluation_milieu.section2.date_stage_placeholder")} />
                </div>

                <div
                    data-champ-erreur={Boolean(erreursChamps.numeroStage)}
                    className={erreursChamps.numeroStage ? "rounded-xl p-3 -mx-3 bg-rose-50/40 ring-1 ring-inset ring-rose-200 transition-colors" : "transition-colors"}
                >
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        {t("evaluation_milieu.section2.numero_stage")} <span className="text-rose-500">*</span>
                    </p>
                    <div role="radiogroup" aria-label={t("evaluation_milieu.section2.numero_stage")} className="flex flex-wrap gap-2">
                        {[1, 2].map((num) => (
                            <OptionRadio
                                key={num}
                                nom="numeroStage"
                                valeur={String(num)}
                                selectionnee={formulaire.numeroStage === num}
                                onSelect={() => majChamp("numeroStage", num)}
                                disabled={lecture}
                                ariaLabel={t(`evaluation_milieu.section2.stage_${num}`)}
                            >
                                {t(`evaluation_milieu.section2.stage_${num}`)}
                            </OptionRadio>
                        ))}
                    </div>
                    <ErreurChampInline message={erreursChamps.numeroStage} />
                </div>
            </section>
        </>
    );
}

export function SectionObservationsGeneralesMilieu({ formulaire, erreursChamps, lecture, majChamp, effacerErreurChamp }) {
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
                options={STAGES_CIBLES.map((c) => ({ valeur: c, libelle: t(`evaluation_milieu.section4.milieu_privilegier.${c}`) }))}
                valeurSelectionnee={formulaire.milieuAPrivilegier}
                erreur={erreursChamps.milieuAPrivilegier}
                disabled={lecture}
                onSelect={(val) => majChamp("milieuAPrivilegier", val)}
            />

            <GroupeRadioEvaluation
                nom="nombreStagiairesAccueillis"
                label={t("evaluation_milieu.section4.capacite_accueil.label")}
                options={CAPACITES_ACCUEIL.map((c) => ({ valeur: c, libelle: t(`evaluation_milieu.section4.capacite_accueil.${c}`) }))}
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
                                        <span className="text-gray-500">{t("evaluation_milieu.section4.quarts_variables.de")}</span>
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
                                        <span className="text-gray-500">{t("evaluation_milieu.section4.quarts_variables.a")}</span>
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

