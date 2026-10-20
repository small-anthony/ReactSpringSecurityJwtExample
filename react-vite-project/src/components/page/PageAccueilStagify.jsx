import React, {useContext, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {AuthServiceContext} from "../../services/AuthService.tsx";
import {Briefcase, GraduationCap, ShieldCheck} from "lucide-react";
import { BASE_URL } from "../config/Config.jsx";

function PageAccueilStagify() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const navigate = useNavigate();
    const [loginRole, setLoginRole] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleQuickLogin = async (email, password, roleName) => {
        setIsLoading(true);
        setLoginRole(roleName);
        setError("");

        try {
            await authService.login(email.trim().toLowerCase(), password);
            const token = localStorage.getItem("token");

            const userResponse = await fetch(`${BASE_URL}/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

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
            setError(t("login_page.invalidCredentials", "Erreur lors de la connexion automatique."));
        } finally {
            setIsLoading(false);
            setLoginRole(null);
        }
    };

    return (
        <div className="maincontainer max-w-3xl mx-auto text-center py-20 px-4 sm:px-6">
            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight mb-4">
                Stag<span className="text-blue-600">ify</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-gray-700 mb-6">
                {t("home.subtitle")}
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                {t("home.description")}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                <Link
                    to="/login"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-xl border border-gray-300 shadow-xs hover:border-gray-400 transition duration-150 text-base text-center"
                >
                    {t("home.cta_login")}
                </Link>
                <Link
                    to="/signup"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-150 text-base text-center"
                >
                    {t("home.cta_signup")}
                </Link>
            </div>

            {import.meta.env.DEV && (
                    <div className="mt-10 max-w-xl mx-auto">
                        <p className="text-xs uppercase tracking-wider font-bold text-gray-700 mb-4">
                            {t("login_page.quickLogin")}
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin("daniil@test.com", "password", "etudiant")}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition duration-150 cursor-pointer disabled:opacity-50 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600">
                                    {t("role.etudiant_nocv")}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-0.5">daniil@test.com</span>
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin("etudiant@test.com", "password", "etudiant")}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition duration-150 cursor-pointer disabled:opacity-50 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600">
                                    {t("role.etudiant")}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-0.5">etudiant@test.com</span>
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin("employeur@test.com", "password", "employeur")}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-300 rounded-2xl shadow-xs hover:shadow-md transition duration-150 cursor-pointer disabled:opacity-50 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-emerald-600">
                                    {t("role.employeur")}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-0.5">employeur@test.com</span>
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin("gestionnaire@test.com", "bib", "gestionnaire")}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-purple-50/50 border border-gray-200 hover:border-purple-300 rounded-2xl shadow-xs hover:shadow-md transition duration-150 cursor-pointer disabled:opacity-50 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-purple-600">
                                    {t("role.gestionnaire")}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-0.5">gestionnaire@test.com</span>
                            </button>
                        </div>
                </div>
            )}
        </div>
    );
}

export default PageAccueilStagify;