import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getCandidatures,
    getCvCandidat,
    refuserCandidature,
    embaucherCandidature,
} from "../../services/api/OffreStageService.js";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";
import ModalCreerConvocation from "../modal/ModalCreerConvocation.jsx";
import { proposeConvocation } from "../../services/api/ConvocationAPI.js";
import { DISCIPLINES } from "../../constants/disciplines.js";

const peutConvoquer = (candidature) => candidature.statut === "EN_ATTENTE";
const peutEmbaucher = (candidature) => candidature.statut === "ACCEPTEE";
const peutRefuser = (candidature) =>
    ["EN_ATTENTE", "EN_ATTENTE_REPONSE", "ACCEPTEE"].includes(candidature.statut);
const aUnBadge = (candidature) => candidature.statut !== "EN_ATTENTE";

const aConvocationRefusee = (candidat) => {
    if (candidat?.messageRefusConvocation !== null && candidat?.messageRefusConvocation !== undefined) {
        return true;
    }
    return Boolean(candidat?.convocations?.some((c) => c.statut === "REFUSEE"));
};

const getMotifRefusConvocation = (candidat) => {
    if (candidat?.messageRefusConvocation !== null && candidat?.messageRefusConvocation !== undefined) {
        return candidat.messageRefusConvocation;
    }
    const refusee = candidat?.convocations?.find((c) => c.statut === "REFUSEE");
    return refusee ? (refusee.reponseEtudiant || "") : "";
};

const COULEURS_BADGE = {
    EN_ATTENTE_REPONSE: "bg-amber-50 text-amber-800 border border-amber-200",
    ACCEPTEE: "bg-blue-50 text-blue-800 border border-blue-200",
    EMBAUCHEE: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    REFUSEE: "bg-red-50 text-red-800 border border-red-200",
};

