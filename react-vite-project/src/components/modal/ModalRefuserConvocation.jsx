import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalRefuserConvocation({ isOpen, onClose, onConfirm, convocation, loading }) {
  const { t } = useTranslation("main");
  const [motif, setMotif] = useState("");

  if (!isOpen || !convocation) return null;

  const { titrePoste, nomEntreprise } = convocation;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(motif.trim());
  };

  return (
    <div className="ds-modal-backdrop">
      <div className="ds-modal-panel max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/60">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-lg">
              {t("convocation.modal_refus.title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            {t("convocation.modal_refus.warning")}
          </p>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              {titrePoste || t("convocation.default_position")}
            </p>
            <p className="text-slate-500">{nomEntreprise}</p>
          </div>

          <div>
            <label className="ds-label">
              {t("convocation.modal_refus.motif_label")}
            </label>
            <textarea
              value={motif}
              onChange={({ target }) => setMotif(target.value)}
              rows={3}
              placeholder={t("convocation.modal_refus.motif_placeholder")}
              className="ds-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-danger"
            >
              {loading
                ? t("common.submitting")
                : t("convocation.modal_refus.btn_confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
