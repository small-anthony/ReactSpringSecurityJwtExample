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
      <div className="max-w-xl mx-auto my-8 sm:my-12 p-6 sm:p-8 ds-card">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("creer_offre.title")}</h2>
        </div>

        {serverError && (
            <div className="mb-5 ds-alert-error" role="alert">
              <strong>{t("creer_offre.errorPrefix")} </strong>
              {serverError === "defaultError" ? t("creer_offre.defaultError") : serverError}
            </div>
        )}

        <OffreForm
            id="formCreerOffre"
            initialValues={{ nomEntreprise: userData?.entreprise || "" }}
            onSubmit={handleSubmit}
        />

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
              type="submit"
              form="formCreerOffre"
              disabled={isLoading}
              className="btn-primary w-full py-3"
          >
            {isLoading ? t("creer_offre.submitting") : t("creer_offre.submit")}
          </button>
        </div>

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