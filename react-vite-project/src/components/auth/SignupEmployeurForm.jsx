import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerEmployeur } from "../../services/api/EmployeurService";
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
    } else if (!/^[0-9+()\s-]{10,}$/.test(formData.telephone.trim())) {
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
        poste: formData.poste.trim(),
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
    <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <SignupTabs activeTab="employeur" />

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {t("signup_employeur.title")}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        {t("signup_employeur.subtitle")}
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <strong>{t("signup_employeur.errorPrefix")}</strong>
          {t(`signup_employeur.${serverError}`, { defaultValue: t("signup_employeur.defaultError") })}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded">
          <strong>{t("signup_employeur.successPrefix")}</strong>
          {t(`signup_employeur.${successMessage}`, { defaultValue: t("signup_employeur.success") })}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.firstName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.firstName")}
              className={`w-full p-2.5 border rounded-lg ${
                errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {t(`signup_employeur.errors.${errors.firstName}`)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.lastName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.lastName")}
              className={`w-full p-2.5 border rounded-lg ${
                errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {t(`signup_employeur.errors.${errors.lastName}`)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("signup_employeur.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("signup_employeur.placeholders.email")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {t(`signup_employeur.errors.${errors.email}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.entreprise")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entreprise"
              value={formData.entreprise}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.entreprise")}
              className={`w-full p-2.5 border rounded-lg ${
                errors.entreprise ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.entreprise && (
              <p className="text-red-500 text-xs mt-1">
                {t(`signup_employeur.errors.${errors.entreprise}`)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.poste")}
            </label>
            <input
              type="text"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              placeholder={t("signup_employeur.placeholders.poste")}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("signup_employeur.telephone")} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            placeholder={t("signup_employeur.placeholders.telephone")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.telephone ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.telephone && (
            <p className="text-red-500 text-xs mt-1">
              {t(`signup_employeur.errors.${errors.telephone}`)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("signup_employeur.placeholders.password")}
                className={`w-full p-2.5 pr-20 border rounded-lg ${
                  errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showPassword ? t("signup_employeur.hide") : t("signup_employeur.show")}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {t(`signup_employeur.errors.${errors.password}`)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("signup_employeur.confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                placeholder={t("signup_employeur.placeholders.confirmPassword")}
                className={`w-full p-2.5 pr-20 border rounded-lg ${
                  errors.passwordConfirmation ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
              >
                {showConfirmPassword ? t("signup_employeur.hide") : t("signup_employeur.show")}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-red-500 text-xs mt-1">
                {t(`signup_employeur.errors.${errors.passwordConfirmation}`)}
              </p>
            )}
          </div>
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
            {isLoading ? t("signup_employeur.submitting") : t("signup_employeur.submit")}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          {t("signup_employeur.hasAccount")}{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            {t("signup_employeur.login")}
          </Link>
        </div>
      </form>
    </div>
  );
}
