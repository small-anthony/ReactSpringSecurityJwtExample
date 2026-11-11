import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EvaluationStagiaire from "../../../components/page/EvaluationStagiaire.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import { getStagiaire, getEvaluation, soumettreEvaluation } from "../../../services/api/EvaluationAPI.js";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (cle) => cle,
        i18n: { language: "fr" }
    })
}));

vi.mock("../../../services/api/EvaluationAPI.js", () => ({
    getStagiaire: vi.fn(),
    getEvaluation: vi.fn(),
    soumettreEvaluation: vi.fn()
}));

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({}))
};

const CRITERES = [
    "PLANIFIER_ORGANISER",
    "COMPRENDRE_DIRECTIVES",
    "RYTHME_SOUTENU",
    "ETABLIR_PRIORITES",
    "RESPECTER_ECHEANCIERS",
    "RESPECTER_MANDATS",
    "ATTENTION_DETAILS",
    "VERIFIER_TRAVAIL",
    "OCCASIONS_PERFECTIONNEMENT",
    "ANALYSE_PROBLEMES",
    "CONTACTS_FACILES",
    "TRAVAIL_EQUIPE",
    "CULTURE_ENTREPRISE",
    "CRITIQUES_CONSTRUCTIVES",
    "RESPECT_ENVERS_LES_GENS",
    "ECOUTE_ACTIVE",
    "INTERET_MOTIVATION",
    "EXPRIMER_IDEES",
    "INITIATIVE",
    "TRAVAIL_SECURITAIRE",
    "SENS_RESPONSABILITES",
    "PONCTUALITE_ASSIDUITE"
];

const stagiaireAEvaluer = {
    contratId: 7,
    titreOffre: "Développeur Front-End React",
    nomEtudiant: "Sophie Tremblay",
    discipline: "Techniques de l'informatique",
    entreprise: "CGI Inc.",
    nomSuperviseur: "Marc Gagnon",
    telephone: "514-555-0101",
    dateDebut: "2026-05-04",
    dateFin: "2026-08-14",
    evalue: false
};

const stagiaireEvalue = { ...stagiaireAEvaluer, evalue: true };

const reponsesCompletes = (niveau) => Object.fromEntries(CRITERES.map((critere) => [critere, niveau]));

const evaluationExistante = {
    id: 1,
    contratId: 7,
    reponses: reponsesCompletes("TOTALEMENT_EN_ACCORD"),
    commentaires: { PRODUCTIVITE: "Très efficace" },
    appreciationGlobale: "DEPASSENT_LES_ATTENTES",
    precisionAppreciation: "Excellent travail",
    discuteAvecStagiaire: true,
    heuresEncadrementParSemaine: 6,
    accueilProchainStage: "OUI",
    formationTechnique: "Suffisante",
    nomSignataire: "Marc Gagnon",
    fonctionSignataire: "Directeur technique",
    dateEvaluation: "2026-08-20T10:00:00"
};

const MockEvaluationStagiaire = () => (
    <AuthServiceContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={["/employeur/stagiaires/7/evaluation"]}>
            <Routes>
                <Route path="/employeur/stagiaires/:contratId/evaluation" element={<EvaluationStagiaire />} />
                <Route path="/employeur/stagiaires" element={<div>page-stagiaires</div>} />
            </Routes>
        </MemoryRouter>
    </AuthServiceContext.Provider>
);

const choisir = (libelle) => fireEvent.click(screen.getByRole("radio", { name: libelle }));

const remplirFormulaireValide = () => {
    CRITERES.forEach((critere) => {
        choisir(`evaluation.criteres.${critere} : evaluation.levels.PLUTOT_EN_ACCORD`);
    });
    choisir("evaluation.overall.options.DEPASSENT_LES_ATTENTES");
    choisir("evaluation.discussed.label : evaluation.discussed.yes");
    fireEvent.change(screen.getByLabelText("evaluation.hours.label"), { target: { value: "7,5" } });
    choisir("evaluation.next_internship.label : evaluation.next_internship.options.OUI");
    fireEvent.change(screen.getByLabelText("evaluation.signatory.role"), {
        target: { value: "Directeur technique" }
    });
};

const chargerFormulaireVide = async () => {
    getStagiaire.mockResolvedValueOnce(stagiaireAEvaluer);
    render(<MockEvaluationStagiaire />);
    await screen.findByText("evaluation.title");
};

vi.setConfig({ testTimeout: 20000 });

