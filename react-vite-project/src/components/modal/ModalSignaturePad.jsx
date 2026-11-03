import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Check, RotateCcw, PenTool, ShieldCheck, AlertCircle } from "lucide-react";
import { signerContrat } from "../../services/api/ContratAPI.js";

export default function ModalSignaturePad({ isOpen, onClose, contrat, onSuccess, authHeader }) {
    const { t } = useTranslation("main");
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [acceptConditions, setAcceptConditions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            initCanvas();
        }
    }, [isOpen]);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#1E3A8A";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        setHasDrawn(false);
        setAcceptConditions(false);
        setErreur(null);
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches && e.touches.length > 0) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.lineTo(x, y);
        ctx.stroke();
        if (!hasDrawn) {
            setHasDrawn(true);
        }
    };

    const stopDrawing = (e) => {
        if (isDrawing) {
            e.preventDefault();
            setIsDrawing(false);
        }
    };

    const handleClear = () => {
        initCanvas();
    };

    const handleConfirm = () => {
        if (!hasDrawn || !acceptConditions || !contrat) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        setSubmitting(true);
        setErreur(null);

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setErreur(t("signature_pad.error_blob", { defaultValue: "Impossible de capturer la signature." }));
                setSubmitting(false);
                return;
            }

            try {
                const signatureFile = new File([blob], `signature_${contrat.id}.png`, { type: "image/png" });
                const updatedContrat = await signerContrat(contrat.id, signatureFile, authHeader);
                if (onSuccess) {
                    onSuccess(updatedContrat);
                }
                onClose();
            } catch (err) {
                setErreur(err.message || t("signature_pad.error_sign", { defaultValue: "Erreur lors de la signature." }));
            } finally {
                setSubmitting(false);
            }
        }, "image/png");
    };

    if (!isOpen || !contrat) return null;

    const nomCompletEtudiant = `${contrat.etudiantPrenom || ""} ${contrat.etudiantNom || ""}`.trim();
    const dateAujourdhui = new Date().toLocaleDateString("fr-CA");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex items-center gap-2.5 text-gray-900">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <PenTool className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">
                                {t("signature_pad.title", { defaultValue: "Signer le contrat de stage" })}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {contrat.titreOffre} — {contrat.nomEntreprise}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                
                <div className="p-6 space-y-4">
                    {erreur && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{erreur}</span>
                        </div>
                    )}

                    
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-gray-700">
                        <div>
                            <p className="font-medium text-gray-500">
                                {t("signature_pad.signer", { defaultValue: "Signataire" })}
                            </p>
                            <p className="font-bold text-gray-900 text-sm">{nomCompletEtudiant}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-500">
                                {t("signature_pad.date", { defaultValue: "Date de signature" })}
                            </p>
                            <p className="font-semibold text-gray-900">{dateAujourdhui}</p>
                        </div>
                    </div>

                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                {t("signature_pad.draw_label", { defaultValue: "Tracez votre signature ci-dessous :" })}
                            </label>
                            {hasDrawn && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium transition cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{t("signature_pad.clear", { defaultValue: "Effacer" })}</span>
                                </button>
                            )}
                        </div>

                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden shadow-inner group hover:border-blue-400 transition">
                            <canvas
                                id="signature-canvas"
                                ref={canvasRef}
                                width={480}
                                height={160}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-40 touch-none cursor-crosshair bg-white"
                            />

                            
                            <div className="absolute bottom-6 left-6 right-6 border-b border-gray-200 pointer-events-none flex items-center justify-between">
                                <span className="text-[10px] text-gray-300 select-none pb-0.5">✕ Signature</span>
                                <span className="text-[10px] text-gray-300 select-none pb-0.5">L'étudiant(e)</span>
                            </div>

                            {!hasDrawn && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs">
                                    <p>{t("signature_pad.placeholder", { defaultValue: "Signez avec votre souris, pavé tactile ou doigt" })}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 select-none">
                            <input
                                id="checkbox-consent-signature"
                                type="checkbox"
                                checked={acceptConditions}
                                onChange={(e) => setAcceptConditions(e.target.checked)}
                                disabled={submitting}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>
                                {t("signature_pad.consent", {
                                    defaultValue:
                                        "Je certifie sur l'honneur avoir pris connaissance de l'ensemble des conditions et des tâches du contrat de stage et j'y appose ma signature électronique légale.",
                                })}
                            </span>
                        </label>
                    </div>
                </div>

                
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    >
                        {t("common.cancel", { defaultValue: "Annuler" })}
                    </button>
                    <button
                        type="button"
                        id="btn-confirmer-signature"
                        onClick={handleConfirm}
                        disabled={!hasDrawn || !acceptConditions || submitting}
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{t("signature_pad.signing", { defaultValue: "Signature en cours..." })}</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>{t("signature_pad.confirm", { defaultValue: "Confirmer la signature" })}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
