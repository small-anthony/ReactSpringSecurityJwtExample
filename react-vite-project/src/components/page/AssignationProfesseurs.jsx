import React, { useState, useEffect, useContext, useMemo } from "react";
import {
    GraduationCap,
    Search,
    X,
    AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthServiceContext } from "../../services/AuthService.tsx";
import {
    getEtudiantsPourAssignation,
    getProfesseursPourAssignation,
    assignerProfesseur,
    modifierAssignationProfesseur,
    desassignerProfesseur
} from "../../services/api/GestionnaireService.js";
import { getAnneesGestionnaire } from "../../services/api/OffreStageService.js";
import SidePanelGestionnaire from "../widget/SidePanelGestionnaire.jsx";
import SelecteurSession from "../widget/SelecteurSession.jsx";
import StatsAssignationProfesseurs from "../widget/StatsAssignationProfesseurs.jsx";
import TableEtudiantsAssignation from "../widget/TableEtudiantsAssignation.jsx";
import ModalAssignerProfesseur from "../modal/ModalAssignerProfesseur.jsx";

export default function AssignationProfesseurs() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

    const [etudiants, setEtudiants] = useState([]);
    const [professeurs, setProfesseurs] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);

    const [rechercheEtudiant, setRechercheEtudiant] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("tous");

    const [modalOuvert, setModalOuvert] = useState(false);
    const [etudiantEnCours, setEtudiantEnCours] = useState(null);
    const [professeurSelectionne, setProfesseurSelectionne] = useState(null);
    const [rechercheProfesseur, setRechercheProfesseur] = useState("");
    const [soumissionEnCours, setSoumissionEnCours] = useState(false);
    const [chargementProfs, setChargementProfs] = useState(false);

    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();

            const [etudiantsData, profsData] = await Promise.all([
                getEtudiantsPourAssignation(authHeader, anneeChoisie),
                getProfesseursPourAssignation(authHeader)
            ]);

            setEtudiants(etudiantsData || []);
            setProfesseurs(profsData || []);
        } catch (err) {
            setErreur(err.message || t("assignation_professeurs.erreur_chargement"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, [authService, anneeChoisie]);

    useEffect(() => {
        getAnneesGestionnaire(authService.buildAuthHeader())
            .then((data) => {
                setAnnees(data || []);
                if (data && data.length > 0 && anneeChoisie === null) {
                    setAnneeChoisie(data[0]);
                }
            })
            .catch(() => setAnnees([]));
    }, [authService]);

    useEffect(() => {
        if (!modalOuvert) return;
        const delayDebounce = setTimeout(async () => {
            try {
                setChargementProfs(true);
                const authHeader = authService.buildAuthHeader();
                const data = await getProfesseursPourAssignation(authHeader, rechercheProfesseur);
                setProfesseurs(data || []);
            } catch {
            } finally {
                setChargementProfs(false);
            }
        }, 250);

        return () => clearTimeout(delayDebounce);
    }, [rechercheProfesseur, modalOuvert, authService]);

    const etudiantsFiltres = useMemo(() => {
        return etudiants.filter((e) => {
            const nomComplet = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
            const matricule = (e.matricule || "").toString();
            const entreprise = (e.nomEntreprise || "").toLowerCase();
            const titre = (e.titreOffreStage || "").toLowerCase();
            const query = rechercheEtudiant.trim().toLowerCase();

            const correspondRecherche =
                !query ||
                nomComplet.includes(query) ||
                matricule.includes(query) ||
                entreprise.includes(query) ||
                titre.includes(query);

            if (!correspondRecherche) return false;

            if (filtreStatut === "assignes") return e.estAssigne;
            if (filtreStatut === "non_assignes") return !e.estAssigne;
            return true;
        });
    }, [etudiants, rechercheEtudiant, filtreStatut]);

    const stats = useMemo(() => {
        const total = etudiants.length;
        const assignes = etudiants.filter((e) => e.estAssigne).length;
        const nonAssignes = total - assignes;
        return { total, assignes, nonAssignes };
    }, [etudiants]);

    const ouvrirModalAssignation = (etudiant) => {
        setEtudiantEnCours(etudiant);
        setRechercheProfesseur("");
        if (etudiant.professeurAssigne && etudiant.professeurAssigne.id) {
            const profActuel = professeurs.find((p) => p.id === etudiant.professeurAssigne.id);
            setProfesseurSelectionne(profActuel || null);
        } else {
            setProfesseurSelectionne(null);
        }
        setModalOuvert(true);
    };

    const fermerModalAssignation = () => {
        setModalOuvert(false);
        setEtudiantEnCours(null);
        setProfesseurSelectionne(null);
        setRechercheProfesseur("");
    };

    const confirmerAssignation = async () => {
        if (!etudiantEnCours || !professeurSelectionne) return;

        try {
            setSoumissionEnCours(true);
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            const estModification = etudiantEnCours.estAssigne;

            const fn = estModification ? modifierAssignationProfesseur : assignerProfesseur;
            await fn(
                etudiantEnCours.id,
                professeurSelectionne.id,
                authHeader
            );

            fermerModalAssignation();
            await chargerDonnees();
        } catch (err) {
            setErreur(err.message || t("assignation_professeurs.erreur_assignation"));
        } finally {
            setSoumissionEnCours(false);
        }
    };

    const handleDesassigner = async (etudiant) => {
        if (!etudiant) return;

        try {
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            await desassignerProfesseur(etudiant.id, authHeader);
            await chargerDonnees();
        } catch (err) {
            setErreur(err.message || t("assignation_professeurs.erreur_desassignation"));
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/40">
            <SidePanelGestionnaire activeTab="assignationProfesseurs" />

            <main className="flex-1 p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {t("assignation_professeurs.badge_section")}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            {t("assignation_professeurs.titre")}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                            {t("assignation_professeurs.description")}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
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

                <StatsAssignationProfesseurs stats={stats} />

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={rechercheEtudiant}
                            onChange={(e) => setRechercheEtudiant(e.target.value)}
                            placeholder={t("assignation_professeurs.recherche_placeholder")}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 focus:bg-white transition"
                        />
                        {rechercheEtudiant && (
                            <button
                                type="button"
                                onClick={() => setRechercheEtudiant("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold shrink-0">
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("tous")}
                            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                filtreStatut === "tous"
                                    ? "bg-white text-blue-600 shadow-xs font-bold"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {t("assignation_professeurs.filtre_tous")} ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("non_assignes")}
                            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                filtreStatut === "non_assignes"
                                    ? "bg-white text-amber-700 shadow-xs font-bold"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {t("assignation_professeurs.filtre_non_assignes")} ({stats.nonAssignes})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("assignes")}
                            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                filtreStatut === "assignes"
                                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {t("assignation_professeurs.filtre_assignes")} ({stats.assignes})
                        </button>
                    </div>
                </div>

                <TableEtudiantsAssignation
                    etudiants={etudiantsFiltres}
                    loading={loading}
                    rechercheEtudiant={rechercheEtudiant}
                    filtreStatut={filtreStatut}
                    onAssigner={ouvrirModalAssignation}
                    onDesassigner={handleDesassigner}
                />

                <ModalAssignerProfesseur
                    isOpen={modalOuvert}
                    onClose={fermerModalAssignation}
                    etudiant={etudiantEnCours}
                    professeurs={professeurs}
                    professeurSelectionne={professeurSelectionne}
                    onSelectProfesseur={setProfesseurSelectionne}
                    rechercheProfesseur={rechercheProfesseur}
                    onRechercheChange={setRechercheProfesseur}
                    chargementProfs={chargementProfs}
                    onConfirmer={confirmerAssignation}
                    soumissionEnCours={soumissionEnCours}
                />
            </main>
        </div>
    );
}
