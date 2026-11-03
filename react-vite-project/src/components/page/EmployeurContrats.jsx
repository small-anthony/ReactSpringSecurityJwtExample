import React, { useState, useEffect, useContext } from "react";
import {
    FileText,
    Clock,
    Download,
    Briefcase,
    Calendar,
    DollarSign,
    Eye,
    PenTool,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Building2,
    GraduationCap,
    Check
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getContratsEmployeur,
    getContratDocumentBlob,
    rejeterContrat
} from "../../services/api/ContratAPI.js";
import ModalSignaturePad from "../modal/ModalSignaturePad.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";

export default function EmployeurContrats() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [succes, setSucces] = useState(null);
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
            const data = await getContratsEmployeur(authHeader);
            setContrats(data || []);
        } catch (e) {
            setErreur(e.message || t("contrats.alerts.error_load", { defaultValue: "Erreur lors du chargement des contrats" }));
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
                titre: `${t("contrats.actions.contract_number", { defaultValue: "Contrat #" })}${contratId} — ${t("contrats_employeur.title", { defaultValue: "Entente de stage" })}`,
            });
        } catch {
            setErreur(t("contrats.alerts.error_open", { defaultValue: "Erreur lors de l'ouverture du document du contrat." }));
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
            setErreur(t("contrats.alerts.error_download", { defaultValue: "Erreur lors du téléchargement du contrat." }));
        }
    };

    const handleSignatureSuccess = (updatedContrat) => {
        setSucces(t("contrats_employeur.alerts.success_signed", { defaultValue: "Le contrat de stage a été signé avec succès !" }));
        setContrats((prev) => prev.map((c) => (c.id === updatedContrat.id ? updatedContrat : c)));
    };

    const handleConfirmRefus = async () => {
        if (!contratARefuser) return;
        try {
            setRefusSubmitting(true);
            setErreur(null);
            const currentHeader = authService.buildAuthHeader();
            await rejeterContrat(contratARefuser.id, currentHeader);
            setSucces(t("contrats_employeur.alerts.success_refused", {
                defaultValue: "Vous avez refusé cette entente de stage. Le gestionnaire en a été notifié.",
            }));
            setContrats((prev) =>
                prev.map((c) => (c.id === contratARefuser.id ? { ...c, statut: "REFUSE" } : c))
            );
            setContratARefuser(null);
        } catch (e) {
            setErreur(e.message || t("contrats_employeur.alerts.error_refuse", { defaultValue: "Impossible de refuser le contrat." }));
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

    const aSignerCount = contrats.filter((c) => !c.signeParEmployeur && c.statut !== "REFUSE").length;
    const signesCount = contrats.filter((c) => c.signeParEmployeur).length;

    const contratsFiltres = contrats.filter((c) => {
        if (filtre === "A_SIGNER") return !c.signeParEmployeur && c.statut !== "REFUSE";
        if (filtre === "SIGNES") return c.signeParEmployeur;
        return true;
    });

    const getStatusBadge = (contrat) => {
        if (contrat.statut === "REFUSE") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    {t("contrats.status.REFUSE", { defaultValue: "Refusé" })}
                </span>
            );
        }
        if (contrat.statut === "COMPLETE") {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t("contrats.status.COMPLETE", { defaultValue: "Complété (signé par tous)" })}
                </span>
            );
        }
        if (contrat.signeParEmployeur) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {t("contrats.status.SIGNE_PAR_EMPLOYEUR", { defaultValue: "Signé par l'employeur" })}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {t("contrats_employeur.actions.awaiting_signature", { defaultValue: "En attente de votre signature" })}
            </span>
        );
    };

    const renderSignaturePill = (label, signe) => (
        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200/80 text-xs">
            <span className="font-semibold text-gray-700">{label} :</span>
            {signe ? (
                <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-600" /> {t("contrats.signatures.signed", { defaultValue: "Signé" })}
                </span>
            ) : (
                <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> {t("contrats.signatures.waiting", { defaultValue: "En attente" })}
                </span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t("contrats_employeur.title", { defaultValue: "Contrats de stage" })}</h1>
                    <p className="text-gray-500 mt-1">
                        {t("contrats_employeur.subtitle", {
                            defaultValue: "Consultez et signez les ententes de stage des candidats que vous avez embauchés.",
                        })}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 rounded-xl w-fit">
                    <button
                        type="button"
                        onClick={() => setFiltre("TOUS")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                            filtre === "TOUS"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {t("contrats_employeur.tabs.all", { defaultValue: "Tous mes contrats" })} ({contrats.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltre("A_SIGNER")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                            filtre === "A_SIGNER"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <Clock className="w-4 h-4 text-amber-500" />
                        {t("contrats_employeur.tabs.to_sign", { defaultValue: "À signer" })} ({aSignerCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFiltre("SIGNES")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                            filtre === "SIGNES"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <Check className="w-4 h-4 text-emerald-500" />
                        {t("contrats_employeur.tabs.signed", { defaultValue: "Signés" })} ({signesCount})
                    </button>
                </div>

                {erreur && (
                    <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl flex items-center justify-between text-sm shadow-xs">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{erreur}</span>
                        </div>
                        <button onClick={() => setErreur(null)} className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {succes && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl flex items-center justify-between text-sm shadow-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                            <span>{succes}</span>
                        </div>
                        <button onClick={() => setSucces(null)} className="text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 cursor-pointer">
                            ✕
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-500">
                            {t("common.loading", { defaultValue: "Chargement des contrats en cours..." })}
                        </p>
                    </div>
                ) : contratsFiltres.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800 mb-1">
                            {t("contrats_employeur.alerts.no_contracts", { defaultValue: "Aucun contrat de stage trouvé" })}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            {t("contrats_employeur.alerts.no_contracts_sub", {
                                defaultValue: "Votre gestionnaire de stage préparera les contrats dès qu'une embauche est confirmée.",
                            })}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {contratsFiltres.map((c) => (
                            <article
                                key={c.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-200 p-6 md:p-7 space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                                {c.etudiantPrenom} {c.etudiantNom}
                                            </h2>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {t("contrats.candidature_select.matricule", { defaultValue: "Matricule" })} : {c.etudiantMatricule}
                                            {c.etudiantEmail && ` • ${c.etudiantEmail}`}
                                        </p>
                                        <p className="text-sm text-blue-700 font-semibold flex items-center gap-1.5 pt-1">
                                            <Briefcase className="w-4 h-4 text-blue-500" />
                                            <span>{c.titreOffre}</span>
                                        </p>
                                    </div>
                                    <div>{getStatusBadge(c)}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {t("contrats.table.dates", { defaultValue: "Période" })}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-800">
                                                {c.dateDebut} → {c.dateFin}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {t("contrats.table.salary", { defaultValue: "Salaire" })}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-700">{c.salaire}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                {t("contrats.form.horaire", { defaultValue: "Horaire de travail" })}
                                            </span>
                                            <span className="text-xs font-medium text-gray-700 truncate">{c.horaire}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                                        {t("contrats.table.signatures", { defaultValue: "Progression des signatures" })}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {renderSignaturePill(t("contrats.signatures.student", { defaultValue: "Étudiant" }), c.signeParEtudiant)}
                                        {renderSignaturePill(t("contrats.signatures.employer", { defaultValue: "Employeur" }), c.signeParEmployeur)}
                                        {renderSignaturePill(t("contrats.signatures.manager", { defaultValue: "Gestionnaire" }), c.signeParGestionnaire)}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleVoirDocument(c.id)}
                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{t("contrats_employeur.actions.view", { defaultValue: "Consulter le contrat" })}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTelechargerDocument(c.id)}
                                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>{t("contrats_employeur.actions.download", { defaultValue: "Télécharger le PDF" })}</span>
                                        </button>
                                    </div>

                                    {!c.signeParEmployeur && c.statut !== "REFUSE" ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setContratARefuser(c)}
                                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer inline-flex items-center gap-1.5"
                                            >
                                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                <span>{t("contrats_employeur.actions.refuse", { defaultValue: "Refuser le contrat" })}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSigningContrat(c)}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                            >
                                                <PenTool className="w-3.5 h-3.5" />
                                                <span>{t("contrats_employeur.actions.sign", { defaultValue: "Signer le contrat" })}</span>
                                            </button>
                                        </div>
                                    ) : c.signeParEmployeur ? (
                                        <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg text-xs font-bold border border-emerald-200">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>{t("contrats_employeur.actions.already_signed", { defaultValue: "Vous avez signé ce contrat" })}</span>
                                        </div>
                                    ) : null}
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
                        roleLabel={t("contrats_employeur.role_label", { defaultValue: "L'employeur" })}
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
                                        {t("contrats_employeur.refuse_modal.title", { defaultValue: "Refuser le contrat de stage" })}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {contratARefuser.etudiantPrenom} {contratARefuser.etudiantNom} — {contratARefuser.titreOffre}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed">
                                {t("contrats_employeur.refuse_modal.desc", {
                                    defaultValue: "Êtes-vous certain de vouloir refuser de signer ce contrat de stage ? Cette action informera votre gestionnaire de stage et l'étudiant de votre refus.",
                                })}
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setContratARefuser(null)}
                                    disabled={refusSubmitting}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                >
                                    {t("contrats.actions.cancel", { defaultValue: "Annuler" })}
                                </button>
                                <button
                                    type="button"
                                    id="btn-confirm-refus-employeur"
                                    onClick={handleConfirmRefus}
                                    disabled={refusSubmitting}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                >
                                    {refusSubmitting ? (
                                        <span>{t("contrats.actions.processing", { defaultValue: "Traitement..." })}</span>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            <span>{t("contrats_employeur.refuse_modal.confirm", { defaultValue: "Confirmer le refus" })}</span>
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
        </div>
    );
}
