import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalConfirmation({
                                              isOpen,
                                              onClose,
                                              onConfirm,
                                              title,
                                              titre,
                                              message,
                                              details,
                                              type = "warning",
                                              confirmText,
                                              cancelText,
                                              isSuccess = false,
                                              loading = false,
                                          }) {
    const { t } = useTranslation("main");
    if (!isOpen) return null;

    const displayTitle = title || titre;
    const isConfirmAction = Boolean(onConfirm) && !isSuccess;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else if (onClose) {
            onClose();
        }
    };

    const typeConfig = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
            iconBg: "bg-rose-100",
            btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            iconBg: "bg-amber-100",
            btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        success: {
            icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
            iconBg: "bg-emerald-100",
            btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            iconBg: "bg-blue-100",
            btnBg: "bg-blue-600 hover:bg-blue-700 text-white",
        },
    };

    const currentType = typeConfig[type] || typeConfig.warning;

    return (
        <div className="ds-modal-backdrop animate-in fade-in duration-200">
            <div className="relative ds-modal-panel max-w-md p-6">
                {onClose && !loading && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <div className={isSuccess ? "text-center" : "flex items-start gap-4 mb-3"}>
                    <div
                        className={`w-12 h-12 rounded-full ${currentType.iconBg} flex items-center justify-center shrink-0 ${
                            isSuccess ? "mx-auto mb-4" : ""
                        }`}
                    >
                        {currentType.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {displayTitle}
                        </h3>
                        {!isSuccess && message && (
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
                {isSuccess && message && (
                    <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
                        {message}
                    </p>
                )}
                {details && (
                    <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
                        {details}
                    </div>
                )}
                <div
                    className={`flex items-center gap-3 pt-4 border-t border-slate-100 ${
                        isSuccess ? "justify-center" : "justify-end"
                    }`}
                >
                    {isConfirmAction && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn-secondary"
                        >
                            {cancelText || t("common.cancel")}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`${
                            isSuccess ? "w-full" : ""
                        } px-5 py-2.5 text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50 ${
                            currentType.btnBg
                        }`}
                    >
                        {loading
                            ? t("common.submitting")
                            : confirmText || t("common.confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}