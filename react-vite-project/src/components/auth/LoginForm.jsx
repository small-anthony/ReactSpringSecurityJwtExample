import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {BASE_URL} from "../config/Config.jsx";

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
      } else if (role.includes("PROFESSEUR")) {
        navigate("/professeur");
      } else if (role.includes("GESTIONNAIRE")) {
        navigate("/gestionnaire");
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
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {t("login_page.title")}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        {t("login_page.subtitle")}
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <strong>{t("login_page.errorPrefix")}</strong>
          {t(`login_page.${serverError}`, { defaultValue: t("login_page.defaultError") })}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("login_page.email")} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("login_page.placeholders.email")}
            className={`w-full p-2.5 border rounded-lg ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {t(`login_page.errors.${errors.email}`)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("login_page.password")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("login_page.placeholders.password")}
              className={`w-full p-2.5 pr-20 border rounded-lg ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer select-none"
            >
              {showPassword ? t("login_page.hide") : t("login_page.show")}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {t(`login_page.errors.${errors.password}`)}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 font-bold rounded-lg text-white transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow"
            }`}
          >
            {isLoading ? t("login_page.submitting") : t("login_page.submit")}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          {t("login_page.noAccount")}{" "}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            {t("login_page.signup")}
          </Link>
        </div>
      </form>
    </div>
  );
}
