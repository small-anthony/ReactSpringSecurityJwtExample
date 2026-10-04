import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getOffresStages } from "../../services/api/OffreStageService";
import {useTranslation} from "react-i18next";
import { DollarSign, Clock, GraduationCap, ClipboardList, AlignLeft, Briefcase } from "lucide-react";

const STATUS_STYLES = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ACCEPTE: "bg-green-100 text-green-800 border-green-200",
  REFUSE: "bg-red-100 text-red-800 border-red-200",
};


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
              <article key={offre.id} className="p-7 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{offre.titre}</h2>
                    <p className="text-blue-600 font-medium mt-1 flex items-center gap-1.5 pb-4 border-b border-gray-100">
                        <Briefcase className="w-4 h-4" strokeWidth={2} />
                        {offre.nomEntreprise}
                    </p>
                  </div>
                  <span className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border ${STATUS_STYLES[offre.status] || ""}`}>
                    {t(`employeur_home.status.${offre.status}`)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.discipline')}</span>
                            <span className="text-gray-800 text-sm font-medium">{offre.discipline}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.salaire')}</span>
                            <span className="text-gray-800 text-sm font-medium">{offre.salaire}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.duree')}</span>
                            <span className="text-gray-800 text-sm font-medium">{offre.duree}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <AlignLeft className="w-4 h-4 text-blue-500" />
                            {t('approbation.offres.attributes.description')}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed pl-6">{offre.description}</p>
                    </div>

                    <div className="pt-2">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <ClipboardList className="w-4 h-4 text-purple-500" />
                            {t('approbation.offres.attributes.exigences')}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed pl-6">{offre.exigences}</p>
                    </div>
                </div>

                {offre.status === "REFUSE" && offre.messageReponse && (
                    <div className="mt-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-lg shadow-sm">
                      <strong className="text-red-900">{t("employeur_home.motif_refus")} </strong>{offre.messageReponse}
                    </div>
                )}
              </article>
          ))}
        </div>
      </main>
  );
}
