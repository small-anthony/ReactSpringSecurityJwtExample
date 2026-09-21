import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerEtudiant } from "../../services/api/EtudiantService";
import SignupTabs from "./SignupTabs";

const DISCIPLINES = [
  { value: "Techniques de l'informatique", labelKey: "info" },
  { value: "Soins infirmiers", labelKey: "soins" },
  { value: "Technologie de l'architecture", labelKey: "archi" },
  { value: "Techniques de comptabilité et de gestion", labelKey: "compta" },
  { value: "Techniques de génie civil", labelKey: "gcivil" }
];

export default function SignupEtudiantForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("main");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    matricule: "",
    email: "",
    discipline: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "firstName";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "lastName";
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = "matriculeRequired";
    } else if (!/^\d{7}$/.test(formData.matricule.trim())) {
      newErrors.matricule = "matriculeFormat";
    }

    if (!formData.email.trim()) {
      newErrors.email = "emailRequired";
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email.trim())) {
      newErrors.email = "emailFormat";
    }

    if (!formData.discipline) {
      newErrors.discipline = "disciplineRequired";
    }

    if (!formData.password) {
      newErrors.password = "passwordRequired";
    } else if (formData.password.length < 8) {
      newErrors.password = "passwordLength";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "confirmPasswordRequired";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "confirmPasswordMatch";
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
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        matricule: formData.matricule.trim(),
        email: formData.email.trim().toLowerCase(),
        discipline: formData.discipline,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      await registerEtudiant(payload);

      setSuccessMessage(t("signup_etudiant.success"));
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setServerError(err.message || t("signup_etudiant.defaultError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <SignupTabs activeTab="etudiant" />

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {t("signup_etudiant.title")}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        {t("signup_etudiant.subtitle")}
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <strong>{t("signup_etudiant.errorPrefix")}</strong>{serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded">
          <strong>{t("signup_etudiant.successPrefix")}</strong>{successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_etudiant.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("signup_etudiant.placeholders.firstName")}
              className={`w-full p-2.5 border rounded-lg ${errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.firstName}`)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_etudiant.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("signup_etudiant.placeholders.lastName")}
              className={`w-full p-2.5 border rounded-lg ${errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.lastName}`)}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("signup_etudiant.matricule")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            placeholder={t("signup_etudiant.placeholders.matricule")}
            maxLength={7}
            className={`w-full p-2.5 border rounded-lg ${errors.matricule ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          />
          {errors.matricule && (
            <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.matricule}`)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("signup_etudiant.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("signup_etudiant.placeholders.email")}
            className={`w-full p-2.5 border rounded-lg ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.email}`)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("signup_etudiant.discipline")} <span className="text-red-500">*</span>
          </label>
          <select
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className={`w-full p-2.5 border rounded-lg bg-white ${errors.discipline ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
          >
            <option value="">{t("signup_etudiant.disciplines.placeholder")}</option>
            {DISCIPLINES.map((disc) => (
              <option key={disc.value} value={disc.value}>
                {t(`signup_etudiant.disciplines.${disc.labelKey}`)}
              </option>
            ))}
          </select>
          {errors.discipline && (
            <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.discipline}`)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_etudiant.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("signup_etudiant.placeholders.password")}
                className={`w-full p-2.5 pr-20 border rounded-lg ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showPassword ? t("signup_etudiant.hide") : t("signup_etudiant.show")}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.password}`)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_etudiant.confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("signup_etudiant.placeholders.confirmPassword")}
                className={`w-full p-2.5 pr-20 border rounded-lg ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showConfirmPassword ? t("signup_etudiant.hide") : t("signup_etudiant.show")}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{t(`signup_etudiant.errors.${errors.confirmPassword}`)}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 font-bold rounded-lg text-white transition ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow"
              }`}
          >
            {isLoading ? t("signup_etudiant.submitting") : t("signup_etudiant.submit")}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          {t("signup_etudiant.hasAccount")}{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            {t("signup_etudiant.login")}
          </Link>
        </div>
      </form>
    </div>
  );
}