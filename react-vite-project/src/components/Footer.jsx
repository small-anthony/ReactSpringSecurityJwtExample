import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

function Footer() {
  const { t } = useTranslation("main");

  return (
    <footer className="border-t border-slate-200/80 bg-white py-6 px-4 text-center text-sm text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-medium text-slate-500">{t("footer.copyright")}</p>
        <Link
          to="/about"
          className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
        >
          {t("pagename.about")}
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
