import { useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { updateOffreStage } from "../../services/api/OffreStageService.js";
import OffreForm from "../form/OffreForm.jsx";
import {useTranslation} from "react-i18next";
import ModalConfirmation from "./ModalConfirmation.jsx";
import {X} from "lucide-react";

export default function ModalModifierOffre({ offre, onClose, onOffreModifiee }) {
    const authService = useContext(AuthServiceContext);
    const { t } = useTranslation("main");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [offreMiseAJour, setOffreMiseAJour] = useState(null);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError("");

        try {
            let finalSalaire = formData.salaire.toString().trim();
            if (finalSalaire && !finalSalaire.toLowerCase().includes("h")) {
                finalSalaire = `${finalSalaire} $/h`;
            }

            const payload = {
                ...formData,
                salaire: finalSalaire,
            };

            const updated = await updateOffreStage(payload, authService.buildAuthHeader());
            setOffreMiseAJour(updated);
            setIsSuccess(true);
        } catch (err) {
            setError(err.message || t("employeur_home.edit_error"));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <ModalConfirmation
                isOpen={true}
                type="success"
                isSuccess={true}
                title={t("employeur_home.modal_edit_success_title")}
                message={t("employeur_home.modal_edit_success_message")}
                confirmText={t("common.confirm")}
                onConfirm={() => {
                    onOffreModifiee(offreMiseAJour);
                    onClose();
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {t("employeur_home.modal_edit_title")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <OffreForm
                    id="formModifierOffre"
                    initialValues={offre}
                    onSubmit={handleSubmit}
                />

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                        {t("employeur_home.cancel")}
                    </button>
                    <button
                        type="submit"
                        form="formModifierOffre"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                        {isLoading ? t("employeur_home.saving") : t("employeur_home.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}