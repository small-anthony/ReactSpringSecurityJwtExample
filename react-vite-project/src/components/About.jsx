import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function About() {
  const { t } = useTranslation("main");

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("about.title")}</h2>
      <p className="text-sm font-semibold text-blue-600 mb-4">{t("about.version")}</p>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {t("about.description")}
      </p>
      <Link
        to='/'
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
      >
        ← {t("about.go_back")}
      </Link>
    </div>
  );
}

export default About;
