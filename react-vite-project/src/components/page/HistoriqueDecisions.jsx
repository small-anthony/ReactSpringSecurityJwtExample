import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getHistoriqueDecisions } from "../../services/api/OffreStageService.js";

export default function HistoriqueDecisions() {
    const authService = useContext(AuthServiceContext);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation("main");
    const [decisions, setDecisions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let actif = true;

        getHistoriqueDecisions(authService.buildAuthHeader())
            .then((data) => {
                if (actif) setDecisions(data);
            })
            .catch((err) => {
                if (actif) setError(err.message);
            })
            .finally(() => {
                if (actif) setIsLoading(false);
            });

        return () => {
            actif = false;
        };
    }, [authService]);

    const statutClasses = (statut) => {
        if (statut === "EMBAUCHEE") return "bg-green-100 text-green-800 border-green-200";
        if (statut === "EN_ATTENTE_REPONSE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
        if (statut === "ACCEPTEE") return "bg-blue-100 text-blue-800 border-blue-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    return (
        <main className="max-w-7xl mx-auto my-10 px-4">
            <div className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/employeur")}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                    {t("historique.back")}
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mt-4">{t("historique.title")}</h1>
                <p className="text-gray-500 mt-1">{t("historique.subtitle")}</p>
            </div>

            {isLoading && <p className="text-gray-500">{t("historique.loading")}</p>}
            {error && <p className="p-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
            {!isLoading && !error && decisions.length === 0 && (
                <p className="p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("historique.empty")}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decisions.map((decision, index) => (
                    <article
                        key={`${decision.candidatureId}-${index}`}
                        className="flex flex-col h-full p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-gray-800 break-words">{decision.etudiantNom}</h2>
                                <p className="text-sm text-gray-500 break-words">{decision.titreOffre}</p>
                            </div>
                            <span
                                className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border shrink-0 ${statutClasses(decision.nouveauStatut)}`}
                            >
                                {t(`candidatures_offre.status.${decision.nouveauStatut}`, {
                                    defaultValue: decision.nouveauStatut,
                                })}
                            </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-700">
                            <span className="font-semibold">{t("historique.date")} : </span>
                            {new Date(decision.dateDecision).toLocaleString(i18n.language)}
                        </p>

                        {decision.message && (
                            <p className="mt-1 text-sm text-gray-700 break-words">
                                <span className="font-semibold">{t("historique.message")} : </span>
                                {decision.message}
                            </p>
                        )}
                    </article>
                ))}
            </div>
        </main>
    );
}