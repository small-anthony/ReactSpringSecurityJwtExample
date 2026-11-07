import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getMesCandidatures, getOffresDisponibles } from "../../services/api/EtudiantService.js";
import { getConvocationsEtudiant } from "../../services/api/ConvocationAPI.js";
import { getContratsEtudiant } from "../../services/api/ContratAPI.js";
import ModalDetailOffre from "../modal/ModalDetailOffre.jsx";
import ModalCvEtudiant from "../modal/ModalCvEtudiant.jsx";
import EtudiantConvocations from "./EtudiantConvocations.jsx";
import EtudiantContrats from "./EtudiantContrats.jsx";
import TableauDeBordEtudiant, {
    construireActionsPrioritaires,
    construireStatutParcours,
    extrairePremiereCandidature,
    obtenirStatutCandidature,
    trouverContratSigneActif
} from "../widget/TableauDeBordEtudiant.jsx";
import { DISCIPLINES } from "../../constants/disciplines";
import { DUREES } from "../../constants/durees";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";
import {
    AlertTriangle,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    FileText,
    FilterX,
    LayoutDashboard,
    Search,
    XCircle
} from "lucide-react";

const MESSAGE_OFFRE_SUPPRIMEE = "L'offre a été supprimée par l'employeur";

function resolveTabFromParam(param) {
    if (param === "convocations") return "convocations";
    if (param === "candidatures") return "mes_candidatures";
    if (param === "contrats") return "contrats";
    if (param === "toutes" || param === "offres") return "toutes";
    return "apercu";
}

function determinerLocale(instanceI18n) {
    const langue = instanceI18n ? instanceI18n.language : "";
    if (typeof langue === "string" && langue.startsWith("en")) {
        return "en-US";
    }
    return "fr-CA";
}

function contientTexte(texteSource, texteRecherche) {
    if (typeof texteSource !== "string") {
        return false;
    }
    return texteSource.toLowerCase().includes(texteRecherche);
}