export default function CandidaturesOffre() {
    const { offreId } = useParams();
    const navigate = useNavigate();
    const authService = useContext(AuthServiceContext);
    const { t } = useTranslation("main");
    const getDisciplineLabel = (valeur) => {
        if (!valeur) return "";
        const disc = DISCIPLINES.find((d) => d.value === valeur || d.labelKey === valeur);
        return disc ? t(`signup_etudiant.disciplines.${disc.labelKey}`) : valeur;
    };

    const [candidatures, setCandidatures] = useState([]);
    const [candidatureAConvoquer, setCandidatureAConvoquer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refusId, setRefusId] = useState(null);
    const [messageRefus, setMessageRefus] = useState("");
    const [enCours, setEnCours] = useState(false);
    const [cvPdfModal, setCvPdfModal] = useState(null);
    const [categorie, setCategorie] = useState("en_attente");

    useEffect(() => {
        return refreshCandidatures();
    }, [offreId, authService]);

    useEffect(() => {
        return () => {
            if (cvPdfModal?.url) {
                URL.revokeObjectURL(cvPdfModal.url);
            }
        };
    }, [cvPdfModal]);

    function refreshCandidatures() {
        let candidaturesChargees = true;

        getCandidatures(offreId, authService.buildAuthHeader())
            .then((data) => {
                if (candidaturesChargees) setCandidatures(data || []);
            })
            .catch((err) => {
                if (candidaturesChargees) setError(err.message);
            })
            .finally(() => {
                if (candidaturesChargees) setIsLoading(false);
            });

        return () => {
            candidaturesChargees = false;
        };
    }

    const handleVoirCv = async (candidat) => {
        try {
            const blob = await getCvCandidat(candidat.id, authService.buildAuthHeader());
            const pdfBlob = new Blob([blob], { type: "application/pdf" });
            const url = URL.createObjectURL(pdfBlob);
            if (cvPdfModal?.url) {
                URL.revokeObjectURL(cvPdfModal.url);
            }
            const titre = candidat?.etudiant
                ? `${candidat.etudiant.firstName} ${candidat.etudiant.lastName} - CV`
                : t("approbation.cvs.pdf_title");
            setCvPdfModal({ url, titre });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFermerCvModal = () => {
        if (cvPdfModal?.url) {
            URL.revokeObjectURL(cvPdfModal.url);
        }
        setCvPdfModal(null);
    };

    const remplacerCandidature = (misAJour) => {
        setCandidatures((liste) => liste.map((c) => (c.id === misAJour.id ? misAJour : c)));
    };

    async function onCreateConvocation(rendezVous, message) {
        rendezVous.forEach((entry) => {
            if (!entry.lieu || !entry.lieu.trim()) {
                throw new Error("lieu vide");
            }
            if (entry.date.getTime() <= Date.now()) {
                throw new Error("date invalid");
            }
        });
        if (message !== null && !message.trim()) {
            message = null;
        }
        const result = await proposeConvocation(candidatureAConvoquer.id, message, rendezVous, authService.buildAuthHeader());
        if (result.statut === "EN_ATTENTE") {
            setIsLoading(true);
            setCandidatureAConvoquer(null);
            refreshCandidatures();
        }
    }

    function onCancelConvocation() {
        setCandidatureAConvoquer(null);
    }

    const handleEmbaucher = async (candidatureId) => {
        setError("");
        setEnCours(true);
        try {
            const misAJour = await embaucherCandidature(candidatureId, authService.buildAuthHeader());
            remplacerCandidature(misAJour);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnCours(false);
        }
    };

    const handleConfirmerRefus = async (candidatureId) => {
        setError("");
        setEnCours(true);
        try {
            const misAJour = await refuserCandidature(candidatureId, messageRefus, authService.buildAuthHeader());
            remplacerCandidature(misAJour);
            setRefusId(null);
            setMessageRefus("");
        } catch (err) {
            setError(err.message);
        } finally {
            setEnCours(false);
        }
    };

    const annulerRefus = () => {
        setRefusId(null);
        setMessageRefus("");
    };

    const candidaturesEnAttente = candidatures.filter((c) => c.statut === "EN_ATTENTE");
    const candidaturesEntrevues = candidatures.filter((c) =>
        ["EN_ATTENTE_REPONSE", "ACCEPTEE"].includes(c.statut)
    );
    const candidaturesEmbauchees = candidatures.filter((c) => c.statut === "EMBAUCHEE");
    const candidaturesRefusees = candidatures.filter((c) => c.statut === "REFUSEE");

    let candidaturesAffichees = candidaturesEnAttente;
    if (categorie === "entrevues") candidaturesAffichees = candidaturesEntrevues;
    if (categorie === "embauchees") candidaturesAffichees = candidaturesEmbauchees;
    if (categorie === "refusees") candidaturesAffichees = candidaturesRefusees;

    return (
        <main className="w-full max-w-7xl mx-auto my-8 sm:my-10 px-4">
            <div className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/employeur")}
                    className="btn-secondary"
                >
                    {t("candidatures_offre.back")}
                </button>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-4">{t("candidatures_offre.title")}</h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">{t("candidatures_offre.subtitle")}</p>
            </div>

            {!isLoading && !error && candidatures.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200/80 rounded-xl mb-6 w-fit">
                    <button
                        type="button"
                        onClick={() => setCategorie("en_attente")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "en_attente"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("candidatures_offre.tabs.pending")} ({candidaturesEnAttente.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("entrevues")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "entrevues"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("candidatures_offre.tabs.interviews")} ({candidaturesEntrevues.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("embauchees")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "embauchees"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("candidatures_offre.tabs.hired")} ({candidaturesEmbauchees.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("refusees")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "refusees"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("candidatures_offre.tabs.refused")} ({candidaturesRefusees.length})
                    </button>
                </div>
            )}

            {isLoading && <p className="text-slate-500 font-medium">{t("candidatures_offre.loading")}</p>}
            {error && <p className="ds-alert-error mb-4" role="alert">{error}</p>}
            {!isLoading && !error && candidatures.length === 0 && (
                <p className="w-full p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 font-medium">
                    {t("candidatures_offre.no_candidates")}
                </p>
            )}
            {!isLoading && !error && candidatures.length > 0 && candidaturesAffichees.length === 0 && (
                <p className="w-full p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 font-medium">
                    {t("candidatures_offre.no_candidates_category")}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidaturesAffichees.map((candidat) => (
                    <article
                        key={candidat.id}
                        className="flex flex-col h-full p-5 sm:p-6 ds-card hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold text-slate-900 break-words">
                                    {candidat.etudiant.firstName} {candidat.etudiant.lastName}
                                </h2>
                                <p className="text-sm text-slate-500 break-all mt-0.5">
                                    {candidat.etudiant.email}
                                </p>
                                <p className="text-xs font-semibold text-blue-600 mt-1">
                                    {getDisciplineLabel(candidat.etudiant.discipline)}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {candidat.etudiant.hasCv ? (
                                    <button
                                        type="button"
                                        onClick={() => handleVoirCv(candidat)}
                                        className="btn-outline py-1.5 px-3 text-xs"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {t("candidatures_offre.view_cv")}
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400 italic py-1">
                                        {t("candidatures_offre.no_cv")}
                                    </span>
                                )}
                                {aUnBadge(candidat) && (
                                    <span
                                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                            COULEURS_BADGE[candidat.statut] || "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {t(`candidatures_offre.status.${candidat.statut}`)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {candidat.messageReponse && (
                            <div className="mt-4 ds-alert-error p-3">
                                <strong className="text-red-900">{t("candidatures_offre.motif_refus")} </strong>
                                {candidat.messageReponse}
                            </div>
                        )}

                        {aConvocationRefusee(candidat) && (
                            <div className="mt-4 ds-alert-warning p-3">
                                <strong className="text-amber-950">
                                    {t("candidatures_offre.convocation_refusee")}
                                </strong>{" "}
                                {getMotifRefusConvocation(candidat) || t("candidatures_offre.aucun_motif")}
                            </div>
                        )}

                        {peutRefuser(candidat) && refusId !== candidat.id && (
                            <div className="mt-auto pt-4 flex flex-wrap justify-between gap-2.5 border-t border-slate-100">
                                {peutConvoquer(candidat) && (
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => setCandidatureAConvoquer(candidat)}
                                        className="btn-success"
                                    >
                                        {aConvocationRefusee(candidat)
                                            ? t("candidatures_offre.reconvoquer")
                                            : t("candidatures_offre.convoquer")}
                                    </button>
                                )}
                                {peutEmbaucher(candidat) && (
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => handleEmbaucher(candidat.id)}
                                        className="btn-success"
                                    >
                                        {t("candidatures_offre.hire")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={enCours}
                                    onClick={() => setRefusId(candidat.id)}
                                    className="btn-danger-soft"
                                >
                                    {t("candidatures_offre.refuse")}
                                </button>
                            </div>
                        )}

                        {refusId === candidat.id && (
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <label className="ds-label">
                                    {t("candidatures_offre.refuse_message_label")}
                                </label>
                                <textarea
                                    value={messageRefus}
                                    onChange={(e) => setMessageRefus(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    placeholder={t("candidatures_offre.refuse_message_placeholder")}
                                    className="ds-input"
                                />
                                <div className="mt-3 flex flex-wrap gap-2.5">
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => handleConfirmerRefus(candidat.id)}
                                        className="btn-danger"
                                    >
                                        {t("candidatures_offre.confirm_refuse")}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={annulerRefus}
                                        className="btn-secondary"
                                    >
                                        {t("candidatures_offre.cancel")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>

            {cvPdfModal && (
                <ModalCvPdf
                    pdfUrl={cvPdfModal.url}
                    onClose={handleFermerCvModal}
                    titre={cvPdfModal.titre}
                />
            )}

            {candidatureAConvoquer && (
                <ModalCreerConvocation
                    rendezVousPossibles={[]}
                    onConfirm={onCreateConvocation}
                    onCancel={onCancelConvocation}
                />
            )}
        </main>
    );
}
