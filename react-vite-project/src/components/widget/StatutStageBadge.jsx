import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const STYLES_STATUTS = {
    EMBAUCHEE: {
        badge: "font-bold bg-emerald-50 text-emerald-800 border-emerald-200",
        icone: CheckCircle2,
        iconeClasse: "text-emerald-600",
        cle: "professeur.statut.EMBAUCHEE"
    },
    ACCEPTEE: {
        badge: "font-bold bg-blue-50 text-blue-800 border-blue-200",
        icone: CheckCircle2,
        iconeClasse: "text-blue-600",
        cle: "professeur.statut.ACCEPTEE"
    },
    EN_ATTENTE: {
        badge: "font-bold bg-amber-50 text-amber-800 border-amber-200",
        icone: Clock,
        iconeClasse: "text-amber-600",
        cle: "professeur.statut.EN_ATTENTE"
    },
    EN_ATTENTE_REPONSE: {
        badge: "font-bold bg-purple-50 text-purple-800 border-purple-200",
        icone: Clock,
        iconeClasse: "text-purple-600",
        cle: "professeur.statut.EN_ATTENTE_REPONSE"
    },
    REFUSEE: {
        badge: "font-bold bg-rose-50 text-rose-800 border-rose-200",
        icone: AlertCircle,
        iconeClasse: "text-rose-600",
        cle: "professeur.statut.REFUSEE"
    },
    REFUSE: {
        badge: "font-bold bg-rose-50 text-rose-800 border-rose-200",
        icone: AlertCircle,
        iconeClasse: "text-rose-600",
        cle: "professeur.statut.REFUSEE"
    },
    EN_RECHERCHE: {
        badge: "font-semibold bg-slate-100 text-slate-700 border-slate-200",
        icone: Clock,
        iconeClasse: "text-slate-500",
        cle: "professeur.statut.EN_RECHERCHE"
    }
};

export default function StatutStageBadge({ statut }) {
    const { t } = useTranslation("main");
    const config = STYLES_STATUTS[statut];
    const Icone = config ? config.icone : Clock;
    const badgeClasse = config
        ? config.badge
        : "font-semibold bg-slate-100 text-slate-700 border-slate-200";
    const iconeClasse = config ? config.iconeClasse : "text-slate-500";
    const texte = config
        ? t(config.cle)
        : statut
            ? t(`professeur.statut.${statut}`)
            : t("common.not_available");

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${badgeClasse}`}>
            <Icone className={`w-3.5 h-3.5 ${iconeClasse}`} />
            {texte}
        </span>
    );
}

