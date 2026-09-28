import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";

const CANDIDATURES_FICTIVES = [
    {
        id: 1,
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie.martin@test.com",
        matricule: 123456,
        discipline: "Informatique",
        cvDisponible: true,
        statut: "EN_ATTENTE",
        dateCandidature: "2026-09-20T10:00:00",
    },
    {
        id: 2,
        firstName: "Marc",
        lastName: "Tremblay",
        email: "marc.tremblay@test.com",
        matricule: 789012,
        discipline: "Informatique",
        cvDisponible: false,
        statut: "EN_ATTENTE",
        dateCandidature: "2026-09-21T14:30:00",
    },
];

export default function CandidaturesOffre() {
    const { offreId } = useParams();
    const authService = useContext(AuthServiceContext);
    const { t } = useTranslation("main");

    const [candidatures, setCandidatures] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // TODO : remplacer par un vrai appel a getCandidatures(offreId, authService.buildAuthHeader())
        // une fois l'entite Candidature mergee dans main.
        const chargement = setTimeout(() => {
            setCandidatures(CANDIDATURES_FICTIVES);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(chargement);
    }, [offreId, authService]);

    const formatStatut = (statut) => t(`candidatures_offre.statuts.${statut}`, { defaultValue: statut });

    const statutClasses = (statut) => {
        switch (statut) {
            case "ACCEPTEE":
                return "bg-green-100 text-green-800 border-green-200";
            case "REFUSEE":
                return "bg-red-100 text-red-800 border-red-200";
            case "EN_ATTENTE_REPONSE":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <main className="max-w-5xl mx-auto my-10 px-4">
            <div className="mb-8">
                <Link to="/employeur" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    {t("candidatures_offre.back")}
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mt-2">{t("candidatures_offre.title")}</h1>
                <p className="text-gray-500 mt-1">{t("candidatures_offre.subtitle")}</p>
            </div>

            {isLoading && <p className="text-gray-500">{t("candidatures_offre.loading")}</p>}
            {error && <p className="p-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
            {!isLoading && !error && candidatures.length === 0 && (
                <p className="p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("candidatures_offre.no_candidates")}
                </p>
            )}

            <div className="grid gap-4">
                {candidatures.map((candidat) => (
                    <article key={candidat.id} className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {candidat.firstName} {candidat.lastName}
                                </h2>
                                <p className="text-sm text-gray-500">{candidat.email}</p>
                                <p className="text-sm text-blue-700 mt-1">{candidat.discipline}</p>
                            </div>
                            <span
                                className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border shrink-0 ${statutClasses(candidat.statut)}`}
                            >
                {formatStatut(candidat.statut)}
              </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            {candidat.cvDisponible ? (
                                <span className="text-sm font-semibold text-blue-600">
                  {t("candidatures_offre.view_cv")}
                </span>
                            ) : (
                                <span className="text-sm text-gray-400">
                  {t("candidatures_offre.no_cv")}
                </span>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}