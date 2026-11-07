import { useState } from "react";
import {useTranslation} from "react-i18next";

export default function ModalRefus({ mode, onClose, onConfirm }) {
    const { t } = useTranslation("main");
    const [message, setMessage] = useState("");

    return (
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t(`approbation.modal_refus.${mode}.titre`)}
            </h3>
            <label className="ds-label">
                {t("approbation.modal_refus.label_motif")} <span className="text-red-500">*</span>
            </label>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(`approbation.modal_refus.${mode}.placeholder`)}
                className="ds-input"
                rows="3"
            />
            <div className="flex gap-3 mt-4 justify-end">
                <button
                    onClick={onClose}
                    className="btn-secondary"
                >
                    {t("approbation.modal_refus.annuler")}
                </button>
                <button
                    onClick={() => onConfirm(message)}
                    disabled={!message.trim()}
                    className="btn-danger"
                >
                    {t("approbation.modal_refus.confirmer")}
                </button>
            </div>
        </div>
    );
}
