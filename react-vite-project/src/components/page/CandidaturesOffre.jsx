import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getCandidatures,
    getCvCandidat,
    refuserCandidature,
} from "../../services/api/OffreStageService.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";
import ModalCreerConvocation from "../modal/ModalCreerConvocation.jsx";
import { proposeConvocation } from "../../services/api/ConvocationAPI.jsx";

const estAffichee = (candidature) => candidature.statut !== "REFUSEE";
const peutActionner = (candidature) => candidature.statut === "EN_ATTENTE";

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

    const formatStatut = (statut) => t(`candidatures_offre.status.${statut}`, { defaultValue: statut });

    const statutClasses = (statut) => {
        switch (statut) {
            case "ACCEPTEE":
                return "bg-green-100 text-green-800 border-green-200";
            case "REFUSEE":
                return "bg-red-100 text-red-800 border-red-200";
            case "EN_ATTENTE_REPONSE":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

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
            if(!entry.lieu.trim()) {
                throw new Error("lieu vide");
            }
            console.log(entry.date)
            console.log(Date.now())
            if(entry.date.getTime() <= Date.now()) {
                throw new Error("date vide");
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
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-gray-800 break-words">
                                    {candidat.etudiant.firstName} {candidat.etudiant.lastName}
                                </h2>
                                <p className="text-sm text-gray-500 break-all">{candidat.etudiant.email}</p>
                                <p className="text-sm text-blue-600">
                                    {t(`signup_etudiant.disciplines.${candidat.etudiant.discipline}`, {
                                        defaultValue: candidat.etudiant.discipline,
                                    })}
                                </p>
                            </div>
                            <span
                                className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border shrink-0 ${statutClasses(candidat.statut)}`}
                            >
                                {formatStatut(candidat.statut)}
                            </span>
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

                        {peutActionner(candidat) && refusId !== candidat.id && (
                            <div className="mt-auto pt-4 flex flex-wrap justify-between">
                                <button
                                    type="button"
                                    disabled={enCours}
                                    onClick={() => setCandidatureAConvoquer(candidat)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {t("candidatures_offre.accept")}
                                </button>
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