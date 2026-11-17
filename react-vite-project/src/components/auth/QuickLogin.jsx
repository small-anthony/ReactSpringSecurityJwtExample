import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { Briefcase, GraduationCap, ShieldCheck, Loader2, ArrowUpRight } from "lucide-react";
import { BASE_URL } from "../config/Config.jsx";

const COLOR_STYLES = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white",
    blue: "bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-600 group-hover:text-white",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white",
    slate: "bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-700 group-hover:text-white",
    teal: "bg-teal-50 text-teal-700 border-teal-200 group-hover:bg-teal-600 group-hover:text-white"
};

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
        name: "Martin Tremblay",
        companyKey: "company_professeur",
        role: "professeur",
        email: "professeur@test.com",
        password: "password",
        descKey: "martin_desc",
        icon: GraduationCap,
        color: "teal"
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
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    {t("login_page.quickLogin")}
                </p>
            </div>

            {error && (
                <div className="mb-4 ds-alert-error">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {DEMO_USERS.map((user) => {
                    const IconComponent = user.icon;
                    const isCurrentLoading = loadingEmail === user.email;
                    const iconStyle = COLOR_STYLES[user.color] || COLOR_STYLES.blue;

                    return (
                        <button
                            key={user.email}
                            type="button"
                            disabled={loadingEmail !== null}
                            onClick={() => handleQuickLogin(user)}
                            className="flex flex-col p-4 bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-400 rounded-2xl shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2.5 w-full">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-150 ${iconStyle}`}>
                                        {isCurrentLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <IconComponent className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                            {user.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="text-[11px] text-slate-500 truncate">{user.email}</span>
                                            <span className="text-[10px] font-medium text-slate-300">•</span>
                                            <span className="text-[11px] font-semibold text-slate-700">
                                                {user.companyKey ? t(`quick_login.${user.companyKey}`) : user.company}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                            </div>

                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {t(`quick_login.${user.descKey}`)}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
