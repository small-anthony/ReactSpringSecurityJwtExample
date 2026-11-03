import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const estAffichee = (candidature) => candidature.statut !== "REFUSEE";
const peutConvoquer = (candidature) => candidature.statut === "EN_ATTENTE";
const peutEmbaucher = (candidature) => candidature.statut === "ACCEPTEE";
const peutRefuser = (candidature) =>
    ["EN_ATTENTE", "EN_ATTENTE_REPONSE", "ACCEPTEE"].includes(candidature.statut);
const aUnBadge = (candidature) => candidature.statut !== "EN_ATTENTE";

const COULEURS_BADGE = {
    EN_ATTENTE_REPONSE: "bg-yellow-100 text-yellow-800",
    ACCEPTEE: "bg-blue-100 text-blue-800",
    EMBAUCHEE: "bg-green-100 text-green-800",
};

export default function CandidaturesOffre() {
    const { offreId } = useParams();
    const navigate = useNavigate();
    const authService = useContext(AuthServiceContext);
    const { t } = useTranslation("main");

    const [candidatures, setCandidatures] = useState([]);
    const [candidatureAConvoquer, setCandidatureAConvoquer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refusId, setRefusId] = useState(null);
    const [messageRefus, setMessageRefus] = useState("");
    const [enCours, setEnCours] = useState(false);
    const [cvPdfModal, setCvPdfModal] = useState(null);

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
                if (candidaturesChargees) setCandidatures(data.filter(estAffichee));
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
                : t("approbation.cvs.pdf_title", { defaultValue: "Visualisation du CV" });
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

    const retirerCandidature = (candidatureId) => {
        setCandidatures((liste) => liste.filter((c) => c.id !== candidatureId));
    };

    async function onCreateConvocation(rendezVous, message) {
        rendezVous.forEach(entry => {
            if(!entry.lieu || !entry.lieu.trim()) {
                throw new Error("lieu vide");
            }
            if(entry.date.getTime() <= Date.now()) {
                throw new Error("date invalid");
            }
        })
        if(message !== null && !message.trim()) {
            message = null;
        }
        const result = await proposeConvocation(candidatureAConvoquer.id, message, rendezVous, authService.buildAuthHeader());
        if(result.statut === "EN_ATTENTE") {
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
            await refuserCandidature(candidatureId, messageRefus, authService.buildAuthHeader());
            retirerCandidature(candidatureId);
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

    return (
        <main className="max-w-7xl mx-auto my-10 px-4">
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

            {isLoading && <p className="text-gray-500">{t("candidatures_offre.loading")}</p>}
            {error && <p className="p-4 mb-4 rounded-lg bg-red-50 text-red-700">{error}</p>}
            {!isLoading && !error && candidatures.length === 0 && (
                <p className="p-6 rounded-lg border border-dashed border-gray-300 text-gray-500">
                    {t("candidatures_offre.no_candidates")}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidatures.map((candidat) => (
                    <article
                        key={candidat.id}
                        className="flex flex-col h-full p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="text-lg font-semibold text-gray-800 break-words">
                                    {candidat.etudiant.firstName} {candidat.etudiant.lastName}
                                </h2>
                                {aUnBadge(candidat) && (
                                    <span
                                        className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                                            COULEURS_BADGE[candidat.statut] || "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {t(`candidatures_offre.status.${candidat.statut}`)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 break-all">{candidat.etudiant.email}</p>
                            <p className="text-sm text-blue-600">
                                {t(`signup_etudiant.disciplines.${candidat.etudiant.discipline}`, {
                                    defaultValue: candidat.etudiant.discipline,
                                })}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            {candidat.etudiant.hasCv ? (
                                <button
                                    type="button"
                                    onClick={() => handleVoirCv(candidat)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                                >
                                    {t("candidatures_offre.view_cv")}
                                </button>
                            ) : (
                                <span className="text-sm text-gray-400">{t("candidatures_offre.no_cv")}</span>
                            )}
                        </div>

                        {candidat.messageReponse && (
                            <p className="mt-3 text-sm text-gray-700 break-words">
                                <span className="font-semibold">{t("candidatures_offre.response_message")} : </span>
                                {candidat.messageReponse}
                            </p>
                        )}

                        {peutRefuser(candidat) && refusId !== candidat.id && (
                            <div className="mt-auto pt-4 flex flex-wrap justify-between gap-3">
                                {peutConvoquer(candidat) && (
                                    <button
                                        type="button"
                                        disabled={enCours}
                                        onClick={() => setCandidatureAConvoquer(candidat)}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {t("candidatures_offre.convoquer")}
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
                            <div className="mt-auto pt-4">
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

            {candidatureAConvoquer &&
                <ModalCreerConvocation
                    rendezVousPossibles={[]}
                    onConfirm={onCreateConvocation}
                    onCancel={onCancelConvocation}
                />}
        </main>
    );
}