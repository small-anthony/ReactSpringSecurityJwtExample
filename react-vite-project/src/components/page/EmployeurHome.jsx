import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getOffresStages } from "../../services/api/OffreStageService";

export default function EmployeurHome() {
  const authService = useContext(AuthServiceContext);
  const [offres, setOffres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getOffresStages(authService.buildAuthHeader())
      .then((data) => {
        if (isMounted) setOffres(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authService]);

  return (
    <main className="max-w-5xl mx-auto my-10 px-4">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes offres de stage</h1>
          <p className="text-gray-500 mt-1">Gérez les offres publiées par votre entreprise.</p>
        </div>
        <Link
          to="/employeur/creer-offre"
          className="shrink-0 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Créer une offre
        </Link>
      </div>

      {isLoading && <p className="text-gray-500">Chargement des offres...</p>}
      {error && <p className="p-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
      {!isLoading && !error && offres.length === 0 && (
        <p className="p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
          Aucune offre de stage n&apos;a encore été créée.
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
