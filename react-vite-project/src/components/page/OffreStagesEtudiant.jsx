import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getMesCandidatures, getOffresDisponibles } from "../../services/api/EtudiantService.js";
import { getConvocationsEtudiant } from "../../services/api/ConvocationAPI.js";
import { getAnneesContratsEtudiant, getContratsEtudiant, choisirStageEtGenererContrat } from "../../services/api/ContratAPI.js";
import ModalDetailOffre from "../modal/ModalDetailOffre.jsx";
import ModalCvEtudiant from "../modal/ModalCvEtudiant.jsx";
import EtudiantConvocations from "./EtudiantConvocations.jsx";
import EtudiantContrats from "./EtudiantContrats.jsx";
import TableauDeBordEtudiant, {
    construireActionsPrioritaires,
    construireStatutParcours,
    estConvocationActive,
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
    Loader2,
    Search,
    X,
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

const ORDRE_STATUT_CANDIDATURE = {
    EMBAUCHEE: 0,
    EN_ATTENTE_SIGNATURE: 1,
    EN_ATTENTE_CHOIX_STAGE: 2,
    EN_ATTENTE_ENTREVUE: 3,
    EN_ATTENTE_CONFIRMATION_ENTREVUE: 4,
    ENTREVUE_REFUSEE: 5,
    EN_ATTENTE_CONVOCATION: 6,
    REFUSEE: 7,
};

const BADGE_STATUT_CANDIDATURE = {
    EN_ATTENTE_CONVOCATION: {
        classes: "bg-slate-100 text-slate-700 border-slate-200",
        Icon: Clock,
        iconClass: "text-slate-500",
        labelKey: "candidature_etudiant.status.EN_ATTENTE_CONVOCATION"
    },
    EN_ATTENTE_CONFIRMATION_ENTREVUE: {
        classes: "bg-amber-100 text-amber-800 border-amber-200",
        Icon: Calendar,
        iconClass: "text-amber-600",
        labelKey: "candidature_etudiant.status.EN_ATTENTE_CONFIRMATION_ENTREVUE"
    },
    ENTREVUE_REFUSEE: {
        classes: "bg-orange-100 text-orange-800 border-orange-200",
        Icon: XCircle,
        iconClass: "text-orange-600",
        labelKey: "candidature_etudiant.status.ENTREVUE_REFUSEE"
    },
    EN_ATTENTE_ENTREVUE: {
        classes: "bg-indigo-100 text-indigo-800 border-indigo-200",
        Icon: Calendar,
        iconClass: "text-indigo-600",
        labelKey: "candidature_etudiant.status.EN_ATTENTE_ENTREVUE"
    },
    EN_ATTENTE_CHOIX_STAGE: {
        classes: "bg-blue-100 text-blue-800 border-blue-200",
        Icon: CheckCircle2,
        iconClass: "text-blue-600",
        labelKey: "candidature_etudiant.status.EN_ATTENTE_CHOIX_STAGE"
    },
    EN_ATTENTE_SIGNATURE: {
        classes: "bg-amber-100 text-amber-800 border-amber-200",
        Icon: Clock,
        iconClass: "text-amber-600",
        labelKey: "etudiant_dashboard.applications.status_contract_to_sign"
    },
    EMBAUCHEE: {
        classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
        Icon: CheckCircle2,
        iconClass: "text-emerald-600",
        labelKey: "candidature_etudiant.badge_EMBAUCHEE"
    },
    REFUSEE: {
        classes: "bg-rose-100 text-rose-800 border-rose-200",
        Icon: XCircle,
        iconClass: "text-rose-600",
        labelKey: "etudiant_dashboard.applications.status_refused"
    }
};

export default function OffreStagesEtudiant() {
    const { t, i18n } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const userData = authService.getUserData();
    const prenomEtudiant = userData ? userData.firstName : null;
    const { traduireDiscipline, traduireDuree, formaterSalaire } = useOffreFormater();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const uploadCvFromUrl = searchParams.get("uploadCv") === "true";

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
    const [choosingCandidatureId, setChoosingCandidatureId] = useState(null);
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
                const anneesContrats = await getAnneesContratsEtudiant?.(authHeader);
                const anneeCourante =
                    Array.isArray(anneesContrats) && anneesContrats.length > 0 ? anneesContrats[0] : null;
                const mesContrats = anneeCourante !== null
                    ? await getContratsEtudiant(authHeader, anneeCourante)
                    : await getContratsEtudiant(authHeader);
                const listeContrats = mesContrats || [];
                setContrats(listeContrats);
                const signed = listeContrats.some((c) => c.signeParEtudiant && c.statut !== "REFUSE");
                setATrouveStage(signed);
                const pendingContrats = signed
                    ? 0
                    : listeContrats.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE").length;
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

    useEffect(() => {
        if (uploadCvFromUrl && cvState.openUpload) {
            cvState.openUpload();
            const next = new URLSearchParams(searchParams);
            next.delete("uploadCv");
            setSearchParams(next, { replace: true });
        }
    }, [uploadCvFromUrl, cvState.openUpload]);

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

    const handleChoisirStageSucces = async () => {
        setOffreSelectionnee(null);
        await chargerDonnees();
        changerOnglet("contrats");
    };

    const handleChoisirStageDepuisCarte = async (candidatureId) => {
        if (!candidatureId) return;
        try {
            setChoosingCandidatureId(candidatureId);
            setErreur(null);
            await choisirStageEtGenererContrat(candidatureId, authService.buildAuthHeader());
            await handleChoisirStageSucces();
        } catch (err) {
            setErreur((err && err.message) || t("candidature_etudiant.choose_stage_error"));
        } finally {
            setChoosingCandidatureId(null);
        }
    };

    const offresDisponiblesNonPostulees = useMemo(() => {
        return offres.filter((o) => !idsOffresPostulees.has(o.id));
    }, [offres, idsOffresPostulees]);

    const aDejaContratSigne = useMemo(() => {
        return contrats.some((c) => c.signeParEtudiant && c.statut !== "REFUSE");
    }, [contrats]);

    const contratsASigner = useMemo(() => {
        if (aDejaContratSigne) {
            return [];
        }
        return contrats.filter((c) => !c.signeParEtudiant && c.statut !== "REFUSE");
    }, [contrats, aDejaContratSigne]);

    const contratSigneActif = useMemo(() => {
        return trouverContratSigneActif(contrats, contratsASigner);
    }, [contrats, contratsASigner]);

    const convocationsEnAttente = useMemo(() => {
        return convocations.filter(
            (c) => c.statut === "EN_ATTENTE" && estConvocationActive(c, contrats, candidaturesParOffre)
        );
    }, [convocations, contrats, candidaturesParOffre]);

    const convocationsConfirmees = useMemo(() => {
        return convocations.filter(
            (c) => c.statut === "ACCEPTEE" && estConvocationActive(c, contrats, candidaturesParOffre)
        );
    }, [convocations, contrats, candidaturesParOffre]);

    const contratsRefuses = useMemo(() => {
        return contrats.filter((c) => c.statut === "REFUSE");
    }, [contrats]);

    const candidaturesEmbauchees = useMemo(() => {
        return mesCandidaturesOffres.filter(
            (offre) => ["EN_ATTENTE_CHOIX_STAGE", "EN_ATTENTE_SIGNATURE", "EMBAUCHEE"].includes(
                obtenirStatutCandidature(offre, candidaturesParOffre, contrats)
            )
        );
    }, [mesCandidaturesOffres, candidaturesParOffre, contrats]);

    const journeyStatus = useMemo(() => {
        return construireStatutParcours({
            contratsASigner,
            contratSigneActif,
            candidaturesEmbauchees,
            convocationsEnAttente,
            convocationsConfirmees,
            cvState,
            mesCandidaturesOffres,
            candidaturesParOffre,
            contrats,
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
        candidaturesParOffre,
        contrats,
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

    const offresEmbauchees = useMemo(
        () => mesCandidaturesOffres.filter((o) => candidaturesParOffre[o.id]?.statut === "EMBAUCHEE"),
        [mesCandidaturesOffres, candidaturesParOffre]
    );

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

    const aStageEnCoursOuTrouve = useMemo(() => {
        if (aDejaContratSigne) return true;
        if (contrats.some((c) => c.statut !== "REFUSE")) return true;
        return Object.values(candidaturesParOffre).some(
            (c) => c && (c.statut === "EN_ATTENTE_SIGNATURE" || c.statut === "EMBAUCHEE")
        );
    }, [aDejaContratSigne, contrats, candidaturesParOffre]);

    const getCandidatureBadge = (offreId) => {
        const contratAssocie = contrats.find(
            (c) => c.offreId === offreId || String(c.offreId) === String(offreId)
        );
        if (contratAssocie && contratAssocie.statut === "REFUSE") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <XCircle className="w-3 h-3 text-slate-500" />
                    {t("etudiant_dashboard.applications.status_contract_refused")}
                </span>
            );
        }

        const aSignePourCetteOffre = Boolean(
            contratAssocie && (contratAssocie.signeParEtudiant || contratAssocie.statut === "COMPLETE")
        );
        if (aSignePourCetteOffre) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t("etudiant_dashboard.applications.status_hired")}
                </span>
            );
        }

        const cand = candidaturesParOffre[offreId];
        const statut = cand && cand.statut ? cand.statut : "EN_ATTENTE_CONVOCATION";
        const badgeConfig = contratAssocie && !contratAssocie.signeParEtudiant
            ? BADGE_STATUT_CANDIDATURE.EN_ATTENTE_SIGNATURE
            : BADGE_STATUT_CANDIDATURE[statut] || BADGE_STATUT_CANDIDATURE.EN_ATTENTE_CONVOCATION;
        const { classes, Icon, iconClass, labelKey } = badgeConfig;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${classes}`}>
                <Icon className={`w-3 h-3 ${iconClass}`} />
                {t(labelKey)}
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
                        onPendingCountChange={(restant, signed, updatedContrat) => {
                            setCountPendingContrats(restant);
                            if (typeof signed === "boolean") {
                                setATrouveStage(signed);
                            }
                            if (updatedContrat) {
                                setContrats((prev) =>
                                    prev.map((c) => (c.id === updatedContrat.id ? updatedContrat : c))
                                );
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
                        contrats={contrats}
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
                                        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        strokeWidth={1.5}
                                    />
                                    <input
                                        type="text"
                                        placeholder={t("offres_etudiant.search_placeholder")}
                                        value={recherche}
                                        onChange={({ target }) => setRecherche(target.value)}
                                        className="ds-input pl-10 pr-9 py-2 text-xs"
                                    />
                                    {recherche && (
                                        <button
                                            type="button"
                                            onClick={() => setRecherche("")}
                                            aria-label={t("gestionnaire_dashboard.clear_search")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/70 transition cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
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

                                                <div className="space-y-1.5 mb-4 min-w-0">
                                                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1 break-words">
                                                        {titre}
                                                    </h3>
                                                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap min-w-0">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.5} />
                                                        <span className="break-words min-w-0">{nomEntreprise}</span>
                                                        {salaire !== undefined && salaire !== null && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-emerald-700 font-bold break-words">
                                                                    {formaterSalaire(salaire)}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1 break-words">
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

                                            {ongletActif === "mes_candidatures" &&
                                                contrats.some(
                                                    (c) =>
                                                        (c.offreId === id || String(c.offreId) === String(id)) &&
                                                        c.statut === "REFUSE"
                                                ) && (
                                                    <div className="pb-3">
                                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                            <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                            <span className="line-clamp-1">
                                                                {t("contrats_etudiant.refused_badge_text")}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                                                {ongletActif === "mes_candidatures" &&
                                                    statutCandidature === "EN_ATTENTE_CHOIX_STAGE" &&
                                                    !aStageEnCoursOuTrouve &&
                                                    candidature?.id && (
                                                        <button
                                                            type="button"
                                                            id={`btn-choisir-stage-${candidature.id}`}
                                                            onClick={() => handleChoisirStageDepuisCarte(candidature.id)}
                                                            disabled={choosingCandidatureId === candidature.id}
                                                            className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-xs py-2 px-4"
                                                        >
                                                            {choosingCandidatureId === candidature.id ? (
                                                                <>
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    <span>{t("candidature_etudiant.choosing_stage")}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span>{t("candidature_etudiant.btn_choose_stage")}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
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
                onChoisirStageSucces={handleChoisirStageSucces}
                aDejaStageChoisi={aStageEnCoursOuTrouve}
                contrats={contrats}
            />
        </div>
    );
}
