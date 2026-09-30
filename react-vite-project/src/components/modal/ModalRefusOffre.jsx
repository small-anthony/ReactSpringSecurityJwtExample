import { useState } from "react";
import {useTranslation} from "react-i18next";

export default function ModalRefusOffre({ offre, onClose, onConfirm }) {
    const { t } = useTranslation("main");
    const [message, setMessage] = useState("");

    return (
        <div className="mt-6 pt-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('approbation.offres.refus.reason')} <span className="text-red-500">*</span>
            </label>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: La description du stage est trop courte..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-gray-50"
                rows="3"
            />
            <div className="flex gap-3 mt-3 justify-end">
                <button
                    onClick={onClose}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    {t('approbation.offres.refus.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(offre.id, message)}
                    disabled={!message.trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm text-white ${
                        !message.trim() ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                    {t('approbation.offres.refus.confirm')}
                </button>
            </div>
        </div>
    );
}