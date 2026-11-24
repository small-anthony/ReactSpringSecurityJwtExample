import {useContext, useEffect, useState} from "react";
import {AuthServiceContext} from "../../services/AuthService.tsx";
import {accepterOffre, fetchOffresEnAttente, refuserOffre} from "../../services/api/OffreStageService.js";
import ModalApprobation from "../modal/ModalApprobation.jsx";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import ModalRefus from "../modal/ModalRefus.jsx";
import { Briefcase, DollarSign, Clock, GraduationCap, ClipboardList, AlignLeft, MapPin, Phone, Calendar } from "lucide-react";
import {useTranslation} from "react-i18next";
import {useOffreFormater} from "../../hooks/useOffreFormater.js";
import {usePagination} from "../../hooks/usePagination.js";
import Pagination from "../widget/Pagination.jsx";

const ApprobationOffres = () => {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [offres, setOffres] = useState([]);
    const [offreToApprove, setOffreToApprove] = useState(null);
    const [offreToRefuse, setOffreToRefuse] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: offresPaginees
    } = usePagination(offres, 10, []);

    const formatSalaire = (valeur) => {
        if (!valeur) return "";

        const trimSalaire = valeur.trim();

        if (trimSalaire.includes("$") || trimSalaire.toLowerCase().includes("h")) {
            return trimSalaire;
        }

        return `${trimSalaire} $/h`;
    }

    useEffect(() => {
        fetchOffresEnAttente(authService.buildAuthHeader())
            ?.then((data) => {
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
        <main className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)]">
            <SidePanelGestionnaire activeTab="approbationsOffres" />
            <div className="flex-1 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('approbation.offres.title')}</h2>
                </div>

                {errorMessage && (
                    <div className="mb-6 ds-alert-error" role="alert">
                        {errorMessage}
                    </div>
                )}

                <div className="grid gap-6">
                    {offresPaginees.map((offre) => (
                        <article key={offre.id} className="relative p-6 sm:p-7 ds-card hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-slate-900 mb-1 break-words">{offre.titre}</h3>
                            <p className="text-blue-600 font-semibold mb-5 flex items-center gap-1.5 pb-4 border-b border-slate-100 min-w-0">
                                <Briefcase className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="break-words">{offre.nomEntreprise}</span>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 shrink-0">
                                        <GraduationCap className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.discipline')}</span>
                                        <span className="block text-slate-800 text-sm font-medium break-words">{traduireDiscipline(offre.discipline)}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 shrink-0">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.salaire')}</span>
                                        <span className="block text-slate-800 text-sm font-medium break-words">{formaterSalaire(offre.salaire)}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 shrink-0">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.duree')}</span>
                                        <span className="block text-slate-800 text-sm font-medium break-words">{traduireDuree(offre.duree)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-50/70 rounded-xl p-5 border border-slate-100">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <AlignLeft className="w-4 h-4 text-blue-600 shrink-0" />
                                        {t('approbation.offres.attributes.description')}
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-0 sm:pl-6 break-words">{offre.description}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <ClipboardList className="w-4 h-4 text-indigo-600 shrink-0" />
                                        {t('approbation.offres.attributes.exigences')}
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-0 sm:pl-6 break-words">{offre.exigences}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                        {t('approbation.offres.attributes.adresse')}
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-0 sm:pl-6 break-words">{[offre.adresse, offre.ville, offre.codePostal].filter(Boolean).join(", ")}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-200/60">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                        {t('approbation.offres.attributes.telephone')}
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed pl-0 sm:pl-6 break-words">{offre.telephone}</p>
                                </div>
                                {(offre.dateDebut || offre.dateFin) && (
                                    <div className="pt-2 border-t border-slate-200/60">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                                            {t('approbation.offres.attributes.periode')}
                                        </h4>
                                        <p className="text-slate-600 text-sm leading-relaxed pl-0 sm:pl-6 break-words">
                                            {offre.dateDebut && offre.dateFin ? `${offre.dateDebut} → ${offre.dateFin}` : (offre.dateDebut || offre.dateFin)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!(offreToRefuse && offreToRefuse.id === offre.id) && !(offreToApprove && offreToApprove.id === offre.id) && (
                                <div className="flex flex-wrap justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
                                    <button onClick={() => setOffreToRefuse(offre)} className="btn-danger">
                                        {t("approbation.btn_refuse")}
                                    </button>
                                    <button onClick={() => setOffreToApprove(offre)} className="btn-success">
                                        {t("approbation.btn_accept")}
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
                        <div className="text-center ds-card p-16">
                            <p className="text-slate-500 font-medium">{t('approbation.offres.no_offres')}</p>
                        </div>
                    )}
                    <Pagination
                        page={page}
                        totalItems={totalItems}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </div>

        </main>
    );
}

export default ApprobationOffres;