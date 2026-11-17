import React from "react";
import {
    Briefcase,
    Building2,
    Mail,
    CheckCircle2,
    Clock,
    ClipboardCheck,
    Eye,
    AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

const STYLES_STATUTS = {
    EMBAUCHEE: { badge: "font-bold bg-emerald-50 text-emerald-800 border-emerald-200", icone: CheckCircle2, iconeClasse: "text-emerald-600", cle: "professeur.statut.EMBAUCHEE" },
    ACCEPTEE: { badge: "font-bold bg-blue-50 text-blue-800 border-blue-200", icone: CheckCircle2, iconeClasse: "text-blue-600", cle: "professeur.statut.ACCEPTEE" },
    EN_ATTENTE: { badge: "font-bold bg-amber-50 text-amber-800 border-amber-200", icone: Clock, iconeClasse: "text-amber-600", cle: "professeur.statut.EN_ATTENTE" },
    EN_ATTENTE_REPONSE: { badge: "font-bold bg-purple-50 text-purple-800 border-purple-200", icone: Clock, iconeClasse: "text-purple-600", cle: "professeur.statut.EN_ATTENTE_REPONSE" },
    REFUSEE: { badge: "font-bold bg-rose-50 text-rose-800 border-rose-200", icone: AlertCircle, iconeClasse: "text-rose-600", cle: "professeur.statut.REFUSEE" },
    REFUSE: { badge: "font-bold bg-rose-50 text-rose-800 border-rose-200", icone: AlertCircle, iconeClasse: "text-rose-600", cle: "professeur.statut.REFUSEE" },
    EN_RECHERCHE: { badge: "font-semibold bg-slate-100 text-slate-700 border-slate-200", icone: Clock, iconeClasse: "text-slate-500", cle: "professeur.statut.EN_RECHERCHE" }
};

function StatutStageBadge({ statut }) {
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

export default function CarteEtudiantAssigne({ etudiant, onOuvrirEvaluation }) {
    const { t } = useTranslation("main");

    return (
        <div className="ds-card hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-xs shrink-0">
                        {(etudiant.firstName || "").charAt(0)}
                        {(etudiant.lastName || "").charAt(0)}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900">
                                {etudiant.firstName} {etudiant.lastName}
                            </h3>
                            <StatutStageBadge statut={etudiant.statutStage} />
                            {etudiant.aStage && (
                                etudiant.milieuEvalue ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        {t("professeur.badge_milieu_evalue")}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                                        {t("professeur.badge_milieu_a_evaluer")}
                                    </span>
                                )
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {etudiant.email}
                            </span>
                            <span>•</span>
                            <span>{t("professeur.matricule_label")}: {etudiant.matricule || "—"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{etudiant.entrepriseStage || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{etudiant.titreOffreStage || "—"}</span>
                        </div>
                    </div>

                    {etudiant.aStage && (
                        etudiant.milieuEvalue ? (
                            <button
                                type="button"
                                onClick={() => onOuvrirEvaluation(etudiant.id)}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t("professeur.btn_voir_evaluation_milieu")}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onOuvrirEvaluation(etudiant.id)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
                            >
                                <ClipboardCheck className="w-3.5 h-3.5" />
                                <span>{t("professeur.btn_evaluer_milieu")}</span>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
