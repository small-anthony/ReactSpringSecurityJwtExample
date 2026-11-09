import React, { useState, useEffect, useContext } from "react";
import {
    FileText,
    Clock,
    Download,
    Briefcase,
    Calendar,
    DollarSign,
    Eye,
    Check,
    PenTool,
    CheckCircle2,
    AlertCircle,
    XCircle,
    MapPin
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getContratsEtudiant,
    getContratDocumentBlob,
    rejeterContrat
} from "../../services/api/ContratAPI.js";
import ModalSignaturePad from "../modal/ModalSignaturePad.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";

export default function EtudiantContrats({ embedMode, onPendingCountChange }) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [succes, setSucces] = useState(null);
    const [messageRefus, setMessageRefus] = useState(null);
    const [filtre, setFiltre] = useState("TOUS");
    const [signingContrat, setSigningContrat] = useState(null);
    const [contratARefuser, setContratARefuser] = useState(null);
    const [refusSubmitting, setRefusSubmitting] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    const authHeader = authService.buildAuthHeader();

    const chargerContrats = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const data = await getContratsEtudiant(authHeader);
            const liste = data || [];
            setContrats(liste);

            const aSignerCount = liste.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE").length;
            const hasSigned = liste.some((c) => c.signeParEtudiant);
            if (onPendingCountChange) {
                onPendingCountChange(aSignerCount, hasSigned);
            }
        } catch (e) {
            setErreur(e.message || t("contrats.alerts.error_load"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerContrats();
    }, []);

    const handleVoirDocument = async (contratId) => {
        try {
            const currentHeader = authService.buildAuthHeader();
            const blob = await getContratDocumentBlob(contratId, currentHeader);
            const pdfBlob = new Blob([blob], { type: "application/pdf" });
            if (previewDoc?.url) {
                window.URL.revokeObjectURL(previewDoc.url);
            }
            const url = window.URL.createObjectURL(pdfBlob);
            setPreviewDoc({
                url,
                titre: `${t("contrats.actions.contract_number")}${contratId} — ${t("contrats_etudiant.title")}`,
            });
        } catch {
            setErreur(t("contrats.alerts.error_open"));
        }
    };

    const handleTelechargerDocument = async (contratId) => {
        try {
            const currentHeader = authService.buildAuthHeader();
            const blob = await getContratDocumentBlob(contratId, currentHeader);
            const pdfBlob = new Blob([blob], { type: "application/pdf" });
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `contrat-stage-${contratId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            setErreur(t("contrats.alerts.error_download"));
        }
    };

    const handleSignatureSuccess = (updatedContrat) => {
        setSucces(t("contrats_etudiant.success_signed"));
        setMessageRefus(null);
        const updated = contrats.map((c) => (c.id === updatedContrat.id ? updatedContrat : c));
        setContrats(updated);
        if (onPendingCountChange) {
            const restant = updated.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE").length;
            const hasSigned = updated.some((c) => c.signeParEtudiant);
            onPendingCountChange(restant, hasSigned, updatedContrat);
        }
    };

    const handleConfirmRefus = async () => {
        if (!contratARefuser) return;
        try {
            setRefusSubmitting(true);
            setErreur(null);
            const currentHeader = authService.buildAuthHeader();
            await rejeterContrat(contratARefuser.id, currentHeader);
            setMessageRefus(t("contrats_etudiant.success_refused"));
            setSucces(null);
            const updated = contrats.map((c) => (c.id === contratARefuser.id ? { ...c, statut: "REFUSE" } : c));
            setContrats(updated);
            if (onPendingCountChange) {
                const restant = updated.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE").length;
                const hasSigned = updated.some((c) => c.signeParEtudiant);
                const contratRefuse = updated.find((c) => c.id === contratARefuser.id);
                onPendingCountChange(restant, hasSigned, contratRefuse);
            }
            setContratARefuser(null);
        } catch (err) {
            setErreur(err.message || t("contrats_etudiant.error_refuse"));
            setContratARefuser(null);
        } finally {
            setRefusSubmitting(false);
        }
    };

    const fermerPreviewDoc = () => {
        if (previewDoc?.url) {
            window.URL.revokeObjectURL(previewDoc.url);
        }
        setPreviewDoc(null);
    };

    const getStatusBadge = (c) => {
        if (c.statut === "REFUSE") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    {t("contrats_etudiant.status_refused")}
                </span>
            );
        }
        if (c.signeParEtudiant) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {t("contrats_etudiant.status_stage_trouve")}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {t("contrats_etudiant.waiting_signature_badge")}
            </span>
        );
    };

    const contratsFiltres = contrats.filter((c) => {
        if (filtre === "A_SIGNER") return !c.signeParEtudiant && c.statut !== "REFUSE";
        if (filtre === "SIGNES") return c.signeParEtudiant;
        if (filtre === "REFUSES") return c.statut === "REFUSE";
        return true;
    });

    const countASigner = contrats.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE").length;
    const countSignes = contrats.filter((c) => c.signeParEtudiant).length;
    const countRefuses = contrats.filter((c) => c.statut === "REFUSE").length;

    const content = (
        <div className={embedMode ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}>
            {!embedMode && (
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] mb-3">
                        <FileText className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={1.5} />
                        <span>{t("contrats_etudiant.badge")}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight sm:text-4xl">
                        {t("contrats_etudiant.title")}
                    </h1>
                    <p className="mt-2 text-base text-[#4B5563] max-w-2xl">
                        {t("contrats_etudiant.subtitle")}
                    </p>
                </div>
            )}

            {erreur && (
                <div className="p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-xl shadow-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="text-sm font-semibold">{erreur}</span>
                </div>
            )}

            {succes && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded-xl shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="text-sm font-semibold">{succes}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSucces(null)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                    >
                        {t("contrats.actions.close")}
                    </button>
                </div>
            )}

            {messageRefus && (
                <div className="p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-xl shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="text-sm font-semibold">{messageRefus}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMessageRefus(null)}
                        className="text-xs text-rose-700 hover:text-rose-900 font-semibold cursor-pointer underline"
                    >
                        {t("contrats.actions.close")}
                    </button>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        id="filter-contrats-tous"
                        onClick={() => setFiltre("TOUS")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            filtre === "TOUS"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        {t("contrats_etudiant.tab_all")} ({contrats.length})
                    </button>

                    <button
                        type="button"
                        id="filter-contrats-a-signer"
                        onClick={() => setFiltre("A_SIGNER")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                            filtre === "A_SIGNER"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t("contrats_etudiant.tab_to_sign")} ({countASigner})</span>
                    </button>

                    <button
                        type="button"
                        id="filter-contrats-signes"
                        onClick={() => setFiltre("SIGNES")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                            filtre === "SIGNES"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                        }`}
                    >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t("contrats_etudiant.tab_signed")} ({countSignes})</span>
                    </button>

                    {countRefuses > 0 && (
                        <button
                            type="button"
                            id="filter-contrats-refuses"
                            onClick={() => setFiltre("REFUSES")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                                filtre === "REFUSES"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t("contrats_etudiant.status_refused")} ({countRefuses})</span>
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-500">
                        {t("offres_etudiant.loading")}
                    </p>
                </div>
            )}

            {!loading && contratsFiltres.length === 0 && (
                <div className="text-center bg-white rounded-2xl shadow-xs border border-gray-200 p-16 space-y-3">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-800">
                        {t("contrats_etudiant.no_contracts")}
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        {t("contrats_etudiant.no_contracts_desc")}
                    </p>
                </div>
            )}

            {!loading && contratsFiltres.length > 0 && (
                <div className="grid gap-6">
                    {contratsFiltres.map((c) => (
                        <article
                            key={c.id}
                            className="relative p-6 sm:p-7 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow"
                        >
                            <div className="sm:absolute sm:top-7 sm:right-7 mb-4 sm:mb-0">
                                {getStatusBadge(c)}
                            </div>

                            <div className="mb-4 sm:pr-48">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {c.titreOffre}
                                </h3>
                                <p className="text-blue-600 font-semibold flex items-center gap-1.5 flex-wrap text-sm">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{c.nomEntreprise}</span>
                                    {c.lieu && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-600 flex items-center gap-1 font-normal">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                {c.lieu}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                <div className="flex items-start gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                            {t("contrats.table.dates")}
                                        </span>
                                        <span className="text-gray-800 text-xs font-semibold">
                                            {c.dateDebut} → {c.dateFin}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                            {t("contrats.table.salary")}
                                        </span>
                                        <span className="text-emerald-700 text-xs font-bold">
                                            {c.salaire}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                            {t("contrats.form.horaire")}
                                        </span>
                                        <span className="text-gray-800 text-xs font-semibold">
                                            {c.horaire}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {c.description && (
                                <div className="mb-5 p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 text-xs text-gray-600">
                                    <span className="font-bold text-gray-700 block mb-1">
                                        {t("contrats_etudiant.responsibilities")}
                                    </span>
                                    <p className="line-clamp-2 leading-relaxed">{c.description}</p>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        id={`btn-voir-contrat-${c.id}`}
                                        onClick={() => handleVoirDocument(c.id)}
                                        className="btn-outline py-2 px-3.5 text-xs"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{t("contrats_etudiant.view_button")}</span>
                                    </button>

                                    <button
                                        type="button"
                                        id={`btn-telecharger-contrat-${c.id}`}
                                        onClick={() => handleTelechargerDocument(c.id)}
                                        className="btn-secondary py-2 px-3.5 text-xs"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>{t("contrats_etudiant.download_button")}</span>
                                    </button>
                                </div>

                                {c.statut === "REFUSE" ? (
                                    <div className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-3.5 py-2 rounded-lg text-xs font-bold border border-red-200">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span>{t("contrats_etudiant.refused_badge_text")}</span>
                                    </div>
                                ) : !c.signeParEtudiant ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            id={`btn-refuser-contrat-${c.id}`}
                                            onClick={() => setContratARefuser(c)}
                                            className="btn-danger-soft py-2 px-4 text-xs"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            <span>{t("contrats_etudiant.refuse_button")}</span>
                                        </button>

                                        <button
                                            type="button"
                                            id={`btn-signer-contrat-${c.id}`}
                                            onClick={() => setSigningContrat(c)}
                                            className="btn-primary py-2.5 px-5"
                                        >
                                            <PenTool className="w-4 h-4" />
                                            <span>{t("contrats_etudiant.sign_button")}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg text-xs font-bold border border-emerald-200">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>{t("contrats_etudiant.already_signed_badge")}</span>
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {signingContrat && (
                <ModalSignaturePad
                    isOpen={!!signingContrat}
                    onClose={() => setSigningContrat(null)}
                    contrat={signingContrat}
                    onSuccess={handleSignatureSuccess}
                    authHeader={authService.buildAuthHeader()}
                />
            )}

            {contratARefuser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-6 space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {t("contrats_etudiant.modal_refuse_title")}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {contratARefuser.titreOffre} — {contratARefuser.nomEntreprise}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            {t("contrats_etudiant.modal_refuse_desc")}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setContratARefuser(null)}
                                disabled={refusSubmitting}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                            >
                                {t("contrats.actions.cancel")}
                            </button>
                            <button
                                type="button"
                                id="btn-confirm-refus"
                                onClick={handleConfirmRefus}
                                disabled={refusSubmitting}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            >
                                {refusSubmitting ? (
                                    <span>{t("contrats.actions.processing")}</span>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        <span>{t("contrats_etudiant.confirm_refuse")}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewDoc && (
                <ModalCvPdf
                    pdfUrl={previewDoc.url}
                    onClose={fermerPreviewDoc}
                    titre={previewDoc.titre}
                />
            )}
        </div>
    );

    if (embedMode) {
        return content;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            {content}
        </div>
    );
}
