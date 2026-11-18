import { useTranslation } from "react-i18next";

export default function SelecteurSession({ annees, anneeSelectionnee, onChangementAnnee }) {
    const { t } = useTranslation("main");
    const listeAnnees = Array.isArray(annees) ? annees : [];

    if (listeAnnees.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={anneeSelectionnee ?? listeAnnees[0]}
                onChange={({ target }) => onChangementAnnee(parseInt(target.value, 10))}
                className="ds-input py-2 px-3.5 w-auto cursor-pointer font-medium"
            >
                {listeAnnees.map((annee) => (
                    <option key={annee} value={annee}>
                        {t("session.libelle", { annee })}
                    </option>
                ))}
            </select>
        </div>
    );
}
