import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModalConfirmation({ isOpen,
                                              onClose,
                                              onConfirm,
                                              title,
                                              message,
                                              details,
                                              type = "warning",
                                              confirmText,
                                              cancelText,
                                              isSuccess = false,
                                              loading = false, }) {
    const { t } = useTranslation("main");
    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {onClose && !loading && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
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
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {title}
                        </h3>
                        {!isSuccess && message && (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {message}
                            </p>
                        )}
                    </div>
                </div>
                {isSuccess && message && (
                    <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                        {message}
                    </p>
                )}
                {details && (
                    <div className="my-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800">
                        {details}
                    </div>
                )}
                <div
                    className={`flex items-center gap-3 pt-4 border-t border-gray-100 ${
                        isSuccess ? "justify-center" : "justify-end"
                    }`}
                >
                    {!isSuccess && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                            {cancelText || t("common.cancel")}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onConfirm()}
                        disabled={loading}
                        className={`${
                            isSuccess ? "w-full" : ""
                        } px-5 py-2 text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 ${
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