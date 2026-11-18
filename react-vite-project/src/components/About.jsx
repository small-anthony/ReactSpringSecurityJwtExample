import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Sparkles } from "lucide-react";

function About() {
  const { t } = useTranslation("main");

  return (
    <div className="max-w-xl mx-auto my-12 px-4 w-full">
      <div className="ds-card p-8 sm:p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t("about.title")}
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-5">
          {t("about.version")}
        </span>
        <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-base">
          {t("about.description")}
        </p>
        <Link
          to="/"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("about.go_back")}</span>
        </Link>
      </div>
    </div>
  );
}

export default About;
