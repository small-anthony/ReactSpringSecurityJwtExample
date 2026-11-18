import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerEmployeur } from "../../services/api/EmployeurService.js";
import SignupTabs from "./SignupTabs";
import { AuthServiceContext } from "../../services/AuthService.tsx";

export default function SignupEmployeurForm() {
  const navigate = useNavigate();
  const { t } = useTranslation("main");
  const authService = useContext(AuthServiceContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    entreprise: "",
    poste: "",
    telephone: "",
    password: "",
    passwordConfirmation: ""
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

    if (!formData.email.trim()) {
      newErrors.email = "email";
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email.trim())) {
      newErrors.email = "emailFormat";
    }

    if (!formData.entreprise.trim()) {
      newErrors.entreprise = "entreprise";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "telephone";
    } else if (!/^[0-9+()\-.\s]{7,20}$/.test(formData.telephone.trim())) {
      newErrors.telephone = "telephoneFormat";
    }

    if (!formData.password) {
      newErrors.password = "password";
    } else if (formData.password.length < 8) {
      newErrors.password = "passwordLength";
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "passwordConfirm";
    } else if (formData.passwordConfirmation !== formData.password) {
      newErrors.passwordConfirmation = "passwordMatch";
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
        email: formData.email.trim().toLowerCase(),
        entreprise: formData.entreprise.trim(),
        telephone: formData.telephone.trim(),
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation
      };

      await registerEmployeur(payload);

      setSuccessMessage("success");
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
      if (err.message && (err.message.includes("existe") || err.message.includes("exists"))) {
        setServerError("emailExists");
      } else {
        setServerError("defaultError");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 sm:my-12 p-6 sm:p-8 ds-card">
      <SignupTabs activeTab="employeur" />

      <h2 className="text-2xl font-bold text-center text-slate-900 tracking-tight mb-1.5">
        {t("signup_employeur.title")}
      </h2>
      <p className="text-center text-slate-500 text-sm mb-6">
        {t("signup_employeur.subtitle")}
      </p>

      {serverError && (
        <div className="mb-5 ds-alert-error" role="alert">
          <strong>{t("signup_employeur.errorPrefix")}</strong>
          {t(`signup_employeur.${serverError}`, { defaultValue: t("signup_employeur.defaultError") })}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 ds-alert-success" role="status">
          <strong>{t("signup_employeur.successPrefix")}</strong>
          {t(`signup_employeur.${successMessage}`, { defaultValue: t("signup_employeur.success") })}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label">
              {t("signup_employeur.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.firstName")}
              className={`ds-input ${
                errors.firstName ? "ds-input-error" : ""
              }`}
            />
            {errors.firstName && (
              <p className="ds-error-text">
                {t(`signup_employeur.errors.${errors.firstName}`)}
              </p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("signup_employeur.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.lastName")}
              className={`ds-input ${
                errors.lastName ? "ds-input-error" : ""
              }`}
            />
            {errors.lastName && (
              <p className="ds-error-text">
                {t(`signup_employeur.errors.${errors.lastName}`)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="ds-label">
            {t("signup_employeur.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("signup_employeur.placeholders.email")}
            className={`ds-input ${
              errors.email ? "ds-input-error" : ""
            }`}
          />
          {errors.email && (
            <p className="ds-error-text">
              {t(`signup_employeur.errors.${errors.email}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label">
              {t("signup_employeur.entreprise")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entreprise"
              value={formData.entreprise}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.entreprise")}
              className={`ds-input ${
                errors.entreprise ? "ds-input-error" : ""
              }`}
            />
            {errors.entreprise && (
              <p className="ds-error-text">
                {t(`signup_employeur.errors.${errors.entreprise}`)}
              </p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("signup_employeur.poste")}
            </label>
            <input
              type="text"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.poste")}
              className="ds-input"
            />
          </div>
        </div>

        <div>
          <label className="ds-label">
            {t("signup_employeur.telephone")} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder={t("signup_employeur.placeholders.telephone")}
            className={`ds-input ${
              errors.telephone ? "ds-input-error" : ""
            }`}
          />
          {errors.telephone && (
            <p className="ds-error-text">
              {t(`signup_employeur.errors.${errors.telephone}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label">
              {t("signup_employeur.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("signup_employeur.placeholders.password")}
                className={`ds-input pr-20 ${
                  errors.password ? "ds-input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors"
              >
                {showPassword ? t("signup_employeur.hide") : t("signup_employeur.show")}
              </button>
            </div>
            {errors.password && (
              <p className="ds-error-text">
                {t(`signup_employeur.errors.${errors.password}`)}
              </p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("signup_employeur.confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                placeholder={t("signup_employeur.placeholders.confirmPassword")}
                className={`ds-input pr-20 ${
                  errors.passwordConfirmation ? "ds-input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors"
              >
                {showConfirmPassword ? t("signup_employeur.hide") : t("signup_employeur.show")}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="ds-error-text">
                {t(`signup_employeur.errors.${errors.passwordConfirmation}`)}
              </p>
            )}
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? t("signup_employeur.submitting") : t("signup_employeur.submit")}
          </button>
        </div>

        <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
          {t("signup_employeur.hasAccount")}{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            {t("signup_employeur.login")}
          </Link>
        </div>
      </form>
    </div>
  );
}
