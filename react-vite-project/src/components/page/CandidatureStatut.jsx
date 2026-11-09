import { useTranslation } from "react-i18next";

const COULEURS = {
    EN_ATTENTE: "bg-slate-100 text-slate-800 border border-slate-200",
    ACCEPTEE: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    REFUSEE: "bg-red-50 text-red-800 border border-red-200",
    EN_ATTENTE_REPONSE: "bg-blue-50 text-blue-800 border border-blue-200",
    EMBAUCHEE: "bg-emerald-50 text-emerald-800 border border-emerald-200",
};

export default function CandidatureStatut({ candidature }) {
    const { t } = useTranslation("main");

    if (!candidature || candidature.statut === "EN_ATTENTE") {
        return null;
    }

    return (
        <div className="space-y-2 text-xs">
            <span
                className={`inline-block px-2.5 py-1 rounded-full font-semibold ${COULEURS[candidature.statut] || COULEURS.EN_ATTENTE}`}
            >
                {t(`candidature_etudiant.status.${candidature.statut}`, {
                    defaultValue: candidature.statut,
                })}
            </span>

            {candidature.statut === "REFUSEE" && candidature.messageReponse && (
                <p className="text-gray-700">
                    <span className="font-semibold">{t("candidature_etudiant.refuse_reason")} : </span>
                    {candidature.messageReponse}
                </p>
            )}
        </div>
    );
}