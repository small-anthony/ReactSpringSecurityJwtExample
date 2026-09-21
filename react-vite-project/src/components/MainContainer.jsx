import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

function MainContainer({ user: propUser }) {
  const { t } = useTranslation("main");
  const outletContext = useOutletContext();
  const user = propUser || outletContext?.user;

  const formatRole = (roleString) => {
    if (!roleString) return "";
    const roleName = roleString.replace("ROLE_", "");
    return t(`role.${roleName.toLowerCase()}`, { defaultValue: roleName });
  };

  const initials = user
    ? `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase()
    : "";

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

      {user ? (
        <div className="inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-xs max-w-md mx-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-blue-500/25">
            {initials || "✓"}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-blue-700 font-medium">
              {t("home.connected_as", { defaultValue: "Connecté en tant que" })}{" "}
              <span className="font-semibold uppercase">
                {formatRole(user.role?.toString())}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition duration-150 text-base text-center"
          >
            {t("home.cta_signup")}
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-xl border border-gray-300 shadow-xs hover:border-gray-400 transition duration-150 text-base text-center"
          >
            {t("home.cta_login")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default MainContainer;
