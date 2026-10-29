import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ModalApprobationCv({ onClose, onConfirm }) {
    const { t } = useTranslation("main");
    const [message, setMessage] = useState("");

    return (
        <div className="mt-6 pt-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t("approbation.cvs.modal_approve.title")}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
                {t("approbation.cvs.modal_approve.description")}
            </p>
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    {t("common.cancel")}
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(message)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                    {t("approbation.cvs.modal_approve.confirm")}
                </button>
            </div>
        </div>
    );
}