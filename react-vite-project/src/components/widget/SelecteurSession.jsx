import { useTranslation } from "react-i18next";

export default function SelecteurSession({ annees, anneeSelectionnee, onChangementAnnee }) {
    const { t } = useTranslation("main");
    const listeAnnees = Array.isArray(annees) ? annees : [];
    return (
        <div className="flex items-center gap-2">
            <select
                value={anneeSelectionnee || ""}
                onChange={({ target }) => onChangementAnnee(target.value ? parseInt(target.value, 10) : null)}
                className="ds-input py-2 px-3.5 w-auto cursor-pointer font-medium"
            >
                <option value="">{t("session.toutes")}</option>
                {listeAnnees.map((annee) => (
                    <option key={annee} value={annee}>
                        {t("session.libelle", { annee })}
                    </option>
                ))}
            </select>
        </div>
    );
}
