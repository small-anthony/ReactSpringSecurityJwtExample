import { X, Building2, DollarSign, Calendar, GraduationCap, FileText, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function ModalDetailOffre({ offre, onClose }) {
    const { t } = useTranslation("main");

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!offre) return null;

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
                            <span>Offre validée</span>
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
                        title="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <GraduationCap className="w-4 h-4 text-indigo-500" />
                                <span>Discipline</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {offre.discipline || "Non spécifiée"}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                <span>Durée</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {offre.duree || "Non spécifiée"}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                                <DollarSign className="w-4 h-4 text-amber-500" />
                                <span>Rémunération</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {offre.salaire || "À discuter"}
                            </p>
                        </div>
                    </div>

                    {/* Exigences particulières */}
                    {offre.exigences && (
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                                Exigences particulières
                            </h3>
                            <p className="text-sm text-blue-950 whitespace-pre-line">
                                {offre.exigences}
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Description du stage</span>
                        </h3>
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                            {offre.description || "Aucune description fournie."}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
