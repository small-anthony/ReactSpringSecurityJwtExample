import { X, XCircle, Building2, MapPin, Phone, DollarSign, Calendar, GraduationCap, FileText, CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useContext } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { postuler } from "../../services/api/OffreStageService.js";
import { choisirStageEtGenererContrat } from "../../services/api/ContratAPI.js";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";
import ModalConfirmerChoixStage from "./ModalConfirmerChoixStage.jsx";

const MESSAGE_OFFRE_SUPPRIMEE = "L'offre a été supprimée par l'employeur";
const MESSAGE_AUTRE_STAGE_CHOISI = "L'étudiant a choisi une autre offre de stage.";

function extraireCandidatureOffre(offre, candidatureExterne) {
    if (candidatureExterne) {
        return candidatureExterne;
    }
    if (!offre) {
        return null;
    }
    const { candidature, candidatures } = offre;
    if (candidature) {
        return candidature;
    }
    if (Array.isArray(candidatures) && candidatures.length > 0) {
        return candidatures[0];
    }
    return null;
}

function extraireStatutCandidature(candidature) {
    if (!candidature) {
        return null;
    }
    return candidature.statut || candidature.status || null;
}

export default function ModalDetailOffre({
    offre,
    onClose,
    aPostule,
    onPostulerSucces,
    onChoisirStageSucces,
    aDejaStageChoisi = false,
    candidature,
    contrats = []
}) {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline, formaterSalaire } = useOffreFormater();
    const [isApplying, setIsApplying] = useState(false);
    const [isChoosingStage, setIsChoosingStage] = useState(false);
    const [confirmChoixOpen, setConfirmChoixOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(aPostule);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const cand = extraireCandidatureOffre(offre, candidature);
    const statutCand = extraireStatutCandidature(cand);
    const messageReponse = cand ? cand.messageReponse : null;
    const idOffre = offre ? offre.id : null;
    const contratAssocie = contrats.find(
        (c) => c.offreId === idOffre || String(c.offreId) === String(idOffre)
    );
    const aRefuseContrat = Boolean(contratAssocie && contratAssocie.statut === "REFUSE");
    const estRefusee = statutCand === "REFUSEE" && !aRefuseContrat;
    const aSigneContrat = Boolean(
        contratAssocie &&
        (contratAssocie.signeParEtudiant || contratAssocie.statut === "COMPLETE") &&
        !aRefuseContrat
    );
    const estRetenueSansSignature = ["EN_ATTENTE_CHOIX_STAGE", "EN_ATTENTE_SIGNATURE", "EMBAUCHEE"].includes(statutCand) && !aSigneContrat && !aRefuseContrat;
    const peutChoisirStage = statutCand === "EN_ATTENTE_CHOIX_STAGE" && !contratAssocie && !aDejaStageChoisi && Boolean(cand && cand.id);

    useEffect(() => {
        setHasApplied(aPostule);
    }, [aPostule]);

    useEffect(() => {
        setErrorMessage("");
        setSuccessMessage("");
        setConfirmChoixOpen(false);
    }, [idOffre]);

    if (!offre) return null;

    const { titre, nomEntreprise, discipline, salaire, exigences, description, adresse, ville, codePostal, telephone, dateDebut, dateFin } = offre;
    const adresseComplete = [adresse, ville, codePostal].filter(Boolean).join(", ");
    const periodeStage = dateDebut && dateFin
        ? `${dateDebut} → ${dateFin}`
        : dateDebut || dateFin || null;

    const handlePostuler = async () => {
        try {
            setIsApplying(true);
            setErrorMessage("");
            setSuccessMessage("");

            const authHeader = authService.buildAuthHeader();
            await postuler(authHeader, idOffre);

            setHasApplied(true);
            setSuccessMessage(t("offres_etudiant.modal.apply_success"));
            if (onPostulerSucces) {
                onPostulerSucces(idOffre);
            }
        } catch (err) {
            const msg = (err && err.message) || t("offres_etudiant.modal.apply_error");
            const msgMin = msg.toLowerCase();
            if (msgMin.includes("déjà postulé") || msgMin.includes("deja postule")) {
                setHasApplied(true);
                if (onPostulerSucces) {
                    onPostulerSucces(idOffre);
                }
            }
            setErrorMessage(msg);
        } finally {
            setIsApplying(false);
        }
    };

    const handleChoisirStage = async () => {
        if (!cand || !cand.id) return;
        try {
            setIsChoosingStage(true);
            setErrorMessage("");
            const authHeader = authService.buildAuthHeader();
            const contrat = await choisirStageEtGenererContrat(cand.id, authHeader);
            setConfirmChoixOpen(false);
            if (onChoisirStageSucces) {
                await onChoisirStageSucces(contrat);
            }
        } catch (err) {
            setConfirmChoixOpen(false);
            setErrorMessage((err && err.message) || t("candidature_etudiant.choose_stage_error"));
        } finally {
            setIsChoosingStage(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-start gap-3 bg-[#F8FAFC]">
                    <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] mb-2.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" strokeWidth={1.5} />
                            <span>{t("offres_etudiant.modal.validated_badge")}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-snug break-words">
                            {titre}
                        </h2>
                        <p className="text-sm font-medium text-[#4B5563] flex items-center gap-1.5 mt-1 min-w-0">
                            <Building2 className="w-4 h-4 text-[#64748B] shrink-0" strokeWidth={1.5} />
                            <span className="break-words">{nomEntreprise}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        title={t("offres_etudiant.modal.close")}
                        aria-label={t("offres_etudiant.modal.close")}
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                {aRefuseContrat && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm flex items-center gap-2.5">
                        <XCircle className="w-5 h-5 text-slate-500 shrink-0" strokeWidth={1.5} />
                        <span className="font-semibold">{t("contrats_etudiant.status_refused")}</span>
                    </div>
                )}

                {aSigneContrat && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-semibold">
                            {t("contrats_etudiant.status_stage_trouve")} — {t("candidature_etudiant.status.EMBAUCHEE")}
                        </span>
                    </div>
                )}

                {estRetenueSansSignature && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-semibold">
                            {peutChoisirStage
                                ? t("candidature_etudiant.choose_stage_notice")
                                : contratAssocie
                                    ? t("candidature_etudiant.status_contract_pending_signature")
                                    : statutCand === "EN_ATTENTE_CHOIX_STAGE" && aDejaStageChoisi
                                        ? t("candidature_etudiant.other_contract_pending_notice")
                                        : t("candidature_etudiant.status_selected_waiting_contract")}
                        </span>
                    </div>
                )}

                {estRefusee && messageReponse === MESSAGE_AUTRE_STAGE_CHOISI && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm">
                        <div className="flex items-center gap-2 mb-1 font-semibold text-slate-900">
                            <XCircle className="w-5 h-5 text-slate-500 shrink-0" strokeWidth={1.5} />
                            <span>{t("candidature_etudiant.other_stage_chosen_title")}</span>
                        </div>
                        <p className="text-slate-600 pl-7 leading-relaxed">
                            {t("candidature_etudiant.other_stage_chosen_desc")}
                        </p>
                    </div>
                )}

                {estRefusee && messageReponse !== MESSAGE_AUTRE_STAGE_CHOISI && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                        {messageReponse === MESSAGE_OFFRE_SUPPRIMEE ? (
                            <div className="flex items-center gap-2 font-semibold text-red-900">
                                <XCircle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
                                <span>{t("candidature_etudiant.offer_deleted")}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-1.5 font-semibold text-red-900">
                                    <XCircle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
                                    <span>{t("candidature_etudiant.modal_refused_title")}</span>
                                </div>
                                <div className="text-red-700 pl-7 leading-relaxed">
                                    {messageReponse ? (
                                        <p>
                                            <span className="font-semibold text-red-800">
                                                {t("candidature_etudiant.refuse_reason")} :{" "}
                                            </span>
                                            {messageReponse}
                                        </p>
                                    ) : (
                                        <p>{t("candidature_etudiant.modal_refused_no_reason")}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {successMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-3">
                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <GraduationCap className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.discipline")}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug whitespace-normal break-words">
                                {discipline ? traduireDiscipline(discipline) : t("offres_etudiant.modal.not_specified")}
                            </p>
                        </div>

                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <Calendar className="w-4 h-4 text-[#059669] shrink-0" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.dates")}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug break-words">
                                {periodeStage || t("offres_etudiant.modal.not_specified")}
                            </p>
                        </div>

                        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col justify-between min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                <DollarSign className="w-4 h-4 text-[#D97706] shrink-0" strokeWidth={1.5} />
                                <span>{t("offres_etudiant.modal.salary")}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] leading-snug break-words">
                                {formaterSalaire(salaire)}
                            </p>
                        </div>
                    </div>

                    {(adresseComplete || telephone) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {adresseComplete && (
                                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                        <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" strokeWidth={1.5} />
                                        <span>{t("offres_etudiant.modal.address")}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#111827] leading-snug break-words">
                                        {adresseComplete}
                                    </p>
                                </div>
                            )}
                            {telephone && (
                                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] mb-1.5">
                                        <Phone className="w-4 h-4 text-[#059669] shrink-0" strokeWidth={1.5} />
                                        <span>{t("offres_etudiant.modal.phone")}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#111827] leading-snug break-words">
                                        {telephone}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {exigences && (
                        <div className="bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB] rounded-r-xl p-4">
                            <h3 className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">
                                {t("offres_etudiant.modal.requirements")}
                            </h3>
                            <p className="text-sm text-[#1E3A8A] whitespace-pre-line leading-relaxed break-words">
                                {exigences}
                            </p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#2563EB]" strokeWidth={1.5} />
                            <span>{t("offres_etudiant.modal.description")}</span>
                        </h3>
                        <div className="text-sm text-[#4B5563] whitespace-pre-line leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] break-words">
                            {description || t("offres_etudiant.modal.no_description")}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        {t("offres_etudiant.modal.close")}
                    </button>

                    {peutChoisirStage && (
                        <button
                            type="button"
                            id="btn-choisir-stage-modal"
                            onClick={() => setConfirmChoixOpen(true)}
                            disabled={isChoosingStage}
                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 px-6"
                        >
                            {isChoosingStage ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                    <span>{t("candidature_etudiant.choosing_stage")}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                                    <span>{t("candidature_etudiant.btn_choose_stage")}</span>
                                </>
                            )}
                        </button>
                    )}

                    {!hasApplied && !estRefusee && !estRetenueSansSignature && !aSigneContrat && !aRefuseContrat && !aDejaStageChoisi && (
                        <button
                            type="button"
                            onClick={handlePostuler}
                            disabled={isApplying}
                            className="btn-primary px-6"
                        >
                            {isApplying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                                    <span>{t("offres_etudiant.modal.applying")}</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" strokeWidth={1.5} />
                                    <span>{t("offres_etudiant.modal.btn_apply")}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <ModalConfirmerChoixStage
                isOpen={confirmChoixOpen}
                offre={offre}
                onClose={() => !isChoosingStage && setConfirmChoixOpen(false)}
                onConfirm={handleChoisirStage}
                loading={isChoosingStage}
            />
        </div>
    );
}
