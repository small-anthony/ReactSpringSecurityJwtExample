import React, { useState, useEffect, useContext, useMemo } from "react";
import {
    GraduationCap,
    Search,
    X,
    CheckCircle2
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
import ModalConfirmation from "../modal/ModalConfirmation.jsx";

export default function AssignationProfesseurs() {
    const { t } = useTranslation("main");
    const authService = useContext(AuthServiceContext);

    const [etudiants, setEtudiants] = useState([]);
    const [professeurs, setProfesseurs] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [anneeChoisie, setAnneeChoisie] = useState(null);

    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [messageSucces, setMessageSucces] = useState(null);

    const [rechercheEtudiant, setRechercheEtudiant] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("tous");

    const [modalOuvert, setModalOuvert] = useState(false);
    const [etudiantEnCours, setEtudiantEnCours] = useState(null);
    const [professeurSelectionne, setProfesseurSelectionne] = useState(null);
    const [rechercheProfesseur, setRechercheProfesseur] = useState("");
    const [soumissionEnCours, setSoumissionEnCours] = useState(false);
    const [chargementProfs, setChargementProfs] = useState(false);

    const [etudiantADesassigner, setEtudiantADesassigner] = useState(null);

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
            setMessageSucces(t("assignation_professeurs.succes_assignation"));
            await chargerDonnees();
        } catch (err) {
            setErreur(err.message || t("assignation_professeurs.erreur_assignation"));
        } finally {
            setSoumissionEnCours(false);
        }
    };

    const demanderConfirmationDesassigner = (etudiant) => {
        setEtudiantADesassigner(etudiant);
    };

    const executerDesassignation = async () => {
        if (!etudiantADesassigner) return;

        try {
            setErreur(null);
            const authHeader = authService.buildAuthHeader();
            await desassignerProfesseur(etudiantADesassigner.id, authHeader);
            setEtudiantADesassigner(null);
            setMessageSucces(t("assignation_professeurs.succes_desassignation"));
            await chargerDonnees();
        } catch (err) {
            setErreur(err.message || t("assignation_professeurs.erreur_desassignation"));
            setEtudiantADesassigner(null);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
            <SidePanelGestionnaire activeTab="assignationProfesseurs" />

            <main className="flex-1 p-6 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <GraduationCap className="w-7 h-7 text-blue-600" />
                            <span>{t("assignation_professeurs.titre")}</span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {t("assignation_professeurs.description")}
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

                {messageSucces && (
                    <div className="ds-alert-success flex items-center justify-between gap-2.5" role="status">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>{messageSucces}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMessageSucces(null)}
                            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1 rounded-lg hover:bg-emerald-100/60"
                            aria-label={t("common.close")}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {erreur && (
                    <div className="ds-alert-error flex items-center justify-between gap-2.5" role="alert">
                        <span>{erreur}</span>
                        <button
                            type="button"
                            onClick={() => setErreur(null)}
                            className="text-rose-700 hover:text-rose-900 cursor-pointer p-1 rounded-lg hover:bg-rose-100/60"
                            aria-label={t("common.close")}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <StatsAssignationProfesseurs stats={stats} />

                <div className="ds-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={rechercheEtudiant}
                            onChange={(e) => setRechercheEtudiant(e.target.value)}
                            placeholder={t("assignation_professeurs.recherche_placeholder")}
                            className="ds-input pl-10 pr-10"
                        />
                        {rechercheEtudiant && (
                            <button
                                type="button"
                                onClick={() => setRechercheEtudiant("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="ds-tabs-bar shrink-0">
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("tous")}
                            className={`ds-tab ${filtreStatut === "tous" ? "ds-tab-active" : "ds-tab-inactive"}`}
                        >
                            {t("assignation_professeurs.filtre_tous")} ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("non_assignes")}
                            className={`ds-tab ${filtreStatut === "non_assignes" ? "ds-tab-active !text-amber-700" : "ds-tab-inactive"}`}
                        >
                            {t("assignation_professeurs.filtre_non_assignes")} ({stats.nonAssignes})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltreStatut("assignes")}
                            className={`ds-tab ${filtreStatut === "assignes" ? "ds-tab-active !text-emerald-700" : "ds-tab-inactive"}`}
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
                    onDesassigner={demanderConfirmationDesassigner}
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

                <ModalConfirmation
                    isOpen={Boolean(etudiantADesassigner)}
                    onClose={() => setEtudiantADesassigner(null)}
                    onConfirm={executerDesassignation}
                    type="danger"
                    title={t("assignation_professeurs.titre_modal_desassigner")}
                    message={t("assignation_professeurs.confirmation_desassigner", {
                        etudiant: etudiantADesassigner ? `${etudiantADesassigner.firstName} ${etudiantADesassigner.lastName}` : ""
                    })}
                    confirmText={t("assignation_professeurs.btn_retirer")}
                    cancelText={t("common.cancel")}
                />
            </main>
        </div>
    );
}
