import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuickLogin from "../auth/QuickLogin.jsx";

function PageAccueilStagify() {
  const { t } = useTranslation("main");

  return (
    <div className="maincontainer max-w-5xl mx-auto text-center py-14 sm:py-20 px-4 sm:px-6 w-full">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide uppercase mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Stagify</span>
      </div>

      <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-4">
        Stag<span className="text-blue-600">ify</span>
      </h1>
      <p className="text-xl sm:text-2xl font-bold text-slate-700 mb-5 max-w-2xl mx-auto">
        {t("home.subtitle")}
      </p>
      <p className="text-base sm:text-lg text-slate-600 mb-9 leading-relaxed max-w-2xl mx-auto">
        {t("home.description")}
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-md mx-auto mb-12">
        <Link
          to="/login"
          className="btn-secondary w-full sm:w-auto py-3 px-8 text-base"
        >
          {t("home.cta_login")}
        </Link>
        <Link
          to="/signup"
          className="btn-primary w-full sm:w-auto py-3 px-8 text-base shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {t("home.cta_signup")}
        </Link>
      </div>

      <QuickLogin />
    </div>
  );
}

export default PageAccueilStagify;
