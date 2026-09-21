import React from "react";
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import './Footer.css';

function Footer() {
  const { t } = useTranslation("main");

  return (
    <footer className="border-t border-gray-100 bg-white py-6 text-center text-sm text-gray-500 mt-auto">
      <p>{t("footer.copyright")}</p>
      <Link to='/about' className="text-blue-600 hover:underline mt-1 inline-block font-medium">
        {t("pagename.about")}
      </Link>
    </footer>
  );
}

export default Footer;
