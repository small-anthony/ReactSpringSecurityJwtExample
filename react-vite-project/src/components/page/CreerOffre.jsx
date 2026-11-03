import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { createOffreStage } from "../../services/api/OffreStageService.js";
import OffreForm from "../form/OffreForm.jsx";
import ModalConfirmation from "../modal/ModalConfirmation.jsx";

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

        <ModalConfirmation
            isOpen={isSuccess}
            type="success"
            isSuccess={true}
            title={t("creer_offre.successTitle")}
            message={t("creer_offre.success")}
            confirmText={t("common.confirm")}
            onConfirm={() => navigate("/employeur")}
        />
      </div>
  );
}