import {useContext, useEffect, useState} from "react";
import {AuthServiceContext} from "../../services/AuthService.tsx";

import {accepterOffre, fetchOffresEnAttente, refuserOffre} from "../../services/api/OffreStageService.js";

import ModalApprobation from "../modal/ModalApprobation.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import ModalRefusOffre from "../modal/ModalRefusOffre.jsx";
import { Briefcase, Check, X } from "lucide-react";

const ApprobationOffres = () => {
    const authService = useContext(AuthServiceContext);
    const [offres, setOffres] = useState([]);
    const [offreToApprove, setOffreToApprove] = useState(null);
    const [offreToRefuse, setOffreToRefuse] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchOffresEnAttente(authService.buildAuthHeader())
            .then((data) => {
                setOffres(data);
                setErrorMessage("")
            })
            .catch(() => {
                setErrorMessage("Impossible de charger les offres pour le moment.");
            });
    }, [authService]);

    const handleAccepter = (offreId, etudiantsIds) => {
        accepterOffre(offreId, etudiantsIds, authService.buildAuthHeader())
            .then(() => {
                fetchOffresEnAttente(authService.buildAuthHeader())
                    .then(data => setOffres(data));
                setOffreToApprove(null);
                setErrorMessage("");
            })
            .catch(() => {
                setErrorMessage("Une erreur est survenue lors de l'approbation de l'offre.");
                setOffreToApprove(null);
            });
    };


    const handleRefuser = (offreId, message) => {
        refuserOffre(offreId, message, authService.buildAuthHeader())
            .then(() => {
                fetchOffresEnAttente(authService.buildAuthHeader())
                    .then(data => setOffres(data));
                setOffreToRefuse(null);
                setErrorMessage("");
            })
            .catch(() => {
                setErrorMessage("Une erreur est survenue lors du refus de l'offre.");
                setOffreToRefuse(null);
            });
    };

    return (
        <main className="flex flex-col md:flex-row w-full bg-gray-50/30">
            <SidePanelGestionnaire activeTab="approbations" />
            <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Offres en attente d'approbation</h2>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md font-medium shadow-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="grid gap-6">
                    {offres.map((offre) => (
                        <article key={offre.id} className="relative p-7 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="absolute top-5 right-5 flex gap-2">
                                <button onClick={() => setOffreToRefuse(offre)} className="group w-4 h-4 bg-red-500 border border-red-600 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm">
                                    <X className="w-2.5 h-2.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                </button>
                                <button onClick={() => setOffreToApprove(offre)} className="group w-4 h-4 bg-green-500 border border-green-600 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm">
                                    <Check className="w-2.5 h-2.5 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 pr-20 mb-1">{offre.titre}</h3>
                            <p className="text-blue-600 font-medium mb-3 flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" strokeWidth={2} />
                                {offre.nomEntreprise}
                            </p>
                            <p className="text-gray-700 leading-relaxed">{offre.description}</p>
                        </article>
                    ))}

                    {offres.length === 0 && !errorMessage && (
                        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16">
                            <p className="text-gray-500 font-medium">Aucune offre en attente.</p>
                        </div>
                    )}
                </div>
            </div>

            {offreToApprove && (
                <ModalApprobation
                    offre={offreToApprove}
                    onClose={() => setOffreToApprove(null)}
                    onConfirm={handleAccepter}
                    authHeader={authService.buildAuthHeader()}
                />
            )}

            {offreToRefuse && (
                <ModalRefusOffre
                    offre={offreToRefuse}
                    onClose={() => setOffreToRefuse(null)}
                    onConfirm={handleRefuser}
                />
            )}
        </main>
    );
}

export default ApprobationOffres;