import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalRefuserConvocation({ isOpen, onClose, onConfirm, convocation, loading }) {
  const { t } = useTranslation("main");
  const [motif, setMotif] = useState("");

  if (!isOpen || !convocation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(motif.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/60">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-lg">
              {t("convocation.modal_refus.title", { defaultValue: "Refuser la convocation" })}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            {t("convocation.modal_refus.warning", {
              defaultValue:
                "Êtes-vous certain de vouloir refuser cette convocation d'entrevue ? L'employeur en sera immédiatement informé.",
            })}
          </p>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
            <p className="font-semibold text-gray-900">{convocation.titrePoste || "Entrevue de stage"}</p>
            <p className="text-gray-500">{convocation.nomEntreprise}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("convocation.modal_refus.motif_label", {
                defaultValue: "Motif du refus (optionnel)",
              })}
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder={t("convocation.modal_refus.motif_placeholder", {
                defaultValue: "Ex: J'ai déjà accepté une autre offre, indisponibilité...",
              })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm transition outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              {t("common.cancel", { defaultValue: "Annuler" })}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? t("common.submitting", { defaultValue: "Traitement..." })
                : t("convocation.modal_refus.btn_confirm", { defaultValue: "Confirmer le refus" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
