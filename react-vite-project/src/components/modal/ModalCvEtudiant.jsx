import ModalTeleverserCv from "./ModalTeleverserCv.jsx";
import { useEffect, useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStatutCv } from "../../services/api/EtudiantService.js";
import { checkCvExists } from "../../services/api/EtudiantCvService.js";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock3, XCircle, UploadCloud, FileText } from "lucide-react";

export default function ModalCvEtudiant() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [cvStatut, setCvStatut] = useState(null);
    const [cvExiste, setCvExiste] = useState(null);
    const [erreur, setErreur] = useState(null);
    const [afficherUploadModal, setAfficherUploadModal] = useState(false);

    const chargerStatut = async () => {
        try {
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            const statut = await getStatutCv(authHeader);
            setCvStatut(statut);
            setCvExiste(Boolean(statut?.hasCv));
        } catch (error) {
            try {
                const exists = await checkCvExists();
                setCvExiste(exists);
            } catch (e) {
                setErreur("Une erreur est survenue lors de la vérification du CV");
                setCvExiste(false);
            }
        }
    };

    useEffect(() => {
        chargerStatut();
    }, [authService]);

    const status = cvStatut?.status;

    return (
        <div className="w-full">
            {erreur && (
                <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-xl text-sm mb-4">
                    {erreur}
                </div>
            )}

            {cvExiste === null && !erreur && (
                <div className="p-6 text-center text-sm text-slate-500">
                    {t("modal_cv.loading")}
                </div>
            )}

            {cvExiste === false && (
                <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t("modal_cv.no_cv_title")}
                                </h3>
                                <p className="text-sm text-amber-700 font-medium">
                                    {t("modal_cv.no_cv_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAfficherUploadModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-xs transition shrink-0 cursor-pointer"
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
                                    chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "EN_ATTENTE" && (
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock3 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {t("modal_cv.pending_badge")}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t("modal_cv.cv_uploaded")}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {t("modal_cv.pending_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAfficherUploadModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-sm rounded-xl transition shrink-0 cursor-pointer"
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
                                    chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "ACCEPTE" && (
                <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
                                    {t("modal_cv.approved_badge")}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t("modal_cv.approved_title")}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {t("modal_cv.approved_desc")}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAfficherUploadModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition shrink-0 cursor-pointer"
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
                                    chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {cvExiste && status === "REFUSE" && (
                <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 w-full">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                {t("modal_cv.refused_badge")}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">
                                {t("modal_cv.refused_title")}
                            </h3>
                            <p className="text-sm text-red-700 font-medium">
                                {cvStatut?.messageRefus
                                    ? t("modal_cv.refused_motif", { motif: cvStatut.messageRefus })
                                    : t("modal_cv.refused_no_motif")}
                            </p>
                            <div className="pt-3">
                                <button
                                    onClick={() => setAfficherUploadModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    <span>{t("modal_cv.upload_corrected_title")}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {afficherUploadModal && (
                        <div className="pt-4">
                            <ModalTeleverserCv
                                onClose={() => setAfficherUploadModal(false)}
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    chargerStatut();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}