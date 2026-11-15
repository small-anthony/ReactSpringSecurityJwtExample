import React, { useState, useEffect, useContext, useRef } from "react";
import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getDossierStage,
    getEvaluationMilieu,
    soumettreEvaluationMilieu
} from "../../services/api/ProfesseurService.js";
import { getEvaluationMilieuEtudiant } from "../../services/api/GestionnaireService.js";
import EnteteEvaluationMilieu, {
    LienRetourEvaluation,
    ChargementEvaluationMilieu,
    ErreurChargementEvaluationMilieu
} from "./evaluationMilieuStage/EnteteEvaluationMilieu.jsx";
import SectionIdentificationMilieu from "./evaluationMilieuStage/SectionIdentificationMilieu.jsx";
import SectionCriteresEvaluationMilieu from "./evaluationMilieuStage/SectionCriteresEvaluationMilieu.jsx";
import SectionObservationsGeneralesMilieu from "./evaluationMilieuStage/SectionObservationsGeneralesMilieu.jsx";
import {
    FORMULAIRE_INITIAL,
    formulaireDepuisEvaluation,
    formulaireDepuisDossier,
    validerFormulaireEvaluationMilieu,
    construirePayloadEvaluationMilieu
} from "./evaluationMilieuStage/evaluationMilieuHelpers.js";

export default function FormulaireEvaluationMilieuStage({
    etudiantId,
    mode = "professeur",
    onRetour,
    onEvaluationSoumise
}) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const hautRef = useRef(null);
    const conteneurRef = useRef(null);
    const estGestionnaire = mode === "gestionnaire";

    const [dossier, setDossier] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [formulaire, setFormulaire] = useState(FORMULAIRE_INITIAL);
    const [loading, setLoading] = useState(true);
    const [soumission, setSoumission] = useState(false);
    const [erreurChargement, setErreurChargement] = useState("");
    const [erreursChamps, setErreursChamps] = useState({});
    const [erreurSoumission, setErreurSoumission] = useState("");
    const [succes, setSucces] = useState(false);

    const lecture = estGestionnaire || evaluation !== null;

    const remonter = () => {
        if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            hautRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
        }
    };

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                setLoading(true);
                setErreurChargement("");
                setEvaluation(null);
                setDossier(null);
                setSucces(false);
                setErreursChamps({});
                setErreurSoumission("");
                const authHeader = authService.buildAuthHeader();

                if (estGestionnaire) {
                    const evalData = await getEvaluationMilieuEtudiant(etudiantId, authHeader);
                    if (!actif) return;
                    setEvaluation(evalData);
                    setFormulaire(formulaireDepuisEvaluation(evalData));
                } else {
                    const dossierData = await getDossierStage(etudiantId, authHeader);
                    if (!actif) return;
                    setDossier(dossierData);
                    if (dossierData.milieuEvalue) {
                        const evalData = await getEvaluationMilieu(etudiantId, authHeader);
                        if (!actif) return;
                        setEvaluation(evalData);
                        setFormulaire(formulaireDepuisEvaluation(evalData));
                    } else {
                        setFormulaire(formulaireDepuisDossier(dossierData));
                    }
                }
            } catch (e) {
                if (actif) setErreurChargement(e.message || t("evaluation_milieu.error_load"));
            } finally {
                if (actif) setLoading(false);
            }
        };
        charger();
        return () => {
            actif = false;
        };
    }, [etudiantId, estGestionnaire, authService]);

    const effacerErreurChamp = (champ) => {
        setErreursChamps((prev) => {
            if (!prev[champ]) return prev;
            const copie = { ...prev };
            delete copie[champ];
            return copie;
        });
    };

    const majChamp = (champ, valeur) => {
        setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
        effacerErreurChamp(champ);
    };

    const majReponse = (critere, niveau) => {
        setFormulaire((prev) => ({ ...prev, reponses: { ...prev.reponses, [critere]: niveau } }));
        effacerErreurChamp(`critere_${critere}`);
        effacerErreurChamp("commentaires");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (lecture || soumission) return;

        const erreurs = validerFormulaireEvaluationMilieu(formulaire, t);
        if (Object.keys(erreurs).length > 0) {
            setErreursChamps(erreurs);
            setErreurSoumission("");
            setTimeout(() => {
                const premierChamp = conteneurRef.current?.querySelector('[data-champ-erreur="true"]');
                if (premierChamp && typeof premierChamp.scrollIntoView === "function") {
                    premierChamp.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 40);
            return;
        }

        try {
            setSoumission(true);
            setErreurSoumission("");
            setErreursChamps({});
            const payload = construirePayloadEvaluationMilieu(formulaire);
            const resultat = await soumettreEvaluationMilieu(etudiantId, payload, authService.buildAuthHeader());
            setEvaluation(resultat);
            setFormulaire(formulaireDepuisEvaluation(resultat));
            setSucces(true);
            onEvaluationSoumise?.(resultat);
            remonter();
        } catch (e) {
            setErreurSoumission(e.message || t("evaluation_milieu.error_submit"));
            remonter();
        } finally {
            setSoumission(false);
        }
    };

    if (loading) return <ChargementEvaluationMilieu />;
    if (erreurChargement) {
        return <ErreurChargementEvaluationMilieu estGestionnaire={estGestionnaire} erreurChargement={erreurChargement} onRetour={onRetour} />;
    }

    const propsSection = { formulaire, erreursChamps, lecture, majChamp };

    return (
        <form ref={conteneurRef} onSubmit={handleSubmit} noValidate className="max-w-4xl mx-auto space-y-6">
            <EnteteEvaluationMilieu
                estGestionnaire={estGestionnaire}
                lecture={lecture}
                erreurSoumission={erreurSoumission}
                erreursChamps={erreursChamps}
                succes={succes}
                evaluation={evaluation}
                dossier={dossier}
                hautRef={hautRef}
                onRetour={onRetour}
            />
            <SectionIdentificationMilieu {...propsSection} />
            <SectionCriteresEvaluationMilieu {...propsSection} majReponse={majReponse} />
            <SectionObservationsGeneralesMilieu {...propsSection} effacerErreurChamp={effacerErreurChamp} />
            {!lecture && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 md:px-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    <LienRetourEvaluation estGestionnaire={estGestionnaire} onRetour={onRetour} />
                    <button
                        type="submit"
                        disabled={soumission}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>{soumission ? t("evaluation_milieu.submitting") : t("evaluation_milieu.submit")}</span>
                    </button>
                </div>
            )}
        </form>
    );
}
