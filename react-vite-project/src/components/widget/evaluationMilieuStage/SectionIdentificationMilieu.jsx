import React from "react";
import { useTranslation } from "react-i18next";
import { ChampTexteEvaluation, ErreurChampInline, OptionRadio } from "./ChampsEvaluationMilieu.jsx";

export default function SectionIdentificationMilieu({
    formulaire,
    erreursChamps,
    lecture,
    majChamp
}) {
    const { t } = useTranslation("main");

    return (
        <>
            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section1.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChampTexteEvaluation
                        id="nom-entreprise"
                        label={t("evaluation_milieu.section1.nom_entreprise")}
                        champ="nomEntreprise"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                    />
                    <ChampTexteEvaluation
                        id="personne-contact"
                        label={t("evaluation_milieu.section1.personne_contact")}
                        champ="personneContact"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                    />
                    <ChampTexteEvaluation
                        id="adresse-entreprise"
                        label={t("evaluation_milieu.section1.adresse")}
                        champ="adresse"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                        placeholder={t("evaluation_milieu.section1.adresse_placeholder")}
                        spanClass="md:col-span-2"
                    />
                    <ChampTexteEvaluation
                        id="ville-entreprise"
                        label={t("evaluation_milieu.section1.ville")}
                        champ="ville"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                        placeholder={t("evaluation_milieu.section1.ville_placeholder")}
                    />
                    <ChampTexteEvaluation
                        id="code-postal-entreprise"
                        label={t("evaluation_milieu.section1.code_postal")}
                        champ="codePostal"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                        placeholder={t("evaluation_milieu.section1.code_postal_placeholder")}
                    />
                    <ChampTexteEvaluation
                        id="telephone-entreprise"
                        label={t("evaluation_milieu.section1.telephone")}
                        champ="telephone"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                    />
                    <ChampTexteEvaluation
                        id="telecopieur-entreprise"
                        label={t("evaluation_milieu.section1.telecopieur")}
                        champ="telecopieur"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                        obligatoire={false}
                        placeholder={t("evaluation_milieu.section1.telecopieur_placeholder")}
                    />
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">{t("evaluation_milieu.section2.title")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChampTexteEvaluation
                        id="nom-stagiaire"
                        label={t("evaluation_milieu.section2.nom_stagiaire")}
                        champ="nomStagiaire"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                    />
                    <ChampTexteEvaluation
                        id="date-stage"
                        label={t("evaluation_milieu.section2.date_stage")}
                        champ="dateStage"
                        formulaire={formulaire}
                        erreursChamps={erreursChamps}
                        lecture={lecture}
                        majChamp={majChamp}
                        placeholder={t("evaluation_milieu.section2.date_stage_placeholder")}
                    />
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

