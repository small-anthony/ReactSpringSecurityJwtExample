import { accepterCv, getCvsEnAttente, refuserCv, voirCvPdf } from "../../services/api/GestionnaireService.js";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {useContext, useEffect, useState} from "react";

const GestionnaireHome = () => {
    const authService = useContext(AuthServiceContext);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);

    const [cvEnCoursRefus, setCvEnCoursRefus] = useState(null);
    const [messageRefus, setMessageRefus] = useState("");
    const [pdfUrlModal, setPdfUrlModal] = useState(null);

    useEffect(() => {
        chargerCvs();
    }, []);

    const chargerCvs = async () => {
        try {
            const data = await getCvsEnAttente(authService.buildAuthHeader());
            setCvs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccepter = async (id) => {
        setActionError(null);

        try {
            await accepterCv(id, authService.buildAuthHeader());
            setCvs(cvs.filter(cv => cv.id !== id));
        } catch (error) {
            setActionError(error.message);
        }
    };

    const handleRefuser = async (id) => {
        setActionError(null);

        if (!messageRefus.trim()) {
            setActionError("Le motif de refus est obligatoire pour rejeter un CV");
            return;
        }

        try {
            await refuserCv(id, messageRefus, authService.buildAuthHeader());
            setCvs(cvs.filter(cv => cv.id !== id));
            setCvEnCoursRefus(null);
            setMessageRefus("");
        } catch (error) {
            setActionError(error.message);
        }
    };

    const annulerRefus = () => {
        setCvEnCoursRefus(null);
        setMessageRefus("");
        setActionError(null);
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
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white p-8 shadow-xl">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                    Espace Gestionnaire
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-light">
                    Validation Cvs
                </h1>
                <p className="text-blue-100 mt-2 max-w-xl text-sm sm:text-base">
                    Consultez, acceptez ou refusez les curriculums vitae soumis par les Étudiants
                </p>
            </div>

            {actionError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 shadow-sm animate-fade-in">
                    <span className="font-medium text-sm">{actionError}</span>
                </div>
            )}

            {loading && (
                <div className="text-center text-gray-500">Chargement des CVs...</div>
            )}

            {error && (
                <div className="text-center text-gray-500">{error}</div>
            )}

            {!loading && cvs.length === 0 && !error && (
                <div className="text-center text-gray-500">Aucun CV en attente de validation</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvs.map(cv => (
                    <div key={cv.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between space-y-4 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {cv.etudiantFirstName} {cv.etudiantLastName}
                            </h2>
                            <p className="text-sm text-slate-500 mb-2">
                                Matricule : {cv.etudiantMatricule}
                            </p>
                            <div className="mb-6 flex-grow">
                                <button
                                    onClick={() => handleVoirPdf(cv.id)}
                                    className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-2"
                                >
                                    Voir le document PDF
                                </button>
                            </div>
                            {cvEnCoursRefus !== cv.id ? (
                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => handleAccepter(cv.id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => setCvEnCoursRefus(cv.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 mt-auto">
                                    <textarea
                                        value={messageRefus}
                                        onChange={(e) => setMessageRefus(e.target.value)}
                                        placeholder="Motif de refus"
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRefuser(cv.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Confirmer
                                        </button>
                                        <button
                                            onClick={annulerRefus}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {pdfUrlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Visualisation du CV</h3>
                            <button 
                                onClick={fermerModalPdf}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-red-500 hover:text-white transition-colors"
                                title="Fermer"
                            >
                                X
                            </button>
                        </div>
                        <div className="flex-grow bg-slate-200 p-2">
                            <iframe 
                                src={pdfUrlModal} 
                                className="w-full h-full rounded-2xl border-none shadow-inner"
                                title="CV PDF"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionnaireHome;
