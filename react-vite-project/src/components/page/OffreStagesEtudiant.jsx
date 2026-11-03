import { useEffect, useState, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getOffresDisponibles, getMesCandidatures } from "../../services/api/EtudiantService.js";
import { getConvocationsEtudiant } from "../../services/api/ConvocationAPI.js";
import ModalDetailOffre from "../modal/ModalDetailOffre.jsx";
import { DISCIPLINES } from "../../constants/disciplines";
import { DUREES } from "../../constants/durees";
import { Briefcase, Search, Building2, GraduationCap, Clock, DollarSign, AlertTriangle, FilterX, FileText, CheckCircle2, Calendar, XCircle } from "lucide-react";
import ModalCvEtudiant from "../modal/ModalCvEtudiant.jsx";
import EtudiantConvocations from "./EtudiantConvocations.jsx";
import {useOffreFormater} from "../../hooks/useOffreFormater.js";

export default function OffreStagesEtudiant() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [offres, setOffres] = useState([]);
    const [mesCandidaturesIds, setMesCandidaturesIds] = useState([]);
    const [candidaturesParOffre, setCandidaturesParOffre] = useState({});
    const [ongletActif, setOngletActif] = useState(
        tabFromUrl === "convocations" ? "convocations" : (tabFromUrl === "candidatures" ? "mes_candidatures" : "toutes")
    );
    const [countPendingConvocations, setCountPendingConvocations] = useState(0);
    const [offreSelectionnee, setOffreSelectionnee] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [filtreEntreprise, setFiltreEntreprise] = useState("");
    const [filtreDiscipline, setFiltreDiscipline] = useState("");
    const [filtreDuree, setFiltreDuree] = useState("");

    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();

            const listeOffres = await getOffresDisponibles(authHeader);
            setOffres(listeOffres || []);

            try {
                const mesOffres = await getMesCandidatures(authHeader);
                setMesCandidaturesIds((mesOffres || []).map((o) => o.id));

                const parOffre = {};
                (mesOffres || []).forEach((o) => {
                    if (o.candidatures && o.candidatures.length > 0) {
                        parOffre[o.id] = o.candidatures[0];
                    }
                });
                setCandidaturesParOffre(parOffre);
            } catch {
                setMesCandidaturesIds([]);
                setCandidaturesParOffre({});
            }

            try {
                const convocations = await getConvocationsEtudiant(authHeader);
                const pending = (convocations || []).filter((c) => c.statut === "EN_ATTENTE").length;
                setCountPendingConvocations(pending);
            } catch {
                setCountPendingConvocations(0);
            }
        } catch (err) {
            console.error("Erreur chargement offres:", err);
            setErreur(t("offres_etudiant.error_fetch"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void chargerDonnees();
    }, [authService]);

    useEffect(() => {
        if (tabFromUrl === "convocations") {
            setOngletActif("convocations");
        } else if (tabFromUrl === "candidatures") {
            setOngletActif("mes_candidatures");
        } else if (tabFromUrl === "toutes") {
            setOngletActif("toutes");
        }
    }, [tabFromUrl]);

    const changerOnglet = (nouvelOnglet) => {
        setOngletActif(nouvelOnglet);
        if (nouvelOnglet === "convocations") {
            setSearchParams({ tab: "convocations" });
        } else if (nouvelOnglet === "mes_candidatures") {
            setSearchParams({ tab: "candidatures" });
        } else {
            setSearchParams({});
        }
    };

    const handlePostulerSucces = (offreId) => {
        setMesCandidaturesIds((prev) => (prev.includes(offreId) ? prev : [...prev, offreId]));
        setCandidaturesParOffre((prev) => ({ ...prev, [offreId]: { statut: "EN_ATTENTE" } }));
    };

    const entreprisesUniques = useMemo(() => {
        return [...new Set(offres.map((o) => o.nomEntreprise).filter(Boolean))].sort();
    }, [offres]);

    const disciplinesUniques = useMemo(() => {
        const predefined = DISCIPLINES.map((d) => d.value);
        const fromOffers = offres.map((o) => o.discipline).filter(Boolean);
        return [...new Set([...predefined, ...fromOffers])].sort();
    }, [offres]);

    const dureesUniques = useMemo(() => {
        const fromOffers = offres.map((o) => o.duree).filter(Boolean);
        return [...new Set([...DUREES, ...fromOffers])].sort((a, b) => {
            const numA = parseInt(a, 10) || 0;
            const numB = parseInt(b, 10) || 0;
            return numA - numB;
        });
    }, [offres]);

    const offresFiltrees = useMemo(() => {
        return offres.filter((offre) => {
            const aPostule = mesCandidaturesIds.includes(offre.id);

            if (ongletActif === "toutes" && aPostule) {
                return false;
            }

            if (ongletActif === "mes_candidatures" && !aPostule) {
                return false;
            }

            const texteRecherche = recherche.toLowerCase();
            const correspondRecherche =
                !recherche ||
                offre.titre?.toLowerCase().includes(texteRecherche) ||
                offre.nomEntreprise?.toLowerCase().includes(texteRecherche) ||
                offre.description?.toLowerCase().includes(texteRecherche);

            const correspondEntreprise =
                !filtreEntreprise || offre.nomEntreprise === filtreEntreprise;

            const correspondDiscipline =
                !filtreDiscipline || offre.discipline === filtreDiscipline;

            const correspondDuree =
                !filtreDuree || offre.duree === filtreDuree;

            return (
                correspondRecherche &&
                correspondEntreprise &&
                correspondDiscipline &&
                correspondDuree
            );
        });
    }, [offres, recherche, filtreEntreprise, filtreDiscipline, filtreDuree, ongletActif, mesCandidaturesIds]);

    const aDesFiltresActifs = recherche || filtreEntreprise || filtreDiscipline || filtreDuree;

    const reinitialiserFiltres = () => {
        setRecherche("");
        setFiltreEntreprise("");
        setFiltreDiscipline("");
        setFiltreDuree("");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] mb-3">
                        <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={1.5} />
                        <span>{t("offres_etudiant.badge")}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[#111827] tracking-tight sm:text-4xl">
                        {t("offres_etudiant.title")}
                    </h1>
                    <p className="mt-2 text-base text-[#4B5563] max-w-2xl">
                        {t("offres_etudiant.subtitle")}
                    </p>
                </div>

                <ModalCvEtudiant />

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-[#64748B]">
                            {t("offres_etudiant.loading")}
                        </p>
                    </div>
                )}

                {erreur && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" strokeWidth={1.5} />
                        <p className="text-sm font-semibold">{erreur}</p>
                    </div>
                )}

                {!loading && !erreur && (
                    <div className="space-y-6">
                        <div className="bg-[#F1F5F9] p-1 rounded-xl inline-flex flex-wrap items-center gap-1 border border-[#E2E8F0] shadow-xs">
                            <button
                                type="button"
                                onClick={() => changerOnglet("toutes")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                                    ongletActif === "toutes"
                                        ? "bg-white text-[#111827] shadow-xs"
                                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
                                }`}
                            >
                                {t("offres_etudiant.tab_all_offers", { defaultValue: "Toutes les offres" })}
                            </button>
                            <button
                                type="button"
                                onClick={() => changerOnglet("mes_candidatures")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                                    ongletActif === "mes_candidatures"
                                        ? "bg-white text-[#111827] shadow-xs"
                                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
                                }`}
                            >
                                <span>
                                    {t("offres_etudiant.tab_my_applications", { defaultValue: "Mes candidatures" })} ({mesCandidaturesIds.length})
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => changerOnglet("convocations")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                                    ongletActif === "convocations"
                                        ? "bg-white text-[#111827] shadow-xs"
                                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
                                }`}
                            >
                                <Calendar className="w-4 h-4 text-[#64748B]" strokeWidth={1.5} />
                                <span>{t("pagename.convocations", { defaultValue: "Mes convocations" })}</span>
                                {countPendingConvocations > 0 && (
                                    <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                                        {countPendingConvocations}
                                    </span>
                                )}
                            </button>
                        </div>

                        {ongletActif === "convocations" ? (
                            <EtudiantConvocations
                                embedMode={true}
                                onPendingCountChange={setCountPendingConvocations}
                            />
                        ) : (
                            <>
                                <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                                        <input
                                            type="text"
                                            placeholder={t("offres_etudiant.search_placeholder")}
                                            value={recherche}
                                            onChange={(e) => setRecherche(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white text-[#111827] transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <select
                                            value={filtreEntreprise}
                                            onChange={(e) => setFiltreEntreprise(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#4B5563]"
                                        >
                                            <option value="">{t("offres_etudiant.all_companies")}</option>
                                            {entreprisesUniques.map((entreprise) => (
                                                <option key={entreprise} value={entreprise}>{entreprise}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filtreDiscipline}
                                            onChange={(e) => setFiltreDiscipline(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#4B5563]"
                                        >
                                            <option value="">{t("offres_etudiant.all_disciplines")}</option>
                                            {disciplinesUniques.map((discipline) => (
                                                <option key={discipline} value={discipline}>{traduireDiscipline(discipline)}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filtreDuree}
                                            onChange={(e) => setFiltreDuree(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-[#4B5563]"
                                        >
                                            <option value="">{t("offres_etudiant.all_durations")}</option>
                                            {dureesUniques.map((duree) => (
                                                <option key={duree} value={duree}>{traduireDuree(duree)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {aDesFiltresActifs && (
                                        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                                            <span>
                                                {t(offresFiltrees.length > 1 ? "offres_etudiant.offers_count_plural" : "offres_etudiant.offers_count", {
                                                    count: offresFiltrees.length
                                                })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={reinitialiserFiltres}
                                                className="inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer"
                                            >
                                                <FilterX className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                <span>{t("offres_etudiant.reset_filters")}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {offresFiltrees.length === 0 ? (
                                    <div className="bg-white p-12 rounded-xl border border-dashed border-[#CBD5E1] text-center space-y-3">
                                        <div className="w-12 h-12 bg-[#F1F5F9] text-[#94A3B8] rounded-xl flex items-center justify-center mx-auto">
                                            <FileText className="w-6 h-6" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-base font-semibold text-[#111827]">
                                            {ongletActif === "mes_candidatures"
                                                ? t("offres_etudiant.tab_my_applications")
                                                : t("offres_etudiant.empty_title")}
                                        </h3>
                                        <p className="text-sm text-[#64748B] max-w-md mx-auto">
                                            {ongletActif === "mes_candidatures"
                                                ? t("offres_etudiant.empty_applied")
                                                : aDesFiltresActifs
                                                    ? t("offres_etudiant.empty_filtered")
                                                    : t("offres_etudiant.empty_none")}
                                        </p>
                                        {aDesFiltresActifs && (
                                            <button
                                                type="button"
                                                onClick={reinitialiserFiltres}
                                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-xs font-semibold rounded-lg transition cursor-pointer"
                                            >
                                                <FilterX className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                <span>{t("offres_etudiant.reset_filters")}</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {offresFiltrees.map((offre) => (
                                            <article
                                                key={offre.id}
                                                className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            {offre.discipline && (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]/60 min-w-0">
                                                                    <span className="truncate">{traduireDiscipline(offre.discipline)}</span>
                                                                </span>
                                                            )}
                                                            {offre.duree && (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] shrink-0">
                                                                    <span>{traduireDuree(offre.duree)}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 mb-4">
                                                        <h3 className="text-[18px] font-semibold text-[#111827] tracking-tight line-clamp-1 leading-snug">
                                                            {offre.titre}
                                                        </h3>
                                                        <p className="text-[14px] font-medium text-[#4B5563] flex items-center gap-1.5 mt-1.5">
                                                            <Building2 className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
                                                            <span>{offre.nomEntreprise}</span>
                                                        </p>
                                                        <p className="text-[14px] font-normal text-[#6B7280] line-clamp-2 leading-relaxed mt-2.5">
                                                            {offre.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {(ongletActif === "mes_candidatures" || mesCandidaturesIds.includes(offre.id)) && (
                                                    <div className="pt-3 pb-3 border-t border-[#E2E8F0]">
                                                        {candidaturesParOffre[offre.id]?.statut === "REFUSEE" && (
                                                            <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                                                                <XCircle className="w-4 h-4 shrink-0 text-rose-500" strokeWidth={1.5} />
                                                                <span>
                                                                    {t("candidature_etudiant.status.REFUSEE")}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOffreSelectionnee(offre)}
                                                        className="w-full sm:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-medium rounded-lg transition-colors duration-150 shadow-xs hover:shadow cursor-pointer inline-flex items-center justify-center gap-1.5"
                                                    >
                                                        <span>{t("offres_etudiant.btn_see_details")}</span>
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <ModalDetailOffre
                offre={offreSelectionnee}
                onClose={() => setOffreSelectionnee(null)}
                aPostule={offreSelectionnee ? mesCandidaturesIds.includes(offreSelectionnee.id) : false}
                onPostulerSucces={handlePostulerSucces}
            />
        </div>
    );
}