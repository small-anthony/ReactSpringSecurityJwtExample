import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getOffresStages } from "../../services/api/OffreStageService";
import {useTranslation} from "react-i18next";

export default function EmployeurHome() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [offres, setOffres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let offresChargees = true;

        getOffresStages(authService.buildAuthHeader())
            .then((data) => {
                if (offresChargees) setOffres(data);
            })
            .catch((err) => {
                if (offresChargees) setError(err.message);
            })
            .finally(() => {
                if (offresChargees) setIsLoading(false);
            });

        return () => {
            offresChargees = false;
        };
    }, [authService]);

    const formatStatutOffre = (status) => t(`employeur_home.statuts.${status}`, { defaultValue: status });

    const statutOffreClasses = (status) => {
        switch (status) {
            case "ACCEPTE":
                return "bg-green-100 text-green-800 border-green-200";
            case "REFUSE":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <main className="max-w-5xl mx-auto my-10 px-4">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t("employeur_home.title")}</h1>
                    <p className="text-gray-500 mt-1">{t("employeur_home.subtitle")}</p>
                </div>
                <Link
                    to="/employeur/creer-offre"
                    className="shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                    {t("employeur_home.create_offer")}
                </Link>
            </div>

            {isLoading && <p className="text-gray-500">{t("employeur_home.loading")}</p>}
            {error && <p className="p-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
            {!isLoading && !error && offres.length === 0 && (
                <p className="p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("employeur_home.no_offers")}
                </p>
            )}
            <div className="grid gap-4">
                {offres.map((offre) => (
                    <article key={offre.id} className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{offre.titre}</h2>
                                <p className="text-sm text-blue-700 mt-1">{offre.nomEntreprise}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border shrink-0 ${statutOffreClasses(offre.status)}`}>
                    {formatStatutOffre(offre.status)}
                  </span>
                        </div>
                        <p className="text-gray-600 mt-3 whitespace-pre-line">{offre.description}</p>
                        {offre.messageReponse && (
                            <p className="text-sm text-red-600 mt-2 italic">{offre.messageReponse}</p>
                        )}
                        <Link
                            to={`/employeur/offres/${offre.id}/candidatures`}
                            className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            {t("employeur_home.view_candidates")}
                        </Link>
                    </article>
                ))}
            </div>
        </main>
    );
}