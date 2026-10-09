import CvUploadModal from "../modal/CvUploadModal.jsx";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStatutCv } from "../../services/api/EtudiantService.js";
import { checkCvExists } from "../../services/api/CvEtudiantAPI.jsx";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock3, XCircle, ArrowRight, Briefcase, UploadCloud } from "lucide-react";

export default function EtudiantProfile() {
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

    if (cvExiste === null && !erreur) {
        return <div className="p-8 text-center text-slate-500">{t("etudiant_profile.loading")}</div>;
    }

    const status = cvStatut?.status;

    return (
        <div className="max-h-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {t("etudiant_profile.title")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("etudiant_profile.subtitle")}
                    </p>
                </div>

                {erreur && (
                    <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-xl">
                        {erreur}
                    </div>
                )}

                {!cvExiste && (
                    <div className="space-y-4">
                        <CvUploadModal
                            onUploadSuccess={() => {
                                chargerStatut();
                            }}
                        />
                    </div>
                )}

                {cvExiste && status === "EN_ATTENTE" && (
                    <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-xs space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock3 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                    {t("etudiant_profile.pending_badge")}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {t("etudiant_profile.cv_uploaded")}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {t("etudiant_profile.pending_desc")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {cvExiste && status === "ACCEPTE" && (
                    <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
                                        {t("etudiant_profile.approved_badge")}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {t("etudiant_profile.approved_title")}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t("etudiant_profile.approved_desc")}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/etudiant/offres"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>{t("etudiant_profile.btn_view_offers")}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>{t("etudiant_profile.update_help")}</span>
                            <button
                                onClick={() => setAfficherUploadModal(!afficherUploadModal)}
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>{afficherUploadModal ? t("etudiant_profile.btn_hide_upload") : t("etudiant_profile.btn_show_upload")}</span>
                            </button>
                        </div>

                        {afficherUploadModal && (
                            <div className="pt-2">
                                <CvUploadModal
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
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-3">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1 w-full">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        {t("etudiant_profile.refused_badge")}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {t("etudiant_profile.refused_title")}
                                    </h3>
                                    <p className="text-sm text-red-700 font-medium">
                                        {cvStatut?.messageRefus
                                            ? t("etudiant_profile.refused_motif", { motif: cvStatut.messageRefus })
                                            : t("etudiant_profile.refused_no_motif")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {t("etudiant_profile.refused_desc")}
                                    </p>

                                    <div className="pt-4 mt-2">
                                        <button
                                            onClick={() => setAfficherUploadModal(true)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>{t("etudiant_profile.upload_corrected_title")}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {afficherUploadModal && (
                            <CvUploadModal
                                onUploadSuccess={() => {
                                    setAfficherUploadModal(false);
                                    chargerStatut();
                                }}
                            />
                        )}
                    </div>
                )}

                {cvExiste && !status && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                        <h2 className="text-xl font-semibold mb-2">{t("etudiant_profile.cv_uploaded")}</h2>
                        <p className="text-sm text-gray-600">
                            {t("etudiant_profile.registered_desc")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}