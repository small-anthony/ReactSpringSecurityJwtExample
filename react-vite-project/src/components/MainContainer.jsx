import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function MainContainer() {
  const { t } = useTranslation("main");

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
    </div>
  );
}

export default MainContainer;
