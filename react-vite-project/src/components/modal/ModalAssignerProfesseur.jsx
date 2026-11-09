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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {etudiant.estAssigne
                                ? t("assignation_professeurs.modal_titre_modifier")
                                : t("assignation_professeurs.modal_titre_assigner")}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {etudiant.firstName} {etudiant.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Stage chez <span className="font-semibold text-gray-700">{etudiant.nomEntreprise}</span> ({etudiant.titreOffreStage})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 mb-1.5">
                            {t("assignation_professeurs.modal_label_recherche")}
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={rechercheProfesseur}
                                onChange={(e) => onRechercheChange(e.target.value)}
                                placeholder={t("assignation_professeurs.modal_recherche_placeholder")}
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 focus:bg-white transition"
                            />
                            {chargementProfs && (
                                <RefreshCw className="w-4 h-4 text-gray-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs uppercase tracking-wider font-bold text-gray-700">
                                {t("assignation_professeurs.modal_label_liste")} ({professeurs.length})
                            </label>
                            <span className="text-[11px] text-gray-400">
                                {t("assignation_professeurs.modal_seuil_info")}
                            </span>
                        </div>

                        {professeurs.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
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
                                            className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                                                estSelectionne
                                                    ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20"
                                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                                        estSelectionne
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {(prof.firstName || "").charAt(0)}
                                                    {(prof.lastName || "").charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 text-sm truncate">
                                                        {prof.firstName} {prof.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {prof.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        estTropCharge
                                                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {estTropCharge && (
                                                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                                                    )}
                                                    {prof.nombreEtudiantsAssignes}{" "}
                                                    {t("assignation_professeurs.etudiants_abrege")}
                                                </span>

                                                <div
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                        estSelectionne
                                                            ? "border-blue-600 bg-blue-600 text-white"
                                                            : "border-gray-300 bg-white"
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
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">
                                    {t("assignation_professeurs.avertissement_charge_titre")}
                                </p>
                                <p className="mt-0.5 text-amber-800 leading-relaxed">
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

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={soumissionEnCours}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmer}
                        disabled={!professeurSelectionne || soumissionEnCours}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
