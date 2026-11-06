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

const aEntrevueConfirmee = (candidat) =>
    candidat.statut === "ACCEPTEE" &&
    candidat.convocation?.statut === "ACCEPTEE" &&
    Boolean(candidat.convocation?.rendezVousSelection);

const aConvocationEnAttente = (candidat) =>
    candidat.statut === "EN_ATTENTE_REPONSE" && candidat.convocation?.statut === "EN_ATTENTE";

const formaterDateHeure = (date, langue) =>
    new Date(date).toLocaleString(langue, { dateStyle: "full", timeStyle: "short" });

const COULEURS_BADGE = {
    EN_ATTENTE_REPONSE: "bg-yellow-100 text-yellow-800",
    ACCEPTEE: "bg-blue-100 text-blue-800",
    EMBAUCHEE: "bg-green-100 text-green-800",
    REFUSEE: "bg-red-100 text-red-800",
};

export default function CandidaturesOffre() {
    const { offreId } = useParams();
    const navigate = useNavigate();
    const authService = useContext(AuthServiceContext);
    const { t, i18n } = useTranslation("main");
    const langue = i18n?.language;

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
        <main className="w-full max-w-7xl mx-auto my-10 px-4">
            <div className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/employeur")}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                    {t("candidatures_offre.back")}
                </button>
                <h1 className="text-3xl font-bold text-gray-800 mt-4">{t("candidatures_offre.title")}</h1>
                <p className="text-gray-500 mt-1">{t("candidatures_offre.subtitle")}</p>
            </div>

            {!isLoading && !error && candidatures.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100 rounded-xl mb-6 w-fit">
                    <button
                        type="button"
                        onClick={() => setCategorie("en_attente")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                            categorie === "en_attente"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {t("candidatures_offre.tabs.pending")} ({candidaturesEnAttente.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("entrevues")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                            categorie === "entrevues"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {t("candidatures_offre.tabs.interviews")} ({candidaturesEntrevues.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("embauchees")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                            categorie === "embauchees"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {t("candidatures_offre.tabs.hired")} ({candidaturesEmbauchees.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("refusees")}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                            categorie === "refusees"
                                ? "bg-white text-gray-900 shadow-xs"
                                : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {t("candidatures_offre.tabs.refused")} ({candidaturesRefusees.length})
                    </button>
                </div>
            )}

            {isLoading && <p className="text-gray-500">{t("candidatures_offre.loading")}</p>}
            {error && <p className="p-4 mb-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
            {!isLoading && !error && candidatures.length === 0 && (
                <p className="w-full p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("candidatures_offre.no_candidates")}
                </p>
            )}
            {!isLoading && !error && candidatures.length > 0 && candidaturesAffichees.length === 0 && (
                <p className="w-full p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("candidatures_offre.no_candidates_category")}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidaturesAffichees.map((candidat) => (
                    <article
                        key={candidat.id}
                        className="flex flex-col h-full p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold text-gray-900 break-words">
                                    {candidat.etudiant.firstName} {candidat.etudiant.lastName}
                                </h2>
                                <p className="text-sm text-gray-500 break-all mt-0.5">
                                    {candidat.etudiant.email}
                                </p>
                                <p className="text-xs font-medium text-blue-600 mt-0.5">
                                    {t(`signup_etudiant.disciplines.${candidat.etudiant.discipline}`, {
                                        defaultValue: candidat.etudiant.discipline,
                                    })}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {candidat.etudiant.hasCv ? (
                                    <button
                                        type="button"
                                        onClick={() => handleVoirCv(candidat)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {t("candidatures_offre.view_cv")}
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400 italic py-1">
                                        {t("candidatures_offre.no_cv")}
                                    </span>
                                )}
                                {aUnBadge(candidat) && (
                                    <span
                                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                            COULEURS_BADGE[candidat.statut] || "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {t(`candidatures_offre.status.${candidat.statut}`)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {aEntrevueConfirmee(candidat) && (
                            <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-900 text-sm rounded-lg">
                                <strong className="text-green-950">{t("candidatures_offre.entrevue.confirmee")}</strong>
                                <p className="mt-1 font-semibold">
                                    {formaterDateHeure(candidat.convocation.rendezVousSelection.date, langue)}
                                </p>
                                <p className="text-green-800">{candidat.convocation.rendezVousSelection.lieu}</p>
                            </div>
                        )}

                        {aConvocationEnAttente(candidat) && (
                            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900 text-sm rounded-lg">
                                <strong className="text-yellow-950">{t("candidatures_offre.entrevue.en_attente")}</strong>
                                <ul className="mt-1 space-y-1">
                                    {(candidat.convocation.rendezVousPossibles || []).map((rendezVous) => (
                                        <li key={`${rendezVous.date}-${rendezVous.lieu}`}>
                                            <span className="font-semibold">{formaterDateHeure(rendezVous.date, langue)}</span>
                                            {" - "}
                                            {rendezVous.lieu}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {candidat.messageReponse && (
                            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-lg">
                                <strong className="text-red-900">{t("candidatures_offre.motif_refus")} </strong>
                                {candidat.messageReponse}
                            </div>
                        )}

                        {aConvocationRefusee(candidat) && (
                            <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-sm rounded-lg">
                                <strong className="text-amber-950">
                                    {t("candidatures_offre.convocation_refusee", { defaultValue: "Convocation refusée par l'étudiant :" })}
                                </strong>{" "}
                                {getMotifRefusConvocation(candidat) || t("candidatures_offre.aucun_motif", { defaultValue: "Aucun motif fourni." })}
                            </div>
                        )}

                        {peutRefuser(candidat) && refusId !== candidat.id && (
                            <div className="mt-auto pt-4 flex flex-wrap justify-between gap-3 border-t border-gray-100">
                                {peutConvoquer(candidat) && (
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => setCandidatureAConvoquer(candidat)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {aConvocationRefusee(candidat)
                                            ? t("candidatures_offre.reconvoquer", { defaultValue: "Reconvoquer" })
                                            : t("candidatures_offre.convoquer")}
                                    </button>
                                )}
                                {peutEmbaucher(candidat) && (
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => handleEmbaucher(candidat.id)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {t("candidatures_offre.hire")}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={enCours}
                                    onClick={() => setRefusId(candidat.id)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {t("candidatures_offre.refuse")}
                                </button>
                            </div>
                        )}

                        {refusId === candidat.id && (
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {t("candidatures_offre.refuse_message_label")}
                                </label>
                                <textarea
                                    value={messageRefus}
                                    onChange={(e) => setMessageRefus(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    placeholder={t("candidatures_offre.refuse_message_placeholder")}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <div className="mt-2 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => handleConfirmerRefus(candidat.id)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {t("candidatures_offre.confirm_refuse")}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={annulerRefus}
                                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
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