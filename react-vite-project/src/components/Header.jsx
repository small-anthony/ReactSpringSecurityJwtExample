import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthServiceContext } from "../services/AuthService.tsx";
import { useTranslation } from "react-i18next";
import "./Header.css";
import {NotificationButton} from "./modal/NotificationPopover.jsx";

function extraireRoleTexte(user) {
  if (!user || !user.role) {
    return "";
  }
  return String(user.role);
}

function extraireInitiales(user) {
  if (!user) {
    return "";
  }
  const prenom = user.firstName ? String(user.firstName) : "";
  const nom = user.lastName ? String(user.lastName) : "";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function Header({ user }) {
  const authService = useContext(AuthServiceContext);
  const { t, i18n } = useTranslation("main");
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const logOut = () => {
    authService.logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const roleTexte = extraireRoleTexte(user);
  const roleMajuscule = roleTexte.toUpperCase();

  const formatRole = (roleString) => {
    if (!roleString) return "";
    const roleName = roleString.replace("ROLE_", "").toLowerCase();
    return t(`role.${roleName}`);
  };

  const isEtudiant = roleTexte === "ROLE_ETUDIANT";
  const isEmployeur = roleTexte === "ROLE_EMPLOYEUR";

  const getHomeRoute = () => {
    if (!user) return "/";
    if (roleMajuscule.includes("ETUDIANT")) return "/etudiant";
    if (roleMajuscule.includes("EMPLOYEUR")) return "/employeur";
    if (roleMajuscule.includes("GESTIONNAIRE")) return "/gestionnaire";
    if (roleMajuscule.includes("PROFESSEUR")) return "/professeur";
    return "/";
  };

  const currentLang = (i18n && i18n.language) || "fr";

  const navLinkClasses = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "text-blue-600 bg-blue-50/90 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3.5 py-2.5 rounded-xl text-base font-medium transition-all duration-150 ${
      isActive
        ? "text-blue-600 bg-blue-50 font-semibold"
        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const initials = extraireInitiales(user);
  const prenom = user ? user.firstName : "";
  const nom = user ? user.lastName : "";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={getHomeRoute()}
            className="flex items-center gap-2.5 group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xs shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Stag<span className="text-blue-600">ify</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {!user && (
              <>
                <NavLink to="/" className={navLinkClasses} end>
                  {t("pagename.home")}
                </NavLink>
                <NavLink to="/about" className={navLinkClasses}>
                  {t("pagename.about")}
                </NavLink>
              </>
            )}
            {isEmployeur && (
              <>
                <NavLink to="/employeur" className={navLinkClasses} end>
                  {t("pagename.voir_offres")}
                </NavLink>
                <NavLink to="/employeur/contrats" className={navLinkClasses}>
                  {t("pagename.contrats_employeur")}
                </NavLink>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer ${
                  currentLang.startsWith("fr")
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer ${
                  currentLang.startsWith("en")
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5 pl-2">
                <NotificationButton/>
                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200/90 text-xs shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {initials || "U"}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {formatRole(roleTexte)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition duration-150 cursor-pointer border border-transparent hover:border-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {t("pagename.logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-ghost text-sm"
                >
                  {t("pagename.login")}
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm py-2 px-4"
                >
                  {t("pagename.signup")}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2.5 py-0.5 rounded-md ${
                  currentLang.startsWith("fr")
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-md ${
                  currentLang.startsWith("en")
                    ? "bg-white text-blue-600 font-bold shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {!user && (
            <>
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
                end
              >
                {t("pagename.home")}
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
              >
                {t("pagename.about")}
              </NavLink>
            </>
          )}
          {isEtudiant && (
            <>
              <NavLink
                to="/etudiant"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
                end
              >
                {t("pagename.offres_stages")}
              </NavLink>
              <NavLink
                to="/etudiant?tab=contrats"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
              >
                {t("pagename.contrats")}
              </NavLink>
            </>
          )}

          {isEmployeur && (
            <>
              <NavLink
                to="/employeur"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
                end
              >
                {t("pagename.voir_offres")}
              </NavLink>
              <NavLink
                to="/employeur/contrats"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClasses}
              >
                {t("pagename.contrats_employeur")}
              </NavLink>
            </>
          )}

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <span className="font-semibold">
                  {prenom} {nom}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {formatRole(roleTexte)}
                </span>
              </div>
              <button
                type="button"
                onClick={logOut}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition duration-150 cursor-pointer"
              >
                {t("pagename.logout")}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full"
              >
                {t("pagename.login")}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full"
              >
                {t("pagename.signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
