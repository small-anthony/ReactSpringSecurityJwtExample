import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import ProfileEmployeur from "../../../components/page/ProfileEmployeur.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as OffreStageService from "../../../services/api/OffreStageService.js";
import i18n from "../../../../i18n.config.js";

vi.mock("../../../services/api/OffreStageService");

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const MockProfileEmployeur = () => {
    return (
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <ProfileEmployeur />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

const mockOffres = [
    {
        id: 1,
        titre: "Développeur Front-End React",
        nomEntreprise: "CGI Inc.",
        discipline: "Techniques de l'informatique",
        salaire: "25.00 $/h",
        duree: "12 semaines",
        description: "Développement d'interfaces modernes avec React.",
        exigences: "Bonnes connaissances en JavaScript et CSS.",
        status: "ACCEPTEE",
        candidatures: []
    },
    {
        id: 2,
        titre: "Analyste QA Logiciel",
        nomEntreprise: "CGI Inc.",
        discipline: "Techniques de l'informatique",
        salaire: "22.50 $/h",
        duree: "16 semaines",
        description: "Écriture et exécution de tests automatisés.",
        exigences: "Rigueur et curiosité technique.",
        status: "EN_ATTENTE",
        candidatures: []
    }
];

describe("ProfileEmployeur - Modifier et Supprimer une offre d'emploi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    it("devrait afficher les offres publiées par l'employeur au chargement", async () => {
        // Arrange
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);

        // Act
        render(<MockProfileEmployeur />);

        // Assert
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();
        expect(screen.getByText("Analyste QA Logiciel")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: /modifier/i })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: /supprimer/i })).toHaveLength(2);
    });

    it("devrait supprimer une offre avec succès lors du clic sur Supprimer", async () => {
        // Arrange
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);
        OffreStageService.deleteOffreStage.mockResolvedValueOnce({});

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsSupprimer = screen.getAllByRole("button", { name: /supprimer/i });

        // Act
        fireEvent.click(boutonsSupprimer[0]);

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer/i });
        fireEvent.click(boutonConfirmer);

        // Assert
        await waitFor(() => {
            expect(OffreStageService.deleteOffreStage).toHaveBeenCalledWith(1, { Authorization: "Bearer token123" });
            expect(screen.queryByText("Développeur Front-End React")).not.toBeInTheDocument();
        });
        expect(screen.getByText("Analyste QA Logiciel")).toBeInTheDocument();
    });

    it("devrait afficher un message d'erreur si la suppression de l'offre échoue", async () => {
        // Arrange
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);
        OffreStageService.deleteOffreStage.mockRejectedValueOnce(new Error("Impossible de supprimer cette offre"));

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsSupprimer = screen.getAllByRole("button", { name: /supprimer/i });

        // Act
        fireEvent.click(boutonsSupprimer[0]);

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer/i });
        fireEvent.click(boutonConfirmer);

        // Assert
        expect(await screen.findByText("Impossible de supprimer cette offre")).toBeInTheDocument();
        expect(screen.getByText("Développeur Front-End React")).toBeInTheDocument();
    });

    it("devrait ouvrir la modale de modification lors du clic sur Modifier", async () => {
        // Arrange
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsModifier = screen.getAllByRole("button", { name: /modifier/i });

        // Act
        fireEvent.click(boutonsModifier[0]);

        // Assert
        expect(await screen.findByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();
        const inputTitre = screen.getByDisplayValue("Développeur Front-End React");
        expect(inputTitre).toBeInTheDocument();
    });

    it("devrait modifier une offre avec succès et mettre à jour la liste", async () => {
        // Arrange
        const user = userEvent.setup();
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);

        const offreModifiee = {
            ...mockOffres[0],
            titre: "Développeur Full-Stack React & Node",
            salaire: "30.00 $/h"
        };
        OffreStageService.updateOffreStage.mockResolvedValueOnce(offreModifiee);

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsModifier = screen.getAllByRole("button", { name: /modifier/i });
        fireEvent.click(boutonsModifier[0]);
        expect(await screen.findByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();

        const inputTitre = screen.getByDisplayValue("Développeur Front-End React");
        const inputSalaire = screen.getByDisplayValue("25.00");

        // Act
        await user.clear(inputTitre);
        await user.type(inputTitre, "Développeur Full-Stack React & Node");

        await user.clear(inputSalaire);
        await user.type(inputSalaire, "30.00");

        const boutonEnregistrer = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(boutonEnregistrer);

        // Assert
        await waitFor(() => {
            expect(OffreStageService.updateOffreStage).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    titre: "Développeur Full-Stack React & Node",
                    salaire: "30.00 $/h"
                }),
                { Authorization: "Bearer token123" }
            );
        });

        expect(await screen.findByText("Développeur Full-Stack React & Node")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /modifier l'offre/i })).not.toBeInTheDocument();
    });

    it("devrait fermer la modale sans modifier l'offre lors du clic sur Annuler", async () => {
        // Arrange
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsModifier = screen.getAllByRole("button", { name: /modifier/i });
        fireEvent.click(boutonsModifier[0]);
        expect(await screen.findByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();

        const boutonAnnuler = screen.getByRole("button", { name: /annuler/i });

        // Act
        fireEvent.click(boutonAnnuler);

        // Assert
        await waitFor(() => {
            expect(screen.queryByRole("heading", { name: /modifier l'offre/i })).not.toBeInTheDocument();
        });
        expect(OffreStageService.updateOffreStage).not.toHaveBeenCalled();
        expect(screen.getByText("Développeur Front-End React")).toBeInTheDocument();
    });

    it("devrait afficher un message d'erreur dans la modale si la modification échoue", async () => {
        // Arrange
        const user = userEvent.setup();
        OffreStageService.getOffresStages.mockResolvedValueOnce(mockOffres);
        OffreStageService.updateOffreStage.mockRejectedValueOnce(new Error("Erreur serveur lors de la mise à jour"));

        render(<MockProfileEmployeur />);
        expect(await screen.findByText("Développeur Front-End React")).toBeInTheDocument();

        const boutonsModifier = screen.getAllByRole("button", { name: /modifier/i });
        fireEvent.click(boutonsModifier[0]);
        expect(await screen.findByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();

        const boutonEnregistrer = screen.getByRole("button", { name: /enregistrer/i });

        // Act
        await user.click(boutonEnregistrer);

        // Assert
        expect(await screen.findByText("Erreur serveur lors de la mise à jour")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();
    });
});