export default function OffreStagesEtudiant() {
    const { t, i18n } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const userData = authService.getUserData();
    const prenomEtudiant = userData ? userData.firstName : null;
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");

    const [ongletActif, setOngletActif] = useState(() => resolveTabFromParam(tabFromUrl));
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [offres, setOffres] = useState([]);
    const [mesCandidaturesOffres, setMesCandidaturesOffres] = useState([]);
    const [candidaturesParOffre, setCandidaturesParOffre] = useState({});
    const [convocations, setConvocations] = useState([]);
    const [contrats, setContrats] = useState([]);
    const [countPendingConvocations, setCountPendingConvocations] = useState(0);
    const [countPendingContrats, setCountPendingContrats] = useState(0);
    const [aTrouveStage, setATrouveStage] = useState(false);
    const [cvState, setCvState] = useState({
        cvExiste: null,
        status: null,
        messageRefus: null,
        openUpload: null
    });
    const [offreSelectionnee, setOffreSelectionnee] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [filtreEntreprise, setFiltreEntreprise] = useState("");
    const [filtreDiscipline, setFiltreDiscipline] = useState("");
    const [filtreDuree, setFiltreDuree] = useState("");

    const currentLocale = determinerLocale(i18n);

    const formatShortDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(currentLocale, {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();

            const listeOffres = await getOffresDisponibles(authHeader);
            setOffres(listeOffres || []);

            try {
                const mesOffres = await getMesCandidatures(authHeader);
                const listeMesOffres = mesOffres || [];
                setMesCandidaturesOffres(listeMesOffres);

                const parOffre = {};
                listeMesOffres.forEach((offre) => {
                    const premiere = extrairePremiereCandidature(offre);
                    if (premiere) {
                        parOffre[offre.id] = premiere;
                    }
                });
                setCandidaturesParOffre(parOffre);
            } catch {
                setMesCandidaturesOffres([]);
                setCandidaturesParOffre({});
            }

            try {
                const listeConvocations = await getConvocationsEtudiant(authHeader);
                const convs = listeConvocations || [];
                setConvocations(convs);
                const pending = convs.filter((c) => c.statut === "EN_ATTENTE").length;
                setCountPendingConvocations(pending);
            } catch {
                setConvocations([]);
                setCountPendingConvocations(0);
            }

            try {
                const mesContrats = await getContratsEtudiant(authHeader);
                const listeContrats = mesContrats || [];
                setContrats(listeContrats);
                const signed = listeContrats.some((c) => c.signeParEtudiant);
                setATrouveStage(signed);
                const pendingContrats = listeContrats.filter(
                    (c) => !c.signeParEtudiant && c.statut !== "REFUSE"
                ).length;
                setCountPendingContrats(pendingContrats);
            } catch {
                setContrats([]);
                setATrouveStage(false);
                setCountPendingContrats(0);
            }
        } catch {
            setErreur(t("offres_etudiant.error_fetch"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void chargerDonnees();
    }, [authService]);

    useEffect(() => {
        setOngletActif(resolveTabFromParam(tabFromUrl));
    }, [tabFromUrl]);

    const changerOnglet = (nouvelOnglet) => {
        setOngletActif(nouvelOnglet);
        if (nouvelOnglet === "convocations") {
            setSearchParams({ tab: "convocations" });
        } else if (nouvelOnglet === "mes_candidatures") {
            setSearchParams({ tab: "candidatures" });
        } else if (nouvelOnglet === "contrats") {
            setSearchParams({ tab: "contrats" });
        } else if (nouvelOnglet === "toutes") {
            setSearchParams({ tab: "toutes" });
        } else {
            setSearchParams({});
        }
    };

    const idsOffresPostulees = useMemo(() => {
        return new Set(mesCandidaturesOffres.map((o) => o.id));
    }, [mesCandidaturesOffres]);

    const handlePostulerSucces = (offreId) => {
        setCandidaturesParOffre((prev) => ({ ...prev, [offreId]: { statut: "EN_ATTENTE" } }));
        const offrePostulee = offres.find((o) => o.id === offreId);
        if (offrePostulee && !idsOffresPostulees.has(offreId)) {
            setMesCandidaturesOffres((prev) => [...prev, offrePostulee]);
        }
    };

    const offresDisponiblesNonPostulees = useMemo(() => {
        return offres.filter((o) => !idsOffresPostulees.has(o.id));
    }, [offres, idsOffresPostulees]);

    const contratsASigner = useMemo(() => {
        return contrats.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE");
    }, [contrats]);

    const contratSigneActif = useMemo(() => {
        return trouverContratSigneActif(contrats, contratsASigner);
    }, [contrats, contratsASigner]);

    const convocationsEnAttente = useMemo(() => {
        return convocations.filter((c) => c.statut === "EN_ATTENTE");
    }, [convocations]);

    const convocationsConfirmees = useMemo(() => {
        return convocations.filter((c) => c.statut === "ACCEPTEE");
    }, [convocations]);

    const candidaturesEmbauchees = useMemo(() => {
        return mesCandidaturesOffres.filter(
            (offre) => obtenirStatutCandidature(offre, candidaturesParOffre) === "EMBAUCHEE"
        );
    }, [mesCandidaturesOffres, candidaturesParOffre]);

    const journeyStatus = useMemo(() => {
        return construireStatutParcours({
            contratsASigner,
            contratSigneActif,
            candidaturesEmbauchees,
            convocationsEnAttente,
            convocationsConfirmees,
            cvState,
            mesCandidaturesOffres,
            t
        });
    }, [
        contratsASigner,
        contratSigneActif,
        candidaturesEmbauchees,
        convocationsEnAttente,
        convocationsConfirmees,
        cvState,
        mesCandidaturesOffres,
        t
    ]);

    const actionsPrioritaires = useMemo(() => {
        return construireActionsPrioritaires({
            cvState,
            contratsASigner,
            convocationsEnAttente,
            contrats,
            candidaturesEmbauchees,
            aTrouveStage,
            mesCandidaturesOffres,
            offresDisponiblesNonPostulees,
            changerOnglet,
            onSelectionnerOffre: setOffreSelectionnee,
            t
        });
    }, [
        cvState,
        contratsASigner,
        convocationsEnAttente,
        contrats,
        candidaturesEmbauchees,
        aTrouveStage,
        mesCandidaturesOffres,
        offresDisponiblesNonPostulees,
        t
    ]);

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
        const listeBase = ongletActif === "mes_candidatures" ? mesCandidaturesOffres : offres;
        const texteRecherche = recherche.toLowerCase();

        return listeBase.filter((offre) => {
            const { id, titre, nomEntreprise, description, discipline, duree } = offre;
            if (ongletActif === "toutes" && idsOffresPostulees.has(id)) {
                return false;
            }

            const correspondRecherche =
                !recherche ||
                contientTexte(titre, texteRecherche) ||
                contientTexte(nomEntreprise, texteRecherche) ||
                contientTexte(description, texteRecherche);

            const correspondEntreprise =
                !filtreEntreprise || nomEntreprise === filtreEntreprise;

            const correspondDiscipline =
                !filtreDiscipline || discipline === filtreDiscipline;

            const correspondDuree =
                !filtreDuree || duree === filtreDuree;

            return (
                correspondRecherche &&
                correspondEntreprise &&
                correspondDiscipline &&
                correspondDuree
            );
        });
    }, [
        offres,
        mesCandidaturesOffres,
        idsOffresPostulees,
        recherche,
        filtreEntreprise,
        filtreDiscipline,
        filtreDuree,
        ongletActif
    ]);

    const aDesFiltresActifs = Boolean(
        recherche || filtreEntreprise || filtreDiscipline || filtreDuree
    );

    const reinitialiserFiltres = () => {
        setRecherche("");
        setFiltreEntreprise("");
        setFiltreDiscipline("");
        setFiltreDuree("");
    };

    const getCandidatureBadge = (offreId) => {
        const cand = candidaturesParOffre[offreId];
        const statut = cand && cand.statut ? cand.statut : "EN_ATTENTE";

        if (statut === "EMBAUCHEE") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t("etudiant_dashboard.applications.status_hired")}
                </span>
            );
        }
        if (statut === "ACCEPTE" || statut === "ACCEPTEE") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    <Calendar className="w-3 h-3 text-indigo-600" />
                    {t("etudiant_dashboard.applications.status_interview")}
                </span>
            );
        }
        if (statut === "REFUSEE" || statut === "REFUSE") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    {t("etudiant_dashboard.applications.status_refused")}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-500" />
                {t("etudiant_dashboard.applications.status_pending")}
            </span>
        );
    };

    const nombreActionsUrgentes = actionsPrioritaires.filter((a) => a.priority === "urgent").length;
    const idOffreSelectionnee = offreSelectionnee ? offreSelectionnee.id : null;
    const aPostuleOffreSelectionnee = idOffreSelectionnee
        ? idsOffresPostulees.has(idOffreSelectionnee)
        : false;
    const candidatureOffreSelectionnee = idOffreSelectionnee
        ? candidaturesParOffre[idOffreSelectionnee]
        : null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                {prenomEtudiant
                                    ? t("etudiant_dashboard.greeting", { name: prenomEtudiant })
                                    : t("etudiant_dashboard.greeting_default")}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${journeyStatus.tone}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${journeyStatus.dot}`} />
                                <span>{journeyStatus.label}</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            {t("etudiant_dashboard.subtitle_question")}
                        </p>
                    </div>

                    <div className="shrink-0">
                        <ModalCvEtudiant
                            compact={true}
                            onStatusChange={setCvState}
                        />
                    </div>
                </div>

                <div className="ds-tabs-bar flex-wrap">
                    <button
                        type="button"
                        id="tab-apercu"
                        onClick={() => changerOnglet("apercu")}
                        className={`ds-tab ${ongletActif === "apercu" ? "ds-tab-active" : "ds-tab-inactive"}`}
                    >
                        <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                        <span>{t("etudiant_dashboard.tabs.dashboard")}</span>
                        {nombreActionsUrgentes > 0 && (
                            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700">
                                {nombreActionsUrgentes}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        id="tab-toutes-offres"
                        onClick={() => changerOnglet("toutes")}
                        className={`ds-tab ${ongletActif === "toutes" ? "ds-tab-active" : "ds-tab-inactive"}`}
                    >
                        <Compass className="w-4 h-4" strokeWidth={1.75} />
                        <span>{t("etudiant_dashboard.tabs.explore")}</span>
                        <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-200/80 text-slate-700">
                            {offresDisponiblesNonPostulees.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        id="tab-candidatures"
                        onClick={() => changerOnglet("mes_candidatures")}
                        className={`ds-tab ${ongletActif === "mes_candidatures" ? "ds-tab-active" : "ds-tab-inactive"}`}
                    >
                        <Briefcase className="w-4 h-4" strokeWidth={1.75} />
                        <span>{t("etudiant_dashboard.tabs.applications")}</span>
                        {mesCandidaturesOffres.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-200/80 text-slate-700">
                                {mesCandidaturesOffres.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        id="tab-convocations"
                        onClick={() => changerOnglet("convocations")}
                        className={`ds-tab ${ongletActif === "convocations" ? "ds-tab-active" : "ds-tab-inactive"}`}
                    >
                        <Calendar className="w-4 h-4" strokeWidth={1.75} />
                        <span>{t("etudiant_dashboard.tabs.interviews")}</span>
                        {countPendingConvocations > 0 && (
                            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                                {countPendingConvocations}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        id="tab-contrats"
                        onClick={() => changerOnglet("contrats")}
                        className={`ds-tab ${ongletActif === "contrats" ? "ds-tab-active" : "ds-tab-inactive"}`}
                    >
                        <FileText className="w-4 h-4" strokeWidth={1.75} />
                        <span>{t("etudiant_dashboard.tabs.stage")}</span>
                        {countPendingContrats > 0 && (
                            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800">
                                {countPendingContrats}
                            </span>
                        )}
                    </button>
                </div>

                {erreur && !loading && (
                    <div className="ds-alert-error">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" strokeWidth={1.5} />
                        <p className="font-semibold">{erreur}</p>
                    </div>
                )}

                {ongletActif === "convocations" ? (
                    <EtudiantConvocations
                        embedMode={true}
                        onPendingCountChange={(pending, updatedList) => {
                            setCountPendingConvocations(pending);
                            if (Array.isArray(updatedList)) {
                                setConvocations(updatedList);
                            }
                        }}
                    />
                ) : ongletActif === "contrats" ? (
                    <EtudiantContrats
                        embedMode={true}
                        onPendingCountChange={(restant, signed) => {
                            setCountPendingContrats(restant);
                            if (typeof signed === "boolean") {
                                setATrouveStage(signed);
                            }
                        }}
                    />
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500">
                            {t("offres_etudiant.loading")}
                        </p>
                    </div>
                ) : ongletActif === "apercu" ? (
                    <TableauDeBordEtudiant
                        actionsPrioritaires={actionsPrioritaires}
                        mesCandidaturesOffres={mesCandidaturesOffres}
                        offresDisponiblesNonPostulees={offresDisponiblesNonPostulees}
                        candidaturesParOffre={candidaturesParOffre}
                        contratSigneActif={contratSigneActif}
                        convocationsConfirmees={convocationsConfirmees}
                        convocationsEnAttente={convocationsEnAttente}
                        aTrouveStage={aTrouveStage}
                        renderCandidatureBadge={getCandidatureBadge}
                        traduireDiscipline={traduireDiscipline}
                        traduireDuree={traduireDuree}
                        formatShortDate={formatShortDate}
                        changerOnglet={changerOnglet}
                        onSelectionnerOffre={setOffreSelectionnee}
                    />
                ) : (
                    <div className="space-y-5">
                        <div className="ds-card p-4 sm:p-5 space-y-3.5">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                <div className="lg:col-span-5 relative">
                                    <Search
                                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                                        strokeWidth={1.5}
                                    />
                                    <input
                                        type="text"
                                        placeholder={t("offres_etudiant.search_placeholder")}
                                        value={recherche}
                                        onChange={({ target }) => setRecherche(target.value)}
                                        className="ds-input pl-10 py-2 text-xs"
                                    />
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <select
                                        value={filtreEntreprise}
                                        onChange={({ target }) => setFiltreEntreprise(target.value)}
                                        className="ds-input py-2 text-xs"
                                    >
                                        <option value="">{t("offres_etudiant.all_companies")}</option>
                                        {entreprisesUniques.map((entreprise) => (
                                            <option key={entreprise} value={entreprise}>
                                                {entreprise}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filtreDiscipline}
                                        onChange={({ target }) => setFiltreDiscipline(target.value)}
                                        className="ds-input py-2 text-xs"
                                    >
                                        <option value="">{t("offres_etudiant.all_disciplines")}</option>
                                        {disciplinesUniques.map((discipline) => (
                                            <option key={discipline} value={discipline}>
                                                {traduireDiscipline(discipline)}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filtreDuree}
                                        onChange={({ target }) => setFiltreDuree(target.value)}
                                        className="ds-input py-2 text-xs"
                                    >
                                        <option value="">{t("offres_etudiant.all_durations")}</option>
                                        {dureesUniques.map((duree) => (
                                            <option key={duree} value={duree}>
                                                {traduireDuree(duree)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {aDesFiltresActifs && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                                    <span>
                                        {t(
                                            offresFiltrees.length > 1
                                                ? "offres_etudiant.offers_count_plural"
                                                : "offres_etudiant.offers_count",
                                            { count: offresFiltrees.length }
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={reinitialiserFiltres}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                                    >
                                        <FilterX className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        <span>{t("offres_etudiant.reset_filters")}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {offresFiltrees.length === 0 ? (
                            <div className="ds-card p-12 border-dashed text-center space-y-3">
                                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {ongletActif === "mes_candidatures"
                                        ? t("offres_etudiant.tab_my_applications")
                                        : t("offres_etudiant.empty_title")}
                                </h3>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
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
                                        className="btn-secondary text-xs py-2 px-4 mt-2"
                                    >
                                        <FilterX className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        <span>{t("offres_etudiant.reset_filters")}</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {offresFiltrees.map((offre) => {
                                    const {
                                        id,
                                        discipline,
                                        duree,
                                        titre,
                                        nomEntreprise,
                                        salaire,
                                        description
                                    } = offre;
                                    const candidature = candidaturesParOffre[id];
                                    const statutCandidature = candidature ? candidature.statut : null;
                                    const messageReponse = candidature ? candidature.messageReponse : null;
                                    const texteRefus =
                                        messageReponse === MESSAGE_OFFRE_SUPPRIMEE
                                            ? t("candidature_etudiant.offer_deleted")
                                            : messageReponse || t("candidature_etudiant.status.REFUSEE");

                                    return (
                                        <article
                                            key={id}
                                            className="ds-card-interactive p-5 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                                                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                                        {discipline && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 min-w-0">
                                                                <span className="truncate">
                                                                    {traduireDiscipline(discipline)}
                                                                </span>
                                                            </span>
                                                        )}
                                                        {duree && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                                                <span>{traduireDuree(duree)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {ongletActif === "mes_candidatures" && getCandidatureBadge(id)}
                                                </div>

                                                <div className="space-y-1.5 mb-4">
                                                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                                                        {titre}
                                                    </h3>
                                                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                                                        <span>{nomEntreprise}</span>
                                                        {salaire !== undefined && salaire !== null && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-emerald-700 font-bold">
                                                                    {formaterSalaire(salaire)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>

                                            {ongletActif === "mes_candidatures" &&
                                                statutCandidature === "REFUSEE" && (
                                                    <div className="pb-3">
                                                        <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                                                            <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                                                            <span className="line-clamp-1">
                                                                {texteRefus}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setOffreSelectionnee(offre)}
                                                    className={
                                                        ongletActif === "mes_candidatures"
                                                            ? "btn-secondary w-full sm:w-auto text-xs py-2 px-4"
                                                            : "btn-primary w-full sm:w-auto text-xs py-2 px-4"
                                                    }
                                                >
                                                    <span>{t("offres_etudiant.btn_see_details")}</span>
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ModalDetailOffre
                offre={offreSelectionnee}
                onClose={() => setOffreSelectionnee(null)}
                aPostule={aPostuleOffreSelectionnee}
                candidature={candidatureOffreSelectionnee}
                onPostulerSucces={handlePostulerSucces}
            />
        </div>
    );
}
