import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthServiceContext } from "../services/AuthService.tsx";
import { useTranslation } from "react-i18next";
import "./Header.css";

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

  const formatRole = (roleString) => {
    if (!roleString) return "";
    const roleName = roleString.replace("ROLE_", "");
    return t(`role.${roleName.toLowerCase()}`, { defaultValue: roleName });
  };

  const currentLang = i18n.language || "fr";

  const navLinkClasses = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-medium transition duration-150 ${isActive
      ? "text-blue-600 bg-blue-50/80 font-semibold"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-3.5 py-2.5 rounded-lg text-base font-medium transition duration-150 ${isActive
      ? "text-blue-600 bg-blue-50 font-semibold"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    }`;

  const initials = user
    ? `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marque Stagify */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Stag<span className="text-blue-600">ify</span>
            </span>
          </Link>

          {/* Navigation Liens Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses}>
              {t("pagename.home")}
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              {t("pagename.about")}
            </NavLink>
          </nav>

          {/* Actions Droite Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sélecteur de Langue Segmenté (FR / EN) */}
            <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${currentLang.startsWith("fr")
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-md transition duration-150 cursor-pointer ${currentLang.startsWith("en")
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                {/* Badge Profil Utilisateur */}
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {initials || "U"}
                  </div>
                  <span className="font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {formatRole(user?.role?.toString())}
                  </span>
                </div>

                {/* Bouton Déconnexion */}
                <button
                  type="button"
                  onClick={logOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-150 cursor-pointer border border-transparent hover:border-red-100"
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
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition duration-150"
                >
                  {t("pagename.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-150"
                >
                  {t("pagename.signup")}
                </Link>
              </div>
            )}
          </div>

          {/* Bouton Menu Mobile (Hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Langue Mobile */}
            <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage("fr")}
                className={`px-2 py-0.5 rounded ${currentLang.startsWith("fr") ? "bg-white text-blue-600 font-bold" : "text-gray-500"
                  }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded ${currentLang.startsWith("en") ? "bg-white text-blue-600 font-bold" : "text-gray-500"
                  }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none cursor-pointer"
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

      {/* Menu Déroulant Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClasses}
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

          {user ? (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <span className="font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {formatRole(user?.role?.toString())}
                </span>
              </div>
              <button
                type="button"
                onClick={logOut}
                className="w-full text-left py-2 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              >
                {t("pagename.logout")}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition"
              >
                {t("pagename.login")}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
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