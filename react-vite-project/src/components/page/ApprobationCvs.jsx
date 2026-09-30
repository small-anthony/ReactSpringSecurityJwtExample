import { useContext, useEffect, useState } from "react";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { accepterCv, getCvsEnAttente, refuserCv, voirCvPdf } from "../../services/api/GestionnaireService.js";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import { Check, Eye, IdCard, X } from "lucide-react";
import {useTranslation} from "react-i18next";
import ModalRefus from "../modal/ModalRefus.jsx";

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
                                <div className="absolute top-5 right-5 flex gap-2">
                                    <button
                                        onClick={() => setCvRefuser(cv)}
                                        className="group w-4 h-4 bg-red-500 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                                        title={t('approbation.cvs.reject')}
                                    >
                                        <X className="w-2.5 h-2.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                    </button>
                                    <button
                                        onClick={() => handleAccepter(cv.id)}
                                        className="group w-4 h-4 bg-green-500 border border-green-600 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
                                        title={t('approbation.cvs.approve')}
                                    >
                                        <Check className="w-2.5 h-2.5 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                    </button>
                                </div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">{t('approbation.cvs.visualisationPdf')}</h3>
                            <button
                                onClick={fermerModalPdf}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                                title={t('approbation.cvs.close')}
                            >
                                <X className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="flex-grow bg-gray-100 p-2">
                            <iframe
                                src={pdfUrlModal}
                                className="w-full h-full rounded-xl border-none shadow-inner"
                                title={t('approbation.cvs.cvPdf')}
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ApprobationCvs;

