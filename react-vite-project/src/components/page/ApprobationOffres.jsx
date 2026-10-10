import {useContext, useEffect, useState} from "react";
import {AuthServiceContext} from "../../services/AuthService.tsx";

import {accepterOffre, fetchOffresEnAttente, refuserOffre} from "../../services/api/OffreStageService.js";

import ModalApprobation from "../modal/ModalApprobation.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import ModalRefus from "../modal/ModalRefus.jsx";
import { Briefcase, Check, X, DollarSign, Clock, GraduationCap, ClipboardList, AlignLeft } from "lucide-react";
import {useTranslation} from "react-i18next";
import { DISCIPLINES } from "../../constants/disciplines.js";

const ApprobationOffres = () => {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const [offres, setOffres] = useState([]);
    const [offreToApprove, setOffreToApprove] = useState(null);
    const [offreToRefuse, setOffreToRefuse] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const getDisciplineTraduction = (valeurDB) => {
        const found = DISCIPLINES.find(d => d.value === valeurDB);

        return found ? t(`signup_etudiant.disciplines.${found.labelKey}`) : valeurDB;
    };

    const getDureeTraduction = (valeurDB) => {
        if (!valeurDB) return "";

        const nombre = parseInt(valeurDB, 10);
        return Number.isNaN(nombre) ? valeurDB : t("creer_offre.weeks", { count: nombre });
    };

    useEffect(() => {
        fetchOffresEnAttente(authService.buildAuthHeader())
            .then((data) => {
                setOffres(data);
                setErrorMessage("")
            })
            .catch(() => {
                setErrorMessage(t("approbation.offres.errors.fetch"));
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
                setErrorMessage(t("approbation.offres.errors.approve"));
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
                setErrorMessage(t("approbation.offres.errors.reject"));
                setOffreToRefuse(null);
            });
    };

    return (
        <main className="flex flex-col md:flex-row w-full bg-gray-50/30">
            <SidePanelGestionnaire activeTab="approbationsOffres" />
            <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">{t('approbation.offres.title')}</h2>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md font-medium shadow-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="grid gap-6">
                    {offres.map((offre) => (
                        <article key={offre.id} className="relative p-7 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">

                            <h3 className="text-xl font-bold text-gray-900 pr-20 mb-1">{offre.titre}</h3>
                            <p className="text-blue-600 font-medium mb-5 flex items-center gap-1.5 pb-4 border-b border-gray-100">
                                <Briefcase className="w-4 h-4" strokeWidth={2} />
                                {offre.nomEntreprise}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.discipline')}</span>
                                        <span className="text-gray-800 text-sm font-medium">{getDisciplineTraduction(offre.discipline)}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.salaire')}</span>
                                        <span className="text-gray-800 text-sm font-medium">{offre.salaire}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.duree')}</span>
                                        <span className="text-gray-800 text-sm font-medium">{getDureeTraduction(offre.duree)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <AlignLeft className="w-4 h-4 text-blue-500" />
                                        {t('approbation.offres.attributes.description')}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-6">{offre.description}</p>
                                </div>
                                <div className="pt-2">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <ClipboardList className="w-4 h-4 text-purple-500" />
                                        {t('approbation.offres.attributes.exigences')}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-6">{offre.exigences}</p>
                                </div>
                            </div>

                            {!(offreToRefuse && offreToRefuse.id === offre.id) && !(offreToApprove && offreToApprove.id === offre.id) && (
                                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                                    <button onClick={() => setOffreToRefuse(offre)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                                        {t('approbation.btn_refuse')}
                                    </button>
                                    <button onClick={() => setOffreToApprove(offre)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                        {t('approbation.btn_accept')}
                                    </button>
                                </div>
                            )}


                            {offreToRefuse && offreToRefuse.id === offre.id && (
                                <ModalRefus
                                    mode="offre"
                                    onClose={() => setOffreToRefuse(null)}
                                    onConfirm={(message) => handleRefuser(offre.id, message)}
                                />
                            )}
                            {offreToApprove && offreToApprove.id === offre.id && (
                                <ModalApprobation
                                    offre={offreToApprove}
                                    onClose={() => setOffreToApprove(null)}
                                    onConfirm={handleAccepter}
                                    authHeader={authService.buildAuthHeader()}
                                />
                            )}
                        </article>
                    ))}

                    {offres.length === 0 && !errorMessage && (
                        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-16">
                            <p className="text-gray-500 font-medium">{t('approbation.offres.no_offres')}</p>
                        </div>
                    )}
                </div>
            </div>

        </main>
    );
}

export default ApprobationOffres;

