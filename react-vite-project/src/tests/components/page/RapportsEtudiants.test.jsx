import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import RapportsEtudiants from "../../../components/page/RapportsEtudiants.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as GestionnaireService from "../../../services/api/GestionnaireService.js";
import * as OffreStageService from "../../../services/api/OffreStageService.js";
import i18n from "../../../../i18n.config.js";

vi.mock("../../../services/api/GestionnaireService.js");
vi.mock("../../../services/api/OffreStageService.js");

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" })),
};

const mockEtudiantsInscrits = [
    {
        id: 1,
        firstName: "Jean",
        lastName: "Tremblay",
        email: "jean.tremblay@test.ca",
        matricule: 1234567,
        discipline: "INFORMATIQUE",
        milieuEvalue: false,
        candidatures: [],
    },
    {
        id: 2,
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie.martin@test.ca",
        matricule: 7654321,
        discipline: "INFORMATIQUE",
        milieuEvalue: true,
        candidatures: [
            { id: 10, titreOffre: "Développeur Fullstack", nomEntreprise: "CGI" },
        ],
    },
];

const renderComponent = () => render(
    <AuthServiceContext.Provider value={mockAuth}>
        <BrowserRouter>
            <RapportsEtudiants />
        </BrowserRouter>
    </AuthServiceContext.Provider>
);

describe("RapportsEtudiants", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        OffreStageService.getAnneesGestionnaire.mockResolvedValue([2026, 2025]);
        GestionnaireService.getEtudiantsInscrits.mockResolvedValue(mockEtudiantsInscrits);
        GestionnaireService.getEtudiantsTrouveStage.mockResolvedValue([mockEtudiantsInscrits[1]]);
        GestionnaireService.getEtudiantsStagesNonEvaluesProfesseur.mockResolvedValue([mockEtudiantsInscrits[0]]);
        i18n.changeLanguage("fr");
    });

    it("devrait afficher le titre, le sélecteur et les étudiants inscrits par défaut", async () => {
        renderComponent();

        expect(await screen.findByText("Rapports des étudiants")).toBeInTheDocument();
        expect(screen.getByText("Jean Tremblay")).toBeInTheDocument();
        expect(screen.getByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("Total : 2 étudiants")).toBeInTheDocument();
    });

    it("devrait charger les étudiants ayant trouvé un stage avec le bouton d'évaluation du milieu", async () => {
        renderComponent();
        await screen.findByText("Jean Tremblay");

        fireEvent.change(screen.getByLabelText(/type de rapport/i), {
            target: { value: "trouve-stage" },
        });

        expect(await screen.findByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.queryByText("Jean Tremblay")).not.toBeInTheDocument();
        expect(screen.getByText("Développeur Fullstack - CGI")).toBeInTheDocument();
        expect(screen.getByText("Évalué")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /voir l'évaluation du milieu/i })).toBeInTheDocument();
    });

    it("devrait charger les stages non évalués par le professeur", async () => {
        renderComponent();
        await screen.findByText("Jean Tremblay");

        fireEvent.change(screen.getByLabelText(/type de rapport/i), {
            target: { value: "stages-non-evalues-professeur" },
        });

        expect(await screen.findByText("Non évalué")).toBeInTheDocument();
        expect(GestionnaireService.getEtudiantsStagesNonEvaluesProfesseur).toHaveBeenCalled();
    });

    it("devrait afficher un message si le rapport est vide", async () => {
        GestionnaireService.getEtudiantsInscrits.mockResolvedValue([]);
        renderComponent();

        expect(await screen.findByText("Aucun étudiant ne correspond à ce rapport pour le moment.")).toBeInTheDocument();
    });

    it("devrait afficher un message d'erreur si le chargement échoue", async () => {
        GestionnaireService.getEtudiantsInscrits.mockRejectedValue(new Error("Erreur réseau"));
        renderComponent();

        expect(await screen.findByText("Erreur lors du chargement du rapport.")).toBeInTheDocument();
    });
});
