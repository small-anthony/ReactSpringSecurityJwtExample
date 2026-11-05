import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { Briefcase, GraduationCap, ShieldCheck, Loader2 } from "lucide-react";
import { BASE_URL } from "../config/Config.jsx";

const DEMO_USERS = [
    {
        name: "Valentin Dimitrov",
        company: "CGI Inc.",
        role: "employeur",
        email: "employeur@test.com",
        password: "password",
        descKey: "valentin_desc",
        icon: Briefcase,
        color: "emerald"
    },
    {
        name: "John Gestion",
        companyKey: "company_cegep",
        role: "gestionnaire",
        email: "gestionnaire@test.com",
        password: "bib",
        descKey: "john_desc",
        icon: ShieldCheck,
        color: "purple"
    },
    {
        name: "Hatim Fakhour",
        companyKey: "company_student_m",
        role: "etudiant",
        email: "etudiant@test.com",
        password: "password",
        descKey: "hatim_desc",
        icon: GraduationCap,
        color: "blue"
    },
    {
        name: "Sophie Martin",
        companyKey: "company_student_f",
        role: "etudiant",
        email: "sophie@test.com",
        password: "password",
        descKey: "sophie_desc",
        icon: GraduationCap,
        color: "amber"
    },
    {
        name: "Luc Bélanger",
        companyKey: "company_student_m",
        role: "etudiant",
        email: "luc@test.com",
        password: "password",
        descKey: "luc_desc",
        icon: GraduationCap,
        color: "indigo"
    },
    {
        name: "Emma Roy",
        companyKey: "company_student_f",
        role: "etudiant",
        email: "emma@test.com",
        password: "password",
        descKey: "emma_desc",
        icon: GraduationCap,
        color: "rose"
    },
    {
        name: "Daniil Dimov",
        companyKey: "company_student_m",
        role: "etudiant",
        email: "daniil@test.com",
        password: "password",
        descKey: "daniil_desc",
        icon: GraduationCap,
        color: "slate"
    }
];

export default function QuickLogin() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const navigate = useNavigate();

    const [loadingEmail, setLoadingEmail] = useState(null);
    const [error, setError] = useState("");

    const handleQuickLogin = async (user) => {
        setLoadingEmail(user.email);
        setError("");

        try {
            await authService.login(user.email.trim().toLowerCase(), user.password);
            const token = localStorage.getItem("token");

            const userResponse = await fetch(`${BASE_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userResponse.ok) {
                throw new Error("Impossible de récupérer les informations de l'utilisateur");
            }

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
            setError(t("login_page.invalidCredentials"));
        } finally {
            setLoadingEmail(null);
        }
    };

    return (
        <div className="mt-10 w-full max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-700">
                    {t("login_page.quickLogin")}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEMO_USERS.map((user) => {
                    const IconComponent = user.icon;
                    const isCurrentLoading = loadingEmail === user.email;

                    return (
                        <button
                            key={user.email}
                            type="button"
                            disabled={loadingEmail !== null}
                            onClick={() => handleQuickLogin(user)}
                            className="flex flex-col p-4 bg-white hover:bg-gray-50/80 border border-gray-200 hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition duration-150 cursor-pointer disabled:opacity-50 text-left group"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-gray-700">
                                        {isCurrentLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        ) : (
                                            <IconComponent className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600">
                                            {user.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-500">{user.email}</span>
                                            <span className="text-[10px] font-medium text-gray-400">•</span>
                                            <span className="text-[11px] font-semibold text-gray-600">{user.companyKey ? t(`quick_login.${user.companyKey}`) : user.company}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                                {t(`quick_login.${user.descKey}`)}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
