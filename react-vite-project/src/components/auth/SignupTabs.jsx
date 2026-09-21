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
    <div className="flex rounded-lg bg-gray-100 p-1 mb-6 border border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            className={`flex-1 text-center py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition duration-150 select-none ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            {t(`signup_tabs.${tab.key}`)}
          </Link>
        );
      })}
    </div>
  );
}
