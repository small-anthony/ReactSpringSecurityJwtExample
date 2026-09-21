import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx"
import { createOffreStage } from "../../services/api/OffreStageService";

export default function CreateOffreForm() {
  const authService = useContext(AuthServiceContext);
  const { t } = useTranslation("main");

  const [formData, setFormData] = useState({
    titre: "",
    nomEntreprise: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.titre.trim()) {
      newErrors.titre = "titre";
    }

    if (!formData.nomEntreprise.trim()) {
      newErrors.nomEntreprise = "nomEntreprise";
    }

    if (!formData.description.trim()) {
      newErrors.description = "description";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "descriptionLength";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const authHeader = authService.buildAuthHeader();

      await createOffreStage(
        formData.titre.trim(),
        formData.description.trim(),
        formData.nomEntreprise.trim(),
        authHeader
      );

      setSuccessMessage("success");
      setFormData({ titre: "", nomEntreprise: "", description: "" });

    } catch (err) {
      setServerError(err.message || "defaultError");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {t("creer_offre.title")}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        {t("creer_offre.subtitle")}
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <strong>{t("creer_offre.errorPrefix")}</strong>
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded">
          <strong>{t("creer_offre.successPrefix")}</strong>
          {t("creer_offre.success")}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("creer_offre.titre")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder={t("creer_offre.placeholders.titre")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.titre ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.titre && (
            <p className="text-red-500 text-xs mt-1">
              {t(`creer_offre.errors.${errors.titre}`)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("creer_offre.nomEntreprise")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nomEntreprise"
            value={formData.nomEntreprise}
            onChange={handleChange}
            placeholder={t("creer_offre.placeholders.nomEntreprise")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.nomEntreprise ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.nomEntreprise && (
            <p className="text-red-500 text-xs mt-1">
              {t(`creer_offre.errors.${errors.nomEntreprise}`)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("creer_offre.description")} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder={t("creer_offre.placeholders.description")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.description ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {t(`creer_offre.errors.${errors.description}`)}
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 font-bold rounded-lg text-white transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow"
            }`}
          >
            {isLoading ? t("creer_offre.submitting") : t("creer_offre.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
