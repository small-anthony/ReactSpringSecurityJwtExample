import { X, Building2, DollarSign, Calendar, GraduationCap, FileText, CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { postuler } from "../../services/api/OffreStageService.jsx";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

export default function ModalDetailOffre({ offre, onClose, aPostule, onPostulerSucces }) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(aPostule);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setHasApplied(aPostule);
        setErrorMessage("");
        setSuccessMessage("");
    }, [offre, aPostule]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!offre) return null;

    const handlePostuler = async () => {
        try {
            setIsApplying(true);
            setErrorMessage("");
            setSuccessMessage("");

            const authHeader = authService.buildAuthHeader();
            await postuler(authHeader, offre.id);

            setHasApplied(true);
            setSuccessMessage(t("offres_etudiant.modal.apply_success"));
            if (onPostulerSucces) {
                onPostulerSucces(offre.id);
            }
        } catch (err) {
            const msg = err.message || t("offres_etudiant.modal.apply_error");
            if (msg.toLowerCase().includes("déjà postulé") || msg.toLowerCase().includes("deja postule")) {
                setHasApplied(true);
                if (onPostulerSucces) {
                    onPostulerSucces(offre.id);
                }
            }
            setErrorMessage(msg);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête de modale */}
                <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-start bg-[#F8FAFC]">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] mb-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={1.5} />
                            <span>{t("offres_etudiant.modal.validated_badge", { defaultValue: "Offre validée" })}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-snug">
                            {offre.titre}
                        </h2>
                        <p className="text-sm font-medium text-[#4B5563] flex items-center gap-1.5 mt-1">
                            <Building2 className="w-4 h-4 text-[#64748B]" strokeWidth={1.5} />
                            <span>{offre.nomEntreprise}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        title={t("offres_etudiant.modal.close", { defaultValue: "Fermer" })}
                        aria-label={t("offres_etudiant.modal.close", { defaultValue: "Fermer" })}
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                {successMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-3">
                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <GraduationCap className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.discipline", { defaultValue: "Discipline" })}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug whitespace-normal break-words">
                                {offre.discipline ? traduireDiscipline(offre.discipline) : t("offres_etudiant.modal.not_specified", { defaultValue: "Non spécifiée" })}
                            </p>
                        </div>

                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <Calendar className="w-4 h-4 text-[#059669]" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.duration", { defaultValue: "Durée" })}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug">
                                {offre.duree ? traduireDuree(offre.duree) : t("offres_etudiant.modal.not_specified", { defaultValue: "Non spécifiée" })}
                            </p>
                        </div>

                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <DollarSign className="w-4 h-4 text-[#D97706]" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.salary", { defaultValue: "Rémunération" })}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug">
                                {formaterSalaire(offre.salaire)}
                            </p>
                        </div>
                    </div>

                    {offre.exigences && (
                        <div className="bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB] rounded-r-xl p-4">
                            <h3 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">
                                {t("offres_etudiant.modal.requirements", { defaultValue: "EXIGENCES PARTICULIÈRES" })}
                            </h3>
                            <p className="text-sm text-[#1E3A8A] whitespace-pre-line leading-relaxed">
                                {offre.exigences}
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#2563EB]" strokeWidth={1.5} />
                            <span>{t("offres_etudiant.modal.description", { defaultValue: "Description du stage" })}</span>
                        </h3>
                        <div className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                            {offre.description || t("offres_etudiant.modal.no_description", { defaultValue: "Aucune description fournie." })}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#4B5563] bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-xs"
                    >
                        {t("offres_etudiant.modal.close", { defaultValue: "Fermer" })}
                    </button>

                    {!hasApplied && (
                        <button
                            type="button"
                            onClick={handlePostuler}
                            disabled={isApplying}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition shadow-xs hover:shadow cursor-pointer disabled:opacity-60"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                    <span>{t("offres_etudiant.modal.applying", { defaultValue: "Envoi..." })}</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" strokeWidth={1.5} />
                                    <span>{t("offres_etudiant.modal.btn_apply", { defaultValue: "Postuler" })}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}