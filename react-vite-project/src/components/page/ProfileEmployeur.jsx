import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {deleteOffreStage, getOffresStages, getAnneesEmployeur} from "../../services/api/OffreStageService.js";
import {useTranslation} from "react-i18next";
import { DollarSign, Clock, GraduationCap, ClipboardList, AlignLeft, Briefcase, FileText,Users } from "lucide-react";
import {useOffreFormater} from "../../hooks/useOffreFormater.js";
import ModalModifierOffre from "../modal/ModalModiffierOffre.jsx";
import ModalConfirmation from "../modal/ModalConfirmation.jsx";
import SelecteurSession from "../widget/SelecteurSession.jsx";

const STATUS_STYLES = {
    EN_ATTENTE: "bg-amber-50 text-amber-800 border-amber-200",
    ACCEPTE: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REFUSE: "bg-red-50 text-red-800 border-red-200",
};

const compterCandidatures = (offre) =>
    (offre.candidatures ?? []).length;

export default function ProfileEmployeur() {
    const { t } = useTranslation("main");
    const navigate = useNavigate();
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [offres, setOffres] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [offreAEditer, setOffreAEditer] = useState(null);
    const [offreASupprimer, setOffreASupprimer] = useState(null);
    const [messageConfirmation, setMessageConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categorie, setCategorie] = useState("toutes");

    useEffect(() => {
        getAnneesEmployeur?.(authService.buildAuthHeader())
            ?.then((data) => {
                setAnnees(data);

                if (data && data.length > 0) {
                    setAnneeChoisie(data[0]);
                }
            })
            ?.catch(() => setAnnees([]));
    }, [authService]);

    useEffect(() => {
        let offresChargees = true;
        setIsLoading(true);

        getOffresStages(authService.buildAuthHeader(), anneeChoisie)
            ?.then((data) => {
                if (offresChargees) setOffres(data);
            })
            .catch((err) => {
                if (offresChargees) setError(err.message);
            })
            .finally(() => {
                if (offresChargees) setIsLoading(false);
            });

        return () => {
            offresChargees = false;
        };
    }, [authService, anneeChoisie]);

    const handleSupprimer = async (offreId) => {
        const idCible = typeof offreId === "number" ? offreId : offreASupprimer?.id;
        if (!idCible) return;
        setIsDeleting(true);
        try {
            await deleteOffreStage(idCible, authService.buildAuthHeader());
            setOffres((prev) => prev.filter((o) => o.id !== idCible));
            setOffreASupprimer(null);
            setMessageConfirmation(t("employeur_home.delete_success"));
        } catch (err) {
            setError(err.message || t("employeur_home.delete_error"));
            setOffreASupprimer(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const offresEnAttente = offres.filter((o) => o.status === "EN_ATTENTE");
    const offresAcceptees = offres.filter((o) => o.status === "ACCEPTE" || o.status === "ACCEPTEE");
    const offresRefusees = offres.filter((o) => o.status === "REFUSE" || o.status === "REFUSEE");

    let offresAffichees = offres;
    if (categorie === "en_attente") offresAffichees = offresEnAttente;
    if (categorie === "accepte") offresAffichees = offresAcceptees;
    if (categorie === "refuse") offresAffichees = offresRefusees;

    return (
        <main className="w-full max-w-5xl mx-auto my-10 px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{t("employeur_home.title")}</h1>
                    <p className="text-slate-500 text-sm sm:text-base mt-1">{t("employeur_home.subtitle")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <SelecteurSession
                        annees={annees}
                        anneeSelectionnee={anneeChoisie}
                        onChangementAnnee={setAnneeChoisie}
                    />
                    <Link
                        to="/employeur/contrats"
                        id="btn-nav-contrats-employeur"
                        className="btn-secondary"
                    >
                        <FileText className="w-4 h-4 text-blue-600" />
                        {t("employeur_home.contracts_button")}
                    </Link>
                    <Link
                        to="/employeur/stagiaires"
                        id="btn-nav-stagiaires-employeur"
                        className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        <Users className="w-4 h-4 text-blue-600" />
                        {t("pagename.stagiaires", { defaultValue: "Mes stagiaires" })}
                    </Link>
                    <Link
                        to="/employeur/creer-offre"
                        className="btn-primary shrink-0"
                    >
                        {t("employeur_home.create_offer")}
                    </Link>
                </div>
            </div>

            {!isLoading && !error && offres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200/80 rounded-xl mb-6 w-fit">
                    <button
                        type="button"
                        onClick={() => setCategorie("toutes")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "toutes"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("employeur_home.tabs.all")} ({offres.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("accepte")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "accepte"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("employeur_home.tabs.accepted")} ({offresAcceptees.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("en_attente")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "en_attente"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("employeur_home.tabs.pending")} ({offresEnAttente.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategorie("refuse")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                            categorie === "refuse"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                        {t("employeur_home.tabs.refused")} ({offresRefusees.length})
                    </button>
                </div>
            )}

            {isLoading && <p className="text-slate-500 font-medium">{t("employeur_home.loading")}</p>}
            {error && <p className="ds-alert-error mb-4" role="alert">{error}</p>}
            {!isLoading && !error && offres.length === 0 && (
                <p className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 font-medium">
                    {t("employeur_home.no_offers")}
                </p>
            )}
            {!isLoading && !error && offres.length > 0 && offresAffichees.length === 0 && (
                <p className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 font-medium">
                    {t("employeur_home.no_offers_category")}
                </p>
            )}

            <div className="grid gap-5">
                {offresAffichees.map((offre) => (
                    <article key={offre.id} className="p-6 sm:p-7 ds-card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{offre.titre}</h2>
                                <p className="text-blue-600 font-semibold mt-1 flex items-center gap-1.5 pb-4 border-b border-slate-100">
                                    <Briefcase className="w-4 h-4" strokeWidth={2} />
                                    {offre.nomEntreprise}
                                </p>
                            </div>
                            <span className={`shrink-0 px-3 py-1 text-xs font-bold rounded-full border ${STATUS_STYLES[offre.status] || ""}`}>
                                {t(`employeur_home.status.${offre.status}`)}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                                    <GraduationCap className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.discipline')}</span>
                                    <span className="text-slate-800 text-sm font-medium">{traduireDiscipline(offre.discipline)}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.salaire')}</span>
                                    <span className="text-slate-800 text-sm font-medium">{formaterSalaire(offre.salaire)}</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('approbation.offres.attributes.duree')}</span>
                                    <span className="text-slate-800 text-sm font-medium">{traduireDuree(offre.duree)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-slate-50/70 rounded-xl p-5 border border-slate-100">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                    <AlignLeft className="w-4 h-4 text-blue-600" />
                                    {t('approbation.offres.attributes.description')}
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed pl-6">{offre.description}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-200/60">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                                    {t('approbation.offres.attributes.exigences')}
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed pl-6">{offre.exigences}</p>
                            </div>
                        </div>
                        {offre.status === "REFUSE" && offre.messageReponse && (
                            <div className="mt-5 ds-alert-error">
                                <strong className="text-red-900">{t("employeur_home.motif_refus")} </strong>{offre.messageReponse}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate(`/employeur/offres/${offre.id}/candidatures`)}
                                className="btn-primary"
                            >
                                {t("employeur_home.view_candidates")} ({compterCandidatures(offre)})
                            </button>
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setOffreAEditer(offre)}
                                    className="btn-secondary"
                                >
                                    {t("employeur_home.edit_offer")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOffreASupprimer(offre)}
                                    className="btn-danger-soft"
                                >
                                    {t("employeur_home.delete_offer")}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <ModalConfirmation
                isOpen={Boolean(offreASupprimer)}
                type="danger"
                title={t("employeur_home.delete_confirm_title")}
                message={t("employeur_home.delete_confirm_message")}
                details={offreASupprimer ? `${offreASupprimer.titre}` : null}
                confirmText={t("common.confirm")}
                onClose={() => setOffreASupprimer(null)}
                onConfirm={() => handleSupprimer(offreASupprimer?.id)}
                loading={isDeleting}
            />

            <ModalConfirmation
                isOpen={Boolean(messageConfirmation)}
                type="success"
                isSuccess={true}
                title={t("employeur_home.delete_success_title")}
                message={messageConfirmation}
                confirmText={t("common.confirm")}
                onConfirm={() => setMessageConfirmation(null)}
            />

            {offreAEditer && (
                <ModalModifierOffre
                    offre={offreAEditer}
                    onClose={() => setOffreAEditer(null)}
                    onOffreModifiee={(updated) => {
                        setOffres((prev) =>
                            prev.map((o) => (o.id === updated.id ? updated : o))
                        );
                    }}
                />
            )}
        </main>
    );
}

