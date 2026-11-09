import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerEtudiant } from "../../services/api/EtudiantService.js";
import SignupTabs from "./SignupTabs";
import { AuthServiceContext } from "../../services/AuthService.tsx";



const DISCIPLINES = [
  { value: "info", labelKey: "info" },
  { value: "soins", labelKey: "soins" },
  { value: "archi", labelKey: "archi" },
  { value: "compta", labelKey: "compta" },
  { value: "gcivil", labelKey: "gcivil" }
];
export default function SignupEtudiantForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("main");
  const authService = useContext(AuthServiceContext);

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
      try {
        await authService.login(payload.email, payload.password);
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch {
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }

    } catch (err) {
      setServerError(err.message || t("signup_etudiant.defaultError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 sm:my-12 p-6 sm:p-8 ds-card">
      <SignupTabs activeTab="etudiant" />

      <h2 className="text-2xl font-bold text-center text-slate-900 tracking-tight mb-1.5">
        {t("signup_etudiant.title")}
      </h2>
      <p className="text-center text-slate-500 text-sm mb-6">
        {t("signup_etudiant.subtitle")}
      </p>

      {serverError && (
        <div className="mb-5 ds-alert-error" role="alert">
          <strong>{t("signup_etudiant.errorPrefix")}</strong>{serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 ds-alert-success" role="status">
          <strong>{t("signup_etudiant.successPrefix")}</strong>{successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label">
              {t("signup_etudiant.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("signup_etudiant.placeholders.firstName")}
              className={`ds-input ${errors.firstName ? "ds-input-error" : ""}`}
            />
            {errors.firstName && (
              <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.firstName}`)}</p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("signup_etudiant.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("signup_etudiant.placeholders.lastName")}
              className={`ds-input ${errors.lastName ? "ds-input-error" : ""}`}
            />
            {errors.lastName && (
              <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.lastName}`)}</p>
            )}
          </div>
        </div>

        <div>
          <label className="ds-label">
            {t("signup_etudiant.matricule")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            placeholder={t("signup_etudiant.placeholders.matricule")}
            maxLength={7}
            className={`ds-input ${errors.matricule ? "ds-input-error" : ""}`}
          />
          {errors.matricule && (
            <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.matricule}`)}</p>
          )}
        </div>

        <div>
          <label className="ds-label">
            {t("signup_etudiant.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("signup_etudiant.placeholders.email")}
            className={`ds-input ${errors.email ? "ds-input-error" : ""}`}
          />
          {errors.email && (
            <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.email}`)}</p>
          )}
        </div>

        <div>
          <label className="ds-label">
            {t("signup_etudiant.discipline")} <span className="text-red-500">*</span>
          </label>
          <select
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className={`ds-input ${errors.discipline ? "ds-input-error" : ""}`}
          >
            <option value="">{t("signup_etudiant.disciplines.placeholder")}</option>
            {DISCIPLINES.map((disc) => (
              <option key={disc.value} value={disc.value}>
                {t(`signup_etudiant.disciplines.${disc.labelKey}`)}
              </option>
            ))}
          </select>
          {errors.discipline && (
            <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.discipline}`)}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label">
              {t("signup_etudiant.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("signup_etudiant.placeholders.password")}
                className={`ds-input pr-20 ${errors.password ? "ds-input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors"
              >
                {showPassword ? t("signup_etudiant.hide") : t("signup_etudiant.show")}
              </button>
            </div>
            {errors.password && (
              <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.password}`)}</p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("signup_etudiant.confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("signup_etudiant.placeholders.confirmPassword")}
                className={`ds-input pr-20 ${errors.confirmPassword ? "ds-input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors"
              >
                {showConfirmPassword ? t("signup_etudiant.hide") : t("signup_etudiant.show")}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="ds-error-text">{t(`signup_etudiant.errors.${errors.confirmPassword}`)}</p>
            )}
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? t("signup_etudiant.submitting") : t("signup_etudiant.submit")}
          </button>
        </div>

        <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
          {t("signup_etudiant.hasAccount")}{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            {t("signup_etudiant.login")}
          </Link>
        </div>
      </form>
    </div>
  );
}