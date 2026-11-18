import ModalTeleverserCv from "./ModalTeleverserCv.jsx";
import { useEffect, useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStatutCv } from "../../services/api/EtudiantService.js";
import { checkCvExists } from "../../services/api/EtudiantCvService.js";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock3, XCircle, UploadCloud, FileText, X } from "lucide-react";

export default function ModalCvEtudiant({ compact, onStatusChange }) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [cvStatut, setCvStatut] = useState(null);
    const [cvExiste, setCvExiste] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [afficherUploadModal, setAfficherUploadModal] = useState(false);

    const notifierChangementStatut = (existe, status, messageRefus) => {
        if (!onStatusChange) {
            return;
        }
        onStatusChange({
            cvExiste: existe,
            status: status || null,
            messageRefus: messageRefus || null,
            openUpload: () => setAfficherUploadModal(true)
        });
    };

    const chargerStatut = async () => {
        try {
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            const statut = await getStatutCv(authHeader);
            const existe = Boolean(statut && statut.hasCv);
            const status = statut ? statut.status : null;
            const messageRefus = statut ? statut.messageRefus : null;
            setCvStatut(statut);
            setCvExiste(existe);
            notifierChangementStatut(existe, status, messageRefus);
        } catch {
            try {
                const exists = await checkCvExists();
                setCvExiste(exists);
                notifierChangementStatut(exists, null, null);
            } catch {
                setErreur(t("modal_cv.error_check"));
                setCvExiste(false);
                notifierChangementStatut(false, null, null);
            }
        }
    };

    useEffect(() => {
        void chargerStatut();
    }, [authService]);

    const status = cvStatut ? cvStatut.status : null;
    const messageRefus = cvStatut ? cvStatut.messageRefus : null;

    if (compact) {
        return (
            <>
                {cvExiste === false && (
                    <button
                        type="button"
                        onClick={() => setAfficherUploadModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                    >
                        <UploadCloud className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{t("etudiant_dashboard.cv_pill.missing")}</span>
                        <span className="text-amber-400">•</span>
                        <span className="underline font-bold">{t("etudiant_dashboard.cv_pill.upload")}</span>
                    </button>
                )}

                {cvExiste && status === "REFUSE" && (
                    <button
                        type="button"
                        onClick={() => setAfficherUploadModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition cursor-pointer shadow-2xs"
                    >
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{t("etudiant_dashboard.cv_pill.refused")}</span>
                        <span className="text-rose-300">•</span>
                        <span className="underline font-bold">{t("etudiant_dashboard.cv_pill.replace")}</span>
                    </button>
                )}

                {cvExiste && status === "EN_ATTENTE" && (
                    <button
                        type="button"
                        onClick={() => setAfficherUploadModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50/80 text-blue-800 border border-blue-200 hover:bg-blue-100/80 transition cursor-pointer"
                    >
                        <Clock3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{t("etudiant_dashboard.cv_pill.pending")}</span>
                        <span className="text-blue-300">•</span>
                        <span className="text-blue-600 hover:underline">{t("etudiant_dashboard.cv_pill.replace")}</span>
                    </button>
                )}

                {cvExiste && status === "ACCEPTE" && (
                    <button
                        type="button"
                        onClick={() => setAfficherUploadModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-800 font-bold">{t("etudiant_dashboard.cv_pill.validated")}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 hover:text-slate-900">{t("etudiant_dashboard.cv_pill.replace")}</span>
                    </button>
                )}

                {afficherUploadModal && (
                    <div
                        className="ds-modal-backdrop"
                        onClick={() => setAfficherUploadModal(false)}
                    >
                        <div
                            className="ds-modal-panel max-w-lg p-6 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-base font-bold text-slate-900">
                                    {cvExiste ? t("modal_cv.update") : t("modal_cv.upload")}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setAfficherUploadModal(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    void chargerStatut();
                                }}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="w-full">
            {erreur && (
                <div className="ds-alert-error mb-4">
                    {erreur}
                </div>
            )}

            {cvExiste === null && !erreur && (
                <div className="p-4 text-center text-sm text-slate-500">
                    {t("modal_cv.loading")}
                </div>
            )}

            {cvExiste === false && (
                <div className="ds-card p-5 border-amber-200 bg-amber-50/40">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-base font-bold text-slate-900">
                                    {t("modal_cv.no_cv_title")}
                                </h3>
                                <p className="text-xs text-amber-800 font-medium">
                                    {t("modal_cv.no_cv_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAfficherUploadModal(true)}
                            className="btn-primary bg-amber-600 hover:bg-amber-700 text-xs py-2 px-4 shrink-0"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>{t("modal_cv.upload")}</span>
                        </button>
                    </div>
                    {afficherUploadModal && (
                        <div className="pt-4">
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    void chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "EN_ATTENTE" && (
                <div className="ds-card p-5 border-blue-200 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock3 className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {t("modal_cv.pending_badge")}
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    {t("modal_cv.cv_uploaded")}
                                </h3>
                                <p className="text-xs text-slate-600">
                                    {t("modal_cv.pending_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAfficherUploadModal(true)}
                            className="btn-outline text-xs py-2 px-4 shrink-0"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>{t("modal_cv.update")}</span>
                        </button>
                    </div>

                    {afficherUploadModal && (
                        <div className="pt-4">
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    void chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "ACCEPTE" && (
                <div className="ds-card p-4 border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {t("modal_cv.approved_title")}
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                        {t("modal_cv.approved_badge")}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {t("modal_cv.approved_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAfficherUploadModal(true)}
                            className="btn-secondary text-xs py-2 px-3.5 shrink-0"
                        >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{t("modal_cv.update")}</span>
                        </button>
                    </div>

                    {afficherUploadModal && (
                        <div className="pt-3">
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    void chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "REFUSE" && (
                <div className="ds-card p-5 border-rose-200 bg-rose-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                                    {t("modal_cv.refused_badge")}
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    {t("modal_cv.refused_title")}
                                </h3>
                                <p className="text-xs text-rose-700 font-semibold">
                                    {messageRefus
                                        ? t("modal_cv.refused_motif", { motif: messageRefus })
                                        : t("modal_cv.refused_no_motif")}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAfficherUploadModal(true)}
                            className="btn-danger text-xs py-2 px-4 shrink-0"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>{t("modal_cv.upload_corrected_title")}</span>
                        </button>
                    </div>

                    {afficherUploadModal && (
                        <div className="pt-4">
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    void chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