describe("EvaluationStagiaire", () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("formulaire d'évaluation", () => {
        it("devrait afficher les informations du stagiaire et les 22 critères", async () => {
            // Arrange & Act
            await chargerFormulaireVide();

            // Assert
            expect(getStagiaire).toHaveBeenCalledWith("7", {});
            expect(getEvaluation).not.toHaveBeenCalled();
            expect(screen.getByText("Sophie Tremblay")).toBeInTheDocument();
            expect(screen.getByText("CGI Inc.")).toBeInTheDocument();
            expect(screen.getByText("Développeur Front-End React")).toBeInTheDocument();
            CRITERES.forEach((critere) => {
                expect(screen.getByText(new RegExp(`evaluation\\.criteres\\.${critere}$`))).toBeInTheDocument();
            });
            expect(screen.getAllByLabelText("evaluation.comments")).toHaveLength(4);
            expect(screen.getByRole("button", { name: "evaluation.submit" })).toBeInTheDocument();
        });

        it("devrait préremplir le nom du signataire avec le superviseur", async () => {
            // Arrange & Act
            await chargerFormulaireVide();

            // Assert
            expect(screen.getByLabelText("evaluation.signatory.name")).toHaveValue("Marc Gagnon");
            expect(screen.getByLabelText("evaluation.signatory.role")).toHaveValue("");
        });

        it("devrait afficher les erreurs de validation sans appeler l'API si le formulaire est vide", async () => {
            // Arrange
            await chargerFormulaireVide();

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            const alerte = await screen.findByRole("alert");
            expect(within(alerte).getByText("evaluation.errors.incomplete")).toBeInTheDocument();
            expect(within(alerte).getByText("evaluation.errors.overall")).toBeInTheDocument();
            expect(within(alerte).getByText("evaluation.errors.discussed")).toBeInTheDocument();
            expect(within(alerte).getByText("evaluation.errors.hours")).toBeInTheDocument();
            expect(within(alerte).getByText("evaluation.errors.next_internship")).toBeInTheDocument();
            expect(within(alerte).getByText("evaluation.errors.role")).toBeInTheDocument();
            expect(soumettreEvaluation).not.toHaveBeenCalled();
        });

        it("devrait refuser un nombre d'heures invalide", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            fireEvent.change(screen.getByLabelText("evaluation.hours.label"), { target: { value: "abc" } });

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            const alerte = await screen.findByRole("alert");
            expect(within(alerte).getByText("evaluation.errors.hours")).toBeInTheDocument();
            expect(soumettreEvaluation).not.toHaveBeenCalled();
        });

        it("devrait refuser un nombre d'heures négatif", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            fireEvent.change(screen.getByLabelText("evaluation.hours.label"), { target: { value: "-2" } });

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            expect(await screen.findByText("evaluation.errors.hours")).toBeInTheDocument();
            expect(soumettreEvaluation).not.toHaveBeenCalled();
        });

        it("devrait refuser un nom de signataire vide", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            fireEvent.change(screen.getByLabelText("evaluation.signatory.name"), { target: { value: "  " } });

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            expect(await screen.findByText("evaluation.errors.name")).toBeInTheDocument();
            expect(soumettreEvaluation).not.toHaveBeenCalled();
        });

        it("devrait indiquer le nombre de critères restants à répondre", async () => {
            // Arrange
            await chargerFormulaireVide();
            choisir("evaluation.criteres.PLANIFIER_ORGANISER : evaluation.levels.PLUTOT_EN_ACCORD");

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            expect(await screen.findByText("evaluation.errors.incomplete")).toBeInTheDocument();
            expect(screen.getByText("1 / 5")).toBeInTheDocument();
        });

        it("devrait soumettre l'évaluation complète avec les bonnes données", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            fireEvent.change(screen.getAllByLabelText("evaluation.comments")[0], {
                target: { value: "Bon rythme" }
            });
            soumettreEvaluation.mockResolvedValueOnce({
                ...evaluationExistante,
                reponses: reponsesCompletes("PLUTOT_EN_ACCORD"),
                heuresEncadrementParSemaine: 7.5
            });

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            await waitFor(() => expect(soumettreEvaluation).toHaveBeenCalledTimes(1));
            const [contratId, donnees, authHeader] = soumettreEvaluation.mock.calls[0];
            expect(contratId).toBe("7");
            expect(authHeader).toEqual({});
            expect(Object.keys(donnees.reponses)).toHaveLength(22);
            expect(donnees.reponses.PLANIFIER_ORGANISER).toBe("PLUTOT_EN_ACCORD");
            expect(donnees.commentaires.PRODUCTIVITE).toBe("Bon rythme");
            expect(donnees.appreciationGlobale).toBe("DEPASSENT_LES_ATTENTES");
            expect(donnees.discuteAvecStagiaire).toBe(true);
            expect(donnees.heuresEncadrementParSemaine).toBe(7.5);
            expect(donnees.accueilProchainStage).toBe("OUI");
            expect(donnees.nomSignataire).toBe("Marc Gagnon");
            expect(donnees.fonctionSignataire).toBe("Directeur technique");
        });

        it("devrait afficher le message de succès et passer en lecture seule après la soumission", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            soumettreEvaluation.mockResolvedValueOnce(evaluationExistante);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            expect(await screen.findByText("evaluation.success")).toBeInTheDocument();
            expect(screen.getByText("evaluation.title_view")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "evaluation.submit" })).not.toBeInTheDocument();
            expect(screen.getByLabelText("evaluation.signatory.role")).toBeDisabled();
        });

        it("devrait afficher le message d'erreur du serveur si la soumission échoue", async () => {
            // Arrange
            await chargerFormulaireVide();
            remplirFormulaireValide();
            soumettreEvaluation.mockRejectedValueOnce(new Error("Ce stagiaire a déjà été évalué"));

            // Act
            fireEvent.click(screen.getByRole("button", { name: "evaluation.submit" }));

            // Assert
            const alerte = await screen.findByRole("alert");
            expect(within(alerte).getByText("Ce stagiaire a déjà été évalué")).toBeInTheDocument();
            expect(screen.queryByText("evaluation.success")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: "evaluation.submit" })).toBeEnabled();
        });
    });

    describe("consultation d'une évaluation existante", () => {
        beforeEach(() => {
            getStagiaire.mockResolvedValueOnce(stagiaireEvalue);
            getEvaluation.mockResolvedValueOnce(evaluationExistante);
        });

        it("devrait charger l'évaluation et afficher le titre de consultation", async () => {
            // Act
            render(<MockEvaluationStagiaire />);

            // Assert
            expect(await screen.findByText("evaluation.title_view")).toBeInTheDocument();
            expect(getEvaluation).toHaveBeenCalledWith("7", {});
            expect(screen.getByText("evaluation.submitted_on")).toBeInTheDocument();
            expect(screen.queryByText("evaluation.success")).not.toBeInTheDocument();
        });

        it("devrait afficher les réponses enregistrées en lecture seule", async () => {
            // Act
            render(<MockEvaluationStagiaire />);
            await screen.findByText("evaluation.title_view");

            // Assert
            const reponse = screen.getByRole("radio", {
                name: "evaluation.criteres.PLANIFIER_ORGANISER : evaluation.levels.TOTALEMENT_EN_ACCORD"
            });
            expect(reponse).toBeChecked();
            expect(reponse).toBeDisabled();
            expect(screen.getByRole("radio", { name: "evaluation.overall.options.DEPASSENT_LES_ATTENTES" })).toBeChecked();
            expect(
                screen.getByRole("radio", { name: "evaluation.discussed.label : evaluation.discussed.yes" })
            ).toBeChecked();
            expect(
                screen.getByRole("radio", {
                    name: "evaluation.next_internship.label : evaluation.next_internship.options.OUI"
                })
            ).toBeChecked();
            expect(screen.getByLabelText("evaluation.hours.label")).toHaveValue("6");
            expect(screen.getByLabelText("evaluation.hours.label")).toBeDisabled();
            expect(screen.getByLabelText("evaluation.signatory.name")).toHaveValue("Marc Gagnon");
            expect(screen.getByLabelText("evaluation.signatory.role")).toHaveValue("Directeur technique");
            expect(screen.getByLabelText("evaluation.overall.precision")).toHaveValue("Excellent travail");
            expect(screen.getAllByLabelText("evaluation.comments")[0]).toHaveValue("Très efficace");
        });

        it("ne devrait pas afficher le bouton d'enregistrement", async () => {
            // Act
            render(<MockEvaluationStagiaire />);
            await screen.findByText("evaluation.title_view");

            // Assert
            expect(screen.queryByRole("button", { name: "evaluation.submit" })).not.toBeInTheDocument();
        });
    });

    describe("erreurs de chargement", () => {
        it("devrait afficher l'erreur et le lien de retour si le stagiaire est introuvable", async () => {
            // Arrange
            getStagiaire.mockRejectedValueOnce(new Error("Stagiaire introuvable"));

            // Act
            render(<MockEvaluationStagiaire />);

            // Assert
            const alerte = await screen.findByRole("alert");
            expect(within(alerte).getByText("Stagiaire introuvable")).toBeInTheDocument();
            expect(screen.getByRole("link", { name: "evaluation.back" })).toHaveAttribute(
                "href",
                "/employeur/stagiaires"
            );
            expect(screen.queryByRole("button", { name: "evaluation.submit" })).not.toBeInTheDocument();
        });

        it("devrait afficher l'erreur si l'évaluation existante ne peut pas être chargée", async () => {
            // Arrange
            getStagiaire.mockResolvedValueOnce(stagiaireEvalue);
            getEvaluation.mockRejectedValueOnce(new Error("Aucune évaluation pour ce stagiaire"));

            // Act
            render(<MockEvaluationStagiaire />);

            // Assert
            expect(await screen.findByText("Aucune évaluation pour ce stagiaire")).toBeInTheDocument();
        });
    });

    it("devrait naviguer vers la liste des stagiaires avec le lien de retour", async () => {
        // Arrange
        await chargerFormulaireVide();

        // Act
        fireEvent.click(screen.getByRole("link", { name: "evaluation.back" }));

        // Assert
        expect(await screen.findByText("page-stagiaires")).toBeInTheDocument();
    });
});
