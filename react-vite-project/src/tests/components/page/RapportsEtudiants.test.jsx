import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const mockEtudiants = [
    {
        id: 1,
        firstName: "Jean",
        lastName: "Tremblay",
        email: "jean.tremblay@test.ca",
        matricule: 1234567,
        discipline: "INFORMATIQUE",
        statutStage: "STAGE_TROUVE",
        candidatures: [
            { id: 10, titreOffre: "Développeur Fullstack", nomEntreprise: "CGI", statut: "EMBAUCHEE", dateCandidature: "2026-02-15T10:00:00" }
        ]
    },
    {
        id: 2,
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie.martin@test.ca",
        matricule: 7654321,
        discipline: "INFORMATIQUE",
        statutStage: "EN_ATTENTE_ENTREVUE",
        candidatures: [
            { id: 11, titreOffre: "Analyste QA", nomEntreprise: "Desjardins", statut: "EN_ATTENTE", dateCandidature: "2026-03-01T14:30:00" }
        ]
    },
    {
        id: 3,
        firstName: "Alex",
        lastName: "Roy",
        email: "alex.roy@test.ca",
        matricule: 9876543,
        discipline: "INFORMATIQUE",
        statutStage: "AUCUNE_CANDIDATURE",
        candidatures: []
    }
];

const renderComponent = () => {
    return render(
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <RapportsEtudiants />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

describe("RapportsEtudiants (Tableau de bord Gestionnaire)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        OffreStageService.getAnneesGestionnaire.mockResolvedValue([2026, 2025]);
        GestionnaireService.getRapportEtudiants.mockResolvedValue(mockEtudiants);
        i18n.changeLanguage("fr");
    });

    it("devrait afficher le titre, les cartes KPI et la liste des étudiants", async () => {
        renderComponent();

        expect(await screen.findByText("Suivi des étudiants")).toBeInTheDocument();
        expect(screen.getByText("Jean Tremblay")).toBeInTheDocument();
        expect(screen.getByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("Alex Roy")).toBeInTheDocument();

        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("devrait filtrer les étudiants par statut lors du clic sur une carte KPI", async () => {
        renderComponent();

        await screen.findByText("Jean Tremblay");

        const boutonStageTrouve = screen.getByRole("button", { name: /stage trouvé/i });
        fireEvent.click(boutonStageTrouve);

        expect(screen.getByText("Jean Tremblay")).toBeInTheDocument();
        expect(screen.queryByText("Sophie Martin")).not.toBeInTheDocument();
        expect(screen.queryByText("Alex Roy")).not.toBeInTheDocument();
    });

    it("devrait filtrer les étudiants avec la barre de recherche", async () => {
        renderComponent();

        await screen.findByText("Jean Tremblay");

        const champRecherche = screen.getByPlaceholderText(/rechercher par nom/i);
        fireEvent.change(champRecherche, { target: { value: "Martin" } });

        expect(screen.getByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.queryByText("Jean Tremblay")).not.toBeInTheDocument();
        expect(screen.queryByText("Alex Roy")).not.toBeInTheDocument();
    });

    it("devrait afficher un message si aucun étudiant ne correspond aux critères", async () => {
        renderComponent();

        await screen.findByText("Jean Tremblay");

        const champRecherche = screen.getByPlaceholderText(/rechercher par nom/i);
        fireEvent.change(champRecherche, { target: { value: "Introuvable" } });

        expect(screen.getByText("Aucun étudiant ne correspond aux critères sélectionnés.")).toBeInTheDocument();
    });

    it("devrait ouvrir la modale des candidatures lors du clic sur le bouton de candidature", async () => {
        renderComponent();

        await screen.findByText("Jean Tremblay");

        const boutonsCandidatures = screen.getAllByRole("button", { name: /voir \(1\)/i });
        fireEvent.click(boutonsCandidatures[0]);

        expect(screen.getByText("Développeur Fullstack")).toBeInTheDocument();
        expect(screen.getByText("CGI")).toBeInTheDocument();

        const boutonFermer = screen.getByRole("button", { name: /fermer/i });
        fireEvent.click(boutonFermer);

        await waitFor(() => {
            expect(screen.queryByText("Développeur Fullstack")).not.toBeInTheDocument();
        });
    });

    it("devrait afficher un message d'erreur si la récupération échoue", async () => {
        GestionnaireService.getRapportEtudiants.mockRejectedValue(new Error("Erreur réseau"));
        renderComponent();

        expect(await screen.findByText("Erreur lors du chargement des données des étudiants.")).toBeInTheDocument();
    });
});
