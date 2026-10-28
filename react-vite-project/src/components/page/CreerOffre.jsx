import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { createOffreStage } from "../../services/api/OffreStageService.js";
import OffreForm from "../form/OffreForm.jsx";
import {CheckCircle2} from "lucide-react";

export default function CreerOffre() {
  const authService = useContext(AuthServiceContext);
  const navigate = useNavigate();
  const { t } = useTranslation("main");
  const userData = authService?.getUserData ? authService.getUserData() : null;
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const authHeader = authService.buildAuthHeader();
      const finalEntreprise = userData?.entreprise || formData.nomEntreprise;

      let finalSalaire = formData.salaire.toString().trim();
      if (finalSalaire && !finalSalaire.toLowerCase().includes("h")) {
        finalSalaire = finalSalaire.replace("$", "").trim() + " $/h";
      }

      await createOffreStage(
          formData.titre.trim(),
          formData.description.trim(),
          finalEntreprise,
          formData.discipline.trim(),
          formData.duree.trim(),
          finalSalaire,
          formData.exigences.trim(),
          authHeader
      );

      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message || "defaultError");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold mb-4">{t("creer_offre.title")}</h2>



        <OffreForm
            id="formCreerOffre"
            initialValues={{ nomEntreprise: userData?.entreprise || "" }}
            onSubmit={handleSubmit}
        />

        <div className="mt-4">
          <button
              type="submit"
              form="formCreerOffre"
              className="w-full py-3 px-4 font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? t("creer_offre.submitting") : t("creer_offre.submit")}
          </button>
        </div>

        {serverError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              <strong>{t("creer_offre.errorPrefix")} </strong>
              {serverError}
            </div>
        )}

        {isSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl text-center">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("creer_offre.successTitle")}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {t("creer_offre.success")}
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/employeur")}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {t("common.confirm")}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}