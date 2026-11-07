import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SignupTabs({ activeTab = "employeur" }) {
  const { t } = useTranslation("main");

  const tabs = [
    { key: "etudiant", to: "/signup/etudiant" },
    { key: "employeur", to: "/signup/employeur" },
    { key: "professeur", to: "/signup/professeur" },
  ];

  return (
    <div className="ds-tabs-bar mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            className={`ds-tab ${
              isActive ? "ds-tab-active" : "ds-tab-inactive"
            }`}
          >
            {t(`signup_tabs.${tab.key}`)}
          </Link>
        );
      })}
    </div>
  );
}
