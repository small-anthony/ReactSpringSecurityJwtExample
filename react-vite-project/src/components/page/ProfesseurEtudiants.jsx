import React, { useState, useEffect, useContext } from "react";
import { Users, GraduationCap, Briefcase, Building2, Calendar, Mail, Search, ChevronDown, ChevronUp, CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import { getEtudiantsAssignes, getAnneesProfesseur } from "../../services/api/ProfesseurService.js";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import { useOffreFormater } from "../../hooks/useOffreFormater.js";

export default function ProfesseurEtudiants() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);
    const { traduireDiscipline } = useOffreFormater();
    const userData = authService.getUserData();

    const [etudiants, setEtudiants] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [etudiantDeplieId, setEtudiantDeplieId] = useState(null);

    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            const data = await getEtudiantsAssignes(authHeader, anneeChoisie);
            setEtudiants(data || []);
        } catch (err) {
            setErreur(err.message || t("professeur.erreur_chargement"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, [authService, anneeChoisie]);

    useEffect(() => {
        const authHeader = authService.buildAuthHeader();
        getAnneesProfesseur(authHeader)
            .then((data) => {
                setAnnees(data || []);
                if (data && data.length > 0 && anneeChoisie === null) {
                    setAnneeChoisie(data[0]);
                }
            })
            .catch(() => setAnnees([]));
    }, [authService]);

    const etudiantsFiltres = etudiants.filter((e) => {
        const query = recherche.trim().toLowerCase();
        if (!query) return true;
        const nom = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
        const matricule = (e.matricule || "").toString();
        const entreprise = (e.entrepriseStage || "").toLowerCase();
        const titre = (e.titreOffreStage || "").toLowerCase();
        return (
            nom.includes(query) ||
            matricule.includes(query) ||
            entreprise.includes(query) ||
            titre.includes(query)
        );
    });

    const toggleDeplier = (id) => {
        setEtudiantDeplieId((prev) => (prev === id ? null : id));
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case "EMBAUCHEE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("professeur.statut.EMBAUCHEE")}
                    </span>
                );
            case "ACCEPTEE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t("professeur.statut.ACCEPTEE")}
                    </span>
                );
            case "EN_ATTENTE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        {t("professeur.statut.EN_ATTENTE")}
                    </span>
                );
            case "EN_ATTENTE_REPONSE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        <Clock className="w-3.5 h-3.5" />
                        {t("professeur.statut.EN_ATTENTE_REPONSE")}
                    </span>
                );
            case "REFUSEE":
            case "REFUSE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t("professeur.statut.REFUSEE")}
                    </span>
                );
            case "EN_RECHERCHE":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        {t("professeur.statut.EN_RECHERCHE")}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        <Clock className="w-3.5 h-3.5" />
                        {statut ? t(`professeur.statut.${statut}`) : t("common.not_available")}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/40 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {t("professeur.badge_role")}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            {t("professeur.titre_page")}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("professeur.bienvenue", {
                                nom: userData ? `${userData.firstName} ${userData.lastName}` : ""
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <SelecteurSession
                            annees={annees}
                            anneeSelectionnee={anneeChoisie}
                            onChangementAnnee={setAnneeChoisie}
                        />
                    </div>
                </div>

                {erreur && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{erreur}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            placeholder={t("professeur.recherche_placeholder")}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition shadow-xs"
                        />
                    </div>

                    <div className="text-xs font-semibold text-gray-500 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-xs">
                        {t("professeur.total_etudiants", {
                            count: etudiantsFiltres.length
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                        <p className="text-sm font-medium">
                            {t("professeur.chargement")}
                        </p>
                    </div>
                ) : etudiantsFiltres.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3 shadow-xs">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {t("professeur.aucun_etudiant_titre")}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md">
                            {recherche
                                ? t("professeur.aucun_resultat_recherche")
                                : t("professeur.aucun_etudiant_description")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {etudiantsFiltres.map((etudiant) => {
                            const estDeplie = etudiantDeplieId === etudiant.id;
                            const candidatures = etudiant.candidatures || [];

                            return (
                                <div
                                    key={etudiant.id}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition duration-150 overflow-hidden"
                                >
                                    <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0">
                                                {(etudiant.firstName || "").charAt(0)}
                                                {(etudiant.lastName || "").charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {etudiant.firstName} {etudiant.lastName}
                                                    </h3>
                                                    {getStatutBadge(etudiant.statutStage)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        {etudiant.email}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Matricule: {etudiant.matricule || "—"}</span>
                                                    {etudiant.discipline && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-gray-700">
                                                                {traduireDiscipline(etudiant.discipline)}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                                            <div className="bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-200/80 text-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                    <span>{etudiant.entrepriseStage || "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-600 mt-0.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate max-w-xs">{etudiant.titreOffreStage || "—"}</span>
                                                </div>
                                            </div>

                                            {candidatures.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeplier(etudiant.id)}
                                                    className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-300 transition duration-150 cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-xs"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>
                                                        {t("professeur.btn_demandes", {
                                                            count: candidatures.length
                                                        })}
                                                    </span>
                                                    {estDeplie ? (
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {estDeplie && candidatures.length > 0 && (
                                        <div className="px-5 sm:px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-100 animate-in fade-in duration-150">
                                            <h4 className="text-xs uppercase tracking-wider font-bold text-gray-600 mb-3">
                                                {t("professeur.historique_demandes")}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {candidatures.map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="p-3.5 bg-white rounded-xl border border-gray-200 text-xs shadow-xs space-y-1.5"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="font-bold text-gray-900 truncate">
                                                                    {c.titreOffre || c.offreTitre || t("professeur.offre_stage_defaut")}
                                                                </span>
                                                                {c.anneeOffre && (
                                                                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                        {t("session.libelle", { annee: c.anneeOffre })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {getStatutBadge(c.statut)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span>{c.nomEntreprise || "Entreprise"}</span>
                                                        </div>
                                                        {(c.dateCandidature || c.datePostulation) && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>
                                                                    {t("professeur.postule_le", {
                                                                        date: new Date(c.dateCandidature || c.datePostulation).toLocaleDateString()
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
