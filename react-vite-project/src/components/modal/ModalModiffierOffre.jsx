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
        <div className="ds-modal-backdrop">
            <div className="ds-modal-panel max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">
                        {t("employeur_home.modal_edit_title")}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 ds-alert-error" role="alert">
                        {error}
                    </div>
                )}

                <OffreForm
                    id="formModifierOffre"
                    initialValues={offre}
                    onSubmit={handleSubmit}
                />

                <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        {t("employeur_home.cancel")}
                    </button>
                    <button
                        type="submit"
                        form="formModifierOffre"
                        disabled={isLoading}
                        className="btn-primary"
                    >
                        {isLoading ? t("employeur_home.saving") : t("employeur_home.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}