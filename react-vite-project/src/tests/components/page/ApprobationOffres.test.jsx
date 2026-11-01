import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import ApprobationOffres from "../../../components/page/ApprobationOffres.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as OffreStageService from "../../../services/api/OffreStageService.js";
import * as EtudiantService from "../../../services/api/EtudiantService.js";
import i18n from "../../../../i18n.config.js";

vi.mock("../../../services/api/OffreStageService");
vi.mock("../../../services/api/EtudiantService");

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const MockApprobation = () => {
    return (
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <ApprobationOffres />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

const mockOffres = [
    {
        id: 1,
        titre: "Stage Développeur Web",
        nomEntreprise: "Google",
        discipline: "Techniques de l'informatique",
        salaire: "25.00 $/h",
        duree: "12 semaines",
        description: "Création d'applications React",
        exigences: "Connaître JavaScript",
        status: "EN_ATTENTE"
    }
];

describe("ApprobationOffres", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    it("should render offers when loaded", async () => {
        // Arrange
        OffreStageService.fetchOffresEnAttente.mockResolvedValueOnce(mockOffres);

        // Act
        render(<MockApprobation />);

        // Assert
        const titreElement = await screen.findByText("Stage Développeur Web");
        const entrepriseElement = screen.getByText("Google");

        expect(titreElement).toBeTruthy();
        expect(entrepriseElement).toBeTruthy();
    });

    it("should accept an offer for all students", async () => {
        // Arrange
        OffreStageService.fetchOffresEnAttente
            .mockResolvedValueOnce(mockOffres)
            .mockResolvedValueOnce([]);
        OffreStageService.accepterOffre.mockResolvedValueOnce({});

        // Act
        render(<MockApprobation />);

        const boutonAccepter = await screen.findByRole("button", { name: /approuver|accepter/i });
        fireEvent.click(boutonAccepter);

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer l'approbation/i });
        fireEvent.click(boutonConfirmer);

        // Assert
        expect(OffreStageService.accepterOffre).toHaveBeenCalledWith(1, [], { Authorization: "Bearer token123" });
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /confirmer l'approbation/i })).not.toBeInTheDocument();
        });
    });

    it("should search and target a student when accepting an offer", async () => {
        // Arrange
        const mockEtudiants = [
            { id: 101, firstName: "Jean", lastName: "Tremblay", email: "jean@cegep.ca", matricule: "1234567" }
        ];

        OffreStageService.fetchOffresEnAttente
            .mockResolvedValueOnce(mockOffres)
            .mockResolvedValueOnce([]);
        EtudiantService.rechercherEtudiants.mockResolvedValueOnce(mockEtudiants);
        OffreStageService.accepterOffre.mockResolvedValueOnce({});

        // Act
        render(<MockApprobation />);

        const boutonAccepter = await screen.findByRole("button", { name: /approuver|accepter/i });
        fireEvent.click(boutonAccepter);


        const inputRecherche = screen.getByPlaceholderText(/taper un nom/i);
        fireEvent.change(inputRecherche, { target: { value: "Jean" } });


        const etudiantTrouve = await screen.findByText("Jean Tremblay");
        fireEvent.mouseDown(etudiantTrouve);

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer l'approbation/i });
        fireEvent.click(boutonConfirmer);

        // Assert
        expect(OffreStageService.accepterOffre).toHaveBeenCalledWith(1, [101], { Authorization: "Bearer token123" });
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /confirmer l'approbation/i })).not.toBeInTheDocument();
        });
    });

    it("should refuse an offer with a reason", async () => {
        // Arrange
        OffreStageService.fetchOffresEnAttente
            .mockResolvedValueOnce(mockOffres)
            .mockResolvedValueOnce([]);
        OffreStageService.refuserOffre.mockResolvedValueOnce({});

        // Act
        render(<MockApprobation />);

        const boutonRefuser = await screen.findByRole("button", { name: /refuser/i });
        fireEvent.click(boutonRefuser);

        const inputMotif = screen.getByPlaceholderText(/veuillez expliquer pourquoi cette offre est refusée/i);
        fireEvent.change(inputMotif, { target: { value: "Salaire trop bas" } });

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer le refus/i });
        fireEvent.click(boutonConfirmer);

        // Assert
        expect(OffreStageService.refuserOffre).toHaveBeenCalledWith(1, "Salaire trop bas", { Authorization: "Bearer token123" });
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /confirmer le refus/i })).not.toBeInTheDocument();
        });
    });
});