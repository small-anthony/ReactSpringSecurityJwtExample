import { X, Building2, DollarSign, Calendar, GraduationCap, FileText, CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { postuler } from "../../services/api/OffreStageService.js";
import { DISCIPLINES } from "../../constants/disciplines";

export default function ModalDetailOffre({ offre, onClose, aPostule, onPostulerSucces }) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

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

    const traduireDiscipline = (valeur) => {
        const disc = DISCIPLINES.find((d) => d.value === valeur);
        return t(`signup_etudiant.disciplines.${disc ? disc.labelKey : valeur}`, valeur);
    };

    const traduireDuree = (valeur) => {
        const nombre = parseInt(valeur, 10);
        return Number.isNaN(nombre) ? valeur : t("creer_offre.weeks", { count: nombre });
    };

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-slate-50/70">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t("offres_etudiant.modal.validated_badge")}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-snug">
                            {offre.titre}
                        </h2>
                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5 mt-1">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{offre.nomEntreprise}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        title={t("offres_etudiant.modal.close")}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {successMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                <span>{t("offres_etudiant.modal.discipline")}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {offre.discipline ? traduireDiscipline(offre.discipline) : t("offres_etudiant.modal.not_specified")}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                <span>{t("offres_etudiant.modal.duration")}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {offre.duree ? traduireDuree(offre.duree) : t("offres_etudiant.modal.not_specified")}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <DollarSign className="w-4 h-4 text-amber-500" />
                                <span>{t("offres_etudiant.modal.salary")}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {offre.salaire || t("offres_etudiant.salary_to_discuss")}
                            </p>
                        </div>
                    </div>

                    {offre.exigences && (
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                                {t("offres_etudiant.modal.requirements")}
                            </h3>
                            <p className="text-sm text-blue-950 whitespace-pre-line">
                                {offre.exigences}
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>{t("offres_etudiant.modal.description")}</span>
                        </h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            {offre.description || t("offres_etudiant.modal.no_description")}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                        {t("offres_etudiant.modal.close")}
                    </button>

                    {hasApplied ? (
                        <button
                            disabled
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{t("offres_etudiant.modal.btn_applied")}</span>
                        </button>
                    ) : (
                        <button
                            onClick={handlePostuler}
                            disabled={isApplying}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t("offres_etudiant.modal.applying")}</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>{t("offres_etudiant.modal.btn_apply")}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}