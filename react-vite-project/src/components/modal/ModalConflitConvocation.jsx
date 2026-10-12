import React, { useState } from "react";
import { X, CalendarClock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalConflitConvocation({ isOpen, onClose, onConfirm, convocation, loading }) {
  const { t, i18n } = useTranslation("main");
  const [nouvelleDate, setNouvelleDate] = useState("");
  const [motif, setMotif] = useState("");
  const [erreur, setErreur] = useState("");

  if (!isOpen || !convocation) return null;

  // Calculer la date minimale (maintenant + 1 heure) pour le datepicker
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErreur("");

    if (!nouvelleDate) {
      setErreur(
        t("convocation.modal_conflit.error_date_required", {
          defaultValue: "Veuillez sélectionner une nouvelle date et heure.",
        })
      );
      return;
    }

    const dateChoisie = new Date(nouvelleDate);
    if (dateChoisie <= new Date()) {
      setErreur(
        t("convocation.modal_conflit.error_date_past", {
          defaultValue: "La date proposée doit obligatoirement être dans le futur.",
        })
      );
      return;
    }

    onConfirm({
      nouvelleDate,
      motif: motif.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-50/70">
          <div className="flex items-center gap-2 text-blue-700">
            <CalendarClock className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-lg">
              {t("convocation.modal_conflit.title", { defaultValue: "Signaler un conflit d'horaire" })}
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
            {t("convocation.modal_conflit.description", {
              defaultValue:
                "Proposez une autre plage horaire à l'employeur si vous n'êtes pas disponible à la date prévue.",
            })}
          </p>

          {erreur && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
            <p className="font-semibold text-gray-900">{convocation.titrePoste || "Entrevue de stage"}</p>
            <p className="text-gray-500">{convocation.nomEntreprise}</p>
            <p className="text-gray-600">
              <span className="font-medium">
                {t("convocation.modal_conflit.initial_date", { defaultValue: "Date initiale prévue :" })}{" "}
              </span>
              {convocation.dateHeure
                ? new Date(convocation.dateHeure).toLocaleString(
                    i18n.language?.startsWith("en") ? "en-US" : "fr-CA"
                  )
                : "N/D"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("convocation.modal_conflit.new_date_label", {
                defaultValue: "Nouvelle date et heure suggérées *",
              })}
            </label>
            <input
              type="datetime-local"
              min={getMinDateTime()}
              value={nouvelleDate}
              onChange={(e) => {
                setNouvelleDate(e.target.value);
                setErreur("");
              }}
              required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("convocation.modal_conflit.justification_label", {
                defaultValue: "Justification / Explication pour l'employeur",
              })}
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder={t("convocation.modal_conflit.justification_placeholder", {
                defaultValue: "Ex: J'ai un examen universitaire ou un cours à cette heure-là...",
              })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition outline-none"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? t("common.submitting", { defaultValue: "Envoi..." })
                : t("convocation.modal_conflit.btn_submit", { defaultValue: "Envoyer la proposition" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
