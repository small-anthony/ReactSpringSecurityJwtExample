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
            <h2 className="text-xl font-semibold text-gray-800">{offre.titre}</h2>
            <p className="text-sm text-blue-700 mt-1">{offre.nomEntreprise}</p>
            <p className="text-gray-600 mt-3 whitespace-pre-line">{offre.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
