import React from "react";
import {
    GraduationCap,
    Search,
    RefreshCw,
    X,
    UserCheck,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalAssignerProfesseur({
    isOpen,
    onClose,
    etudiant,
    professeurs = [],
    professeurSelectionne,
    onSelectProfesseur,
    rechercheProfesseur,
    onRechercheChange,
    chargementProfs,
    onConfirmer,
    soumissionEnCours
}) {
    const { t } = useTranslation("main");

    if (!isOpen || !etudiant) return null;

    return (
        <div className="ds-modal-backdrop" onClick={onClose}>
            <div
                className="ds-modal-panel max-w-xl p-6 sm:p-7 space-y-6 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold mb-1.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {etudiant.estAssigne
                                ? t("assignation_professeurs.modal_titre_modifier")
                                : t("assignation_professeurs.modal_titre_assigner")}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {etudiant.firstName} {etudiant.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {t("assignation_professeurs.modal_stage_chez", {
                                entreprise: etudiant.nomEntreprise || "—",
                                titre: etudiant.titreOffreStage || "—"
                            })}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        aria-label={t("common.cancel")}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    <div>
                        <label className="ds-label text-xs uppercase tracking-wider">
                            {t("assignation_professeurs.modal_label_recherche")}
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={rechercheProfesseur}
                                onChange={(e) => onRechercheChange(e.target.value)}
                                placeholder={t("assignation_professeurs.modal_recherche_placeholder")}
                                className="ds-input pl-10 pr-10"
                            />
                            {chargementProfs && (
                                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="ds-label text-xs uppercase tracking-wider !mb-0">
                                {t("assignation_professeurs.modal_label_liste")} ({professeurs.length})
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium">
                                {t("assignation_professeurs.modal_seuil_info")}
                            </span>
                        </div>

                        {professeurs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium">
                                {t("assignation_professeurs.aucun_professeur")}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {professeurs.map((prof) => {
                                    const estSelectionne = professeurSelectionne?.id === prof.id;
                                    const estTropCharge = prof.tropEtudiants;

                                    return (
                                        <div
                                            key={prof.id}
                                            onClick={() => onSelectProfesseur(prof)}
                                            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                                                estSelectionne
                                                    ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                                        estSelectionne
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {(prof.firstName || "").charAt(0)}
                                                    {(prof.lastName || "").charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 text-sm truncate">
                                                        {prof.firstName} {prof.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {prof.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        estTropCharge
                                                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {estTropCharge && (
                                                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                                                    )}
                                                    {prof.nombreEtudiantsAssignes}{" "}
                                                    {t("assignation_professeurs.etudiants_abrege")}
                                                </span>

                                                <div
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                        estSelectionne
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    {estSelectionne && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {professeurSelectionne && professeurSelectionne.tropEtudiants && (
                        <div className="ds-alert-warning flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">
                                    {t("assignation_professeurs.avertissement_charge_titre")}
                                </p>
                                <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                                    {t("assignation_professeurs.avertissement_charge_message", {
                                        nom: `${professeurSelectionne.firstName} ${professeurSelectionne.lastName}`,
                                        count: professeurSelectionne.nombreEtudiantsAssignes,
                                        seuil: professeurSelectionne.seuilMax || 5
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={soumissionEnCours}
                        className="btn-secondary"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmer}
                        disabled={!professeurSelectionne || soumissionEnCours}
                        className="btn-primary"
                    >
                        {soumissionEnCours ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {t("common.submitting")}
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4" />
                                {etudiant.estAssigne
                                    ? t("assignation_professeurs.btn_confirmer_modification")
                                    : t("assignation_professeurs.btn_confirmer_assignation")}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
