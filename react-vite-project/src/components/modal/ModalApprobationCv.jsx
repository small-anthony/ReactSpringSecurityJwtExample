import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ModalApprobationCv({ onClose, onConfirm }) {
    const { t } = useTranslation("main");
    const [message, setMessage] = useState("");

    return (
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
                {t("approbation.cvs.modal_approve.title")}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
                {t("approbation.cvs.modal_approve.description")}
            </p>
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                >
                    {t("common.cancel")}
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(message)}
                    className="btn-success"
                >
                    {t("approbation.cvs.modal_approve.confirm")}
                </button>
            </div>
        </div>
    );
}