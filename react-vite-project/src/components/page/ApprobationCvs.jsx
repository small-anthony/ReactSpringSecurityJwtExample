import { useContext, useEffect, useState } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { accepterCv, getCvsEnAttente, refuserCv, voirCvPdf } from "../../services/api/GestionnaireService.js";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import { Check, Eye, IdCard, X } from "lucide-react";
import {useTranslation} from "react-i18next";
import ModalRefus from "../modal/ModalRefus.jsx";
import ModalCvPdf from "../modal/ModalCvPdf.jsx";

const ApprobationCvs = () => {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [cvRefuser, setCvRefuser] = useState(null);
    const [pdfUrlModal, setPdfUrlModal] = useState(null);

    useEffect(() => {
        chargerCvs();
    }, []);

    const chargerCvs = async () => {
        try {
            const data = await getCvsEnAttente(authService.buildAuthHeader());
            setCvs(data);
        } catch (error) {
            setError(t('approbation.cvs.errors.fetch'));
        } finally {
            setLoading(false);
        }
    };

    const handleAccepter = async (id, message) => {
        setActionError(null);

        try {
            await accepterCv(id, authService.buildAuthHeader());
            setCvs(cvs.filter(cv => cv.id !== id));
        } catch (error) {
            setActionError(t('approbation.cvs.errors.accept'));
        }
    };

    const handleRefuser = async (id, message) => {
        setActionError(null);

        try {
            await refuserCv(id, message, authService.buildAuthHeader());
            setCvs(cvs.filter(cv => cv.id !== id));
            setCvRefuser(null);
        } catch (error) {
            setActionError(t('approbation.cvs.errors.reject'));
        }
    };

    const handleVoirPdf = async (id) => {
        try {
            const url = await voirCvPdf(id, authService.buildAuthHeader());
            setPdfUrlModal(url);
        } catch (err) {
            setActionError(err.message);
        }
    };

    const fermerModalPdf = () => {
        if (pdfUrlModal) {
            URL.revokeObjectURL(pdfUrlModal);
        }
        setPdfUrlModal(null);
    };

    return(
        <main className="flex flex-col md:flex-row w-full bg-gray-50/30 overflow-hidden">
            <SidePanelGestionnaire activeTab="approbations" />
            <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">{t('approbation.cvs.title')}</h2>
                {actionError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md font-medium shadow-sm">
                        {actionError}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md font-medium shadow-sm">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16">
                        <p className="text-gray-500 font-medium">{t('approbation.cvs.loading')}</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {cvs.map(cv => (
                            <article key={cv.id} className="relative p-7 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">

                                <h3 className="text-xl font-bold text-gray-900 pr-20 mb-1">
                                    {cv.etudiantFirstName} {cv.etudiantLastName}
                                </h3>
                                <p className="text-gray-600 font-medium mb-4 flex items-center gap-1.5">
                                    <IdCard className="w-4 h-4" strokeWidth={2} />
                                    {t('approbation.cvs.matricule')} : {cv.etudiantMatricule}
                                </p>
                                <button
                                    onClick={() => handleVoirPdf(cv.id)}
                                    className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                >
                                    <Eye className="w-4 h-4" strokeWidth={2} />
                                    {t('approbation.cvs.pdf')}
                                </button>

                                {!(cvRefuser && cvRefuser.id === cv.id) && (
                                    <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                                        <button
                                            onClick={() => setCvRefuser(cv)}
                                            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                        >
                                            Refuser
                                        </button>
                                        <button
                                            onClick={() => handleAccepter(cv.id)}
                                            className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                        >
                                            Accepter
                                        </button>
                                    </div>
                                )}


                                {cvRefuser && cvRefuser.id === cv.id && (
                                    <ModalRefus
                                        mode="cv"
                                        onClose={() => setCvRefuser(null)}
                                        onConfirm={(message) => handleRefuser(cv.id, message)}
                                    />
                                )}
                            </article>
                        ))}
                        {cvs.length === 0 && !error && (
                            <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16">
                                <p className="text-gray-500 font-medium">{t('approbation.cvs.nocvs')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {pdfUrlModal && (
                <ModalCvPdf
                    pdfUrl={pdfUrlModal}
                    onClose={fermerModalPdf}
                    titre={t('approbation.cvs.pdf_title')}
                />
            )}
        </main>
    );
};

export default ApprobationCvs;
