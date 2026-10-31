import { useTranslation } from "react-i18next";

export default function SelecteurSession({ annees = [], anneeSelectionnee, onChangementAnnee }) {
    const { t } = useTranslation("main");
    return (
        <div className="flex items-center gap-2">
            <select
                value={anneeSelectionnee || ""}
                onChange={(e) => onChangementAnnee(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                aria-label="Filtrer par session"
            >
                <option value="">{t("session.toutes", "Toutes les sessions")}</option>
                {annees.map((annee) => (
                    <option key={annee} value={annee}>
                        {t("session.libelle", { annee, defaultValue: `Hiver ${annee}` })}
                    </option>
                ))}
            </select>
        </div>
    );
}