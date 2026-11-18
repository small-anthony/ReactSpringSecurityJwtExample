import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { BASE_URL } from "../config/Config.jsx";
import QuickLogin from "./QuickLogin.jsx";

export default function LoginForm() {
  const authService = useContext(AuthServiceContext);
  const navigate = useNavigate();
  const { t } = useTranslation("main");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "email";
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(formData.email.trim())) {
      newErrors.email = "emailFormat";
    }

    if (!formData.password) {
      newErrors.password = "password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(formData.email.trim().toLowerCase(), formData.password);
      const token = localStorage.getItem("token");

      const userResponse = await fetch(`${BASE_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(userResponse.data);

      if (!userResponse.ok) throw new Error("Impossible de récupérer les informations de l'utilisateur");

      const userData = await userResponse.json();
      const role = (userData?.role || "").toString().toUpperCase();

      if (role.includes("ETUDIANT")) {
        navigate("/etudiant");
      } else if (role.includes("EMPLOYEUR")) {
        navigate("/employeur");
      } else if (role.includes("GESTIONNAIRE")) {
        navigate("/gestionnaire");
      } else if (role.includes("PROFESSEUR")) {
        navigate("/professeur");
      } else {
        navigate("/");
      }
    } catch {
      setServerError("invalidCredentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 sm:my-12 px-4">
      <div className="max-w-md mx-auto p-6 sm:p-8 ds-card">
        <h2 className="text-2xl font-bold text-center text-slate-900 tracking-tight mb-1.5">
          {t("login_page.title")}
        </h2>
        <p className="text-center text-slate-500 text-sm mb-6">
          {t("login_page.subtitle")}
        </p>

        {serverError && (
          <div className="mb-5 ds-alert-error" role="alert">
            <strong>{t("login_page.errorPrefix")}</strong>
            {t(`login_page.${serverError}`, { defaultValue: t("login_page.defaultError") })}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="ds-label">
              {t("login_page.email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("login_page.placeholders.email")}
              className={`ds-input ${
                errors.email ? "ds-input-error" : ""
              }`}
            />
            {errors.email && (
              <p className="ds-error-text">
                {t(`login_page.errors.${errors.email}`)}
              </p>
            )}
          </div>

          <div>
            <label className="ds-label">
              {t("login_page.password")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("login_page.placeholders.password")}
                className={`ds-input pr-20 ${
                  errors.password ? "ds-input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none transition-colors"
              >
                {showPassword ? t("login_page.hide") : t("login_page.show")}
              </button>
            </div>
            {errors.password && (
              <p className="ds-error-text">
                {t(`login_page.errors.${errors.password}`)}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? t("login_page.submitting") : t("login_page.submit")}
            </button>
          </div>

          <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-100">
            {t("login_page.noAccount")}{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              {t("login_page.signup")}
            </Link>
          </div>
        </form>
      </div>

      <QuickLogin />
    </div>
  );
}
