import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EmployeurStagiaires from "../../../components/page/EmployeurStagiaires.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import { getStagiaires } from "../../../services/api/EvaluationAPI.js";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (cle) => cle,
        i18n: { language: "fr" }
    })
}));

vi.mock("../../../services/api/EvaluationAPI.js", () => ({
    getStagiaires: vi.fn()
}));

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const stagiaireAEvaluer = {
    contratId: 1,
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

const stagiaireEvalue = {
    ...stagiaireAEvaluer,
    contratId: 2,
    nomEtudiant: "Lucas Bernard",
    titreOffre: "Analyste QA Logiciel",
    evalue: true
};

const MockEmployeurStagiaires = () => (
    <AuthServiceContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={["/employeur/stagiaires"]}>
            <Routes>
                <Route path="/employeur/stagiaires" element={<EmployeurStagiaires />} />
                <Route
                    path="/employeur/stagiaires/:contratId/evaluation"
                    element={<div>page-evaluation</div>}
                />
            </Routes>
        </MemoryRouter>
    </AuthServiceContext.Provider>
);

describe("EmployeurStagiaires", () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher les stagiaires retournés par l'API", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer, stagiaireEvalue]);

        // Act
        render(<MockEmployeurStagiaires />);

        // Assert
        expect(await screen.findByText("Sophie Tremblay")).toBeInTheDocument();
        expect(screen.getByText("Lucas Bernard")).toBeInTheDocument();
        expect(screen.getByText("Développeur Front-End React")).toBeInTheDocument();
        expect(screen.getAllByText("CGI Inc.")).toHaveLength(2);
        expect(getStagiaires).toHaveBeenCalledWith({ Authorization: "Bearer token123" });
    });

    it("devrait afficher le message d'état vide s'il n'y a aucun stagiaire", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([]);

        // Act
        render(<MockEmployeurStagiaires />);

        // Assert
        expect(await screen.findByText("stagiaires.empty.title")).toBeInTheDocument();
    });

    it("devrait afficher le message d'erreur si le chargement échoue", async () => {
        // Arrange
        getStagiaires.mockRejectedValueOnce(new Error("Erreur lors de la récupération de vos stagiaires"));

        // Act
        render(<MockEmployeurStagiaires />);

        // Assert
        expect(await screen.findByText("Erreur lors de la récupération de vos stagiaires")).toBeInTheDocument();
    });

    it("devrait afficher le bon badge et le bon bouton selon l'état d'évaluation", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer, stagiaireEvalue]);

        // Act
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Assert
        expect(screen.getByText("stagiaires.status.to_evaluate")).toBeInTheDocument();
        expect(screen.getByText("stagiaires.status.evaluated")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "stagiaires.actions.evaluate" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "stagiaires.actions.view" })).toBeInTheDocument();
    });

    it("devrait afficher le nombre de stagiaires dans chaque onglet", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer, stagiaireEvalue, { ...stagiaireEvalue, contratId: 3 }]);

        // Act
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Assert
        expect(screen.getByRole("button", { name: /stagiaires\.tabs\.all.*\(3\)/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /stagiaires\.tabs\.to_evaluate.*\(1\)/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /stagiaires\.tabs\.evaluated.*\(2\)/ })).toBeInTheDocument();
    });

    it("devrait filtrer les stagiaires à évaluer avec l'onglet correspondant", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer, stagiaireEvalue]);
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Act
        fireEvent.click(screen.getByRole("button", { name: /stagiaires\.tabs\.to_evaluate/ }));

        // Assert
        expect(screen.getByText("Sophie Tremblay")).toBeInTheDocument();
        expect(screen.queryByText("Lucas Bernard")).not.toBeInTheDocument();
    });

    it("devrait filtrer les stagiaires évalués avec l'onglet correspondant", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer, stagiaireEvalue]);
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Act
        fireEvent.click(screen.getByRole("button", { name: /stagiaires\.tabs\.evaluated/ }));

        // Assert
        expect(screen.getByText("Lucas Bernard")).toBeInTheDocument();
        expect(screen.queryByText("Sophie Tremblay")).not.toBeInTheDocument();
    });

    it("devrait afficher l'état vide si aucun stagiaire ne correspond au filtre", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer]);
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Act
        fireEvent.click(screen.getByRole("button", { name: /stagiaires\.tabs\.evaluated/ }));

        // Assert
        expect(screen.getByText("stagiaires.empty.title")).toBeInTheDocument();
    });

    it("devrait naviguer vers la page d'évaluation lors du clic sur Évaluer", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireAEvaluer]);
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Sophie Tremblay");

        // Act
        fireEvent.click(screen.getByRole("button", { name: "stagiaires.actions.evaluate" }));

        // Assert
        expect(await screen.findByText("page-evaluation")).toBeInTheDocument();
    });

    it("devrait naviguer vers la page d'évaluation lors du clic sur Voir l'évaluation", async () => {
        // Arrange
        getStagiaires.mockResolvedValueOnce([stagiaireEvalue]);
        render(<MockEmployeurStagiaires />);
        await screen.findByText("Lucas Bernard");

        // Act
        fireEvent.click(screen.getByRole("button", { name: "stagiaires.actions.view" }));

        // Assert
        expect(await screen.findByText("page-evaluation")).toBeInTheDocument();
    });
});
