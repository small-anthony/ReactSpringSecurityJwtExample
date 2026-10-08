import { useEffect, useState, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getStatutCv, getOffresDisponibles, getMesCandidatures } from "../../services/api/EtudiantService.js";
import ModalDetailOffre from "../modal/ModalDetailOffre.jsx";
import { DISCIPLINES } from "../../constants/disciplines";
import { DUREES } from "../../constants/durees";
import {
    Briefcase,
    Search,
    Building2,
    GraduationCap,
    Clock,
    DollarSign,
    AlertTriangle,
    Clock3,
    XCircle,
    ArrowRight,
    FilterX,
    FileText,
    CheckCircle2
} from "lucide-react";

export default function OffreStagesEtudiant() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [cvStatut, setCvStatut] = useState(null);
    const [offres, setOffres] = useState([]);
    const [mesCandidaturesIds, setMesCandidaturesIds] = useState([]);
    const [ongletActif, setOngletActif] = useState("toutes");
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

            const statut = await getStatutCv(authHeader);
            setCvStatut(statut);

            if (statut && statut.hasCv && statut.status === "ACCEPTE") {
                const listeOffres = await getOffresDisponibles(authHeader);
                setOffres(listeOffres || []);

                try {
                    const mesCandidatures = await getMesCandidatures(authHeader);
                    const ids = (mesCandidatures || []).map((c) => c.id);
                    setMesCandidaturesIds(ids);
                } catch {
                    setMesCandidaturesIds([]);
                }
            }
        } catch (err) {
            console.error("Erreur chargement offres:", err);
            setErreur(t("offres_etudiant.error_fetch"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, [authService]);

    const handlePostulerSucces = (offreId) => {
        setMesCandidaturesIds((prev) => (prev.includes(offreId) ? prev : [...prev, offreId]));
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
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
        });
    }, [offres]);

    const offresFiltrees = useMemo(() => {
        return offres.filter((offre) => {
            if (ongletActif === "mes_candidatures" && !mesCandidaturesIds.includes(offre.id)) {
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

    const traduireDiscipline = (valeur) => {
        const disc = DISCIPLINES.find((d) => d.value === valeur);
        return t(`signup_etudiant.disciplines.${disc ? disc.labelKey : valeur}`, valeur);
    };

    const traduireDuree = (valeur) => {
        const nombre = parseInt(valeur, 10);
        return Number.isNaN(nombre) ? valeur : t("creer_offre.weeks", { count: nombre });
    };

    const hasCv = cvStatut?.hasCv;
    const status = cvStatut?.status;
    const motifRefus = cvStatut?.motifRefus;

    return (
        <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-3">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{t("offres_etudiant.badge")}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                        {t("offres_etudiant.title")}
                    </h1>
                    <p className="mt-2 text-base text-gray-600 max-w-2xl">
                        {t("offres_etudiant.subtitle")}
                    </p>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-500">
                            {t("offres_etudiant.loading")}
                        </p>
                    </div>
                )}

                {erreur && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-sm font-semibold">{erreur}</p>
                    </div>
                )}

                {!loading && !erreur && (
                    <div className="space-y-6">
                        {!hasCv && (
                            <div className="bg-white p-8 rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {t("offres_etudiant.cv_manquant_title")}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1 max-w-xl">
                                            {t("offres_etudiant.cv_manquant_desc")}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/etudiant/profile"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition shrink-0 cursor-pointer"
                                >
                                    <span>{t("offres_etudiant.btn_deposer_cv")}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        {hasCv && status === "EN_ATTENTE" && (
                            <div className="bg-white p-8 rounded-2xl border border-blue-200 shadow-xs flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Clock3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {t("offres_etudiant.cv_attente_title")}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                                        {t("offres_etudiant.cv_attente_desc")}
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasCv && status === "REFUSE" && (
                            <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <XCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-900">
                                            {t("offres_etudiant.cv_refuse_title")}
                                        </h3>
                                        <p className="text-sm font-semibold text-red-700 mt-1">
                                            {motifRefus
                                                ? t("offres_etudiant.cv_refuse_motif", { motif: motifRefus })
                                                : t("offres_etudiant.cv_refuse_no_motif")}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-2 max-w-xl">
                                            {t("offres_etudiant.cv_refuse_desc")}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/etudiant/profile"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition shrink-0 cursor-pointer"
                                >
                                    <span>{t("offres_etudiant.btn_maj_cv")}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        {hasCv && status === "ACCEPTE" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                                    <button
                                        onClick={() => setOngletActif("toutes")}
                                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${ongletActif === "toutes"
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                    >
                                        {t("offres_etudiant.tab_all_offers")}
                                    </button>
                                    <button
                                        onClick={() => setOngletActif("mes_candidatures")}
                                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${ongletActif === "mes_candidatures"
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                    >
                                        {t("offres_etudiant.tab_my_applications", { count: mesCandidaturesIds.length })}
                                    </button>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder={t("offres_etudiant.search_placeholder")}
                                            value={recherche}
                                            onChange={(e) => setRecherche(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <select
                                            value={filtreEntreprise}
                                            onChange={(e) => setFiltreEntreprise(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">{t("offres_etudiant.all_companies")}</option>
                                            {entreprisesUniques.map((entreprise) => (
                                                <option key={entreprise} value={entreprise}>{entreprise}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filtreDiscipline}
                                            onChange={(e) => setFiltreDiscipline(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">{t("offres_etudiant.all_disciplines")}</option>
                                            {disciplinesUniques.map((discipline) => (
                                                <option key={discipline} value={discipline}>{traduireDiscipline(discipline)}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={filtreDuree}
                                            onChange={(e) => setFiltreDuree(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">{t("offres_etudiant.all_durations")}</option>
                                            {dureesUniques.map((duree) => (
                                                <option key={duree} value={duree}>{traduireDuree(duree)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {aDesFiltresActifs && (
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                                            <span>
                                                {t(offresFiltrees.length > 1 ? "offres_etudiant.offers_count_plural" : "offres_etudiant.offers_count", {
                                                    count: offresFiltrees.length
                                                })}
                                            </span>
                                            <button
                                                onClick={reinitialiserFiltres}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                            >
                                                <FilterX className="w-3.5 h-3.5" />
                                                <span>{t("offres_etudiant.reset_filters")}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {offresFiltrees.length === 0 ? (
                                    <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center space-y-3">
                                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            {ongletActif === "mes_candidatures"
                                                ? t("offres_etudiant.tab_my_applications", { count: 0 })
                                                : t("offres_etudiant.empty_title")}
                                        </h3>
                                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                                            {ongletActif === "mes_candidatures"
                                                ? t("offres_etudiant.empty_applied")
                                                : aDesFiltresActifs
                                                    ? t("offres_etudiant.empty_filtered")
                                                    : t("offres_etudiant.empty_none")}
                                        </p>
                                        {aDesFiltresActifs && (
                                            <button
                                                onClick={reinitialiserFiltres}
                                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                                            >
                                                <FilterX className="w-3.5 h-3.5" />
                                                <span>{t("offres_etudiant.reset_filters")}</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {offresFiltrees.map((offre) => (
                                            <div
                                                key={offre.id}
                                                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between p-6 space-y-4"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {mesCandidaturesIds.includes(offre.id) && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                <span>{t("offres_etudiant.applied_badge")}</span>
                                                            </span>
                                                        )}
                                                        {offre.discipline && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                                                <GraduationCap className="w-3 h-3" />
                                                                <span>{traduireDiscipline(offre.discipline)}</span>
                                                            </span>
                                                        )}
                                                        {offre.duree && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{traduireDuree(offre.duree)}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                            {offre.titre}
                                                        </h3>
                                                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            <span>{offre.nomEntreprise}</span>
                                                        </p>
                                                    </div>

                                                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                                                        {offre.description}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                                                        <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{offre.salaire || t("offres_etudiant.salary_to_discuss")}</span>
                                                    </div>

                                                    <button
                                                        onClick={() => setOffreSelectionnee(offre)}
                                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                                                    >
                                                        {t("offres_etudiant.btn_see_details")}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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