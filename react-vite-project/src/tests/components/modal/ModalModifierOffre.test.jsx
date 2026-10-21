import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import ModalModifierOffre from "../../../components/modal/ModalModiffierOffre.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as OffreStageService from "../../../services/api/OffreStageService.js";
import i18n from "../../../../i18n.config.js";

vi.mock("../../../services/api/OffreStageService");

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const mockOffre = {
    id: 10,
    titre: "Développeur Backend Java",
    nomEntreprise: "Google Montréal",
    discipline: "Techniques de l'informatique",
    salaire: "28.00 $/h",
    duree: "12 semaines",
    description: "Conception de microservices Spring Boot.",
    exigences: "Expérience avec Java et les bases de données SQL.",
    status: "ACCEPTEE"
};

describe("ModalModifierOffre", () => {
    const handleClose = vi.fn();
    const handleOffreModifiee = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    const renderModal = (props = {}) => {
        return render(
            <AuthServiceContext.Provider value={mockAuth}>
                <ModalModifierOffre
                    offre={mockOffre}
                    onClose={handleClose}
                    onOffreModifiee={handleOffreModifiee}
                    {...props}
                />
            </AuthServiceContext.Provider>
        );
    };

    it("devrait pré-remplir le formulaire avec les valeurs existantes de l'offre", () => {
        // Arrange & Act
        renderModal();

        // Assert
        expect(screen.getByRole("heading", { name: /modifier l'offre/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue("Développeur Backend Java")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Google Montréal")).toBeInTheDocument();
        expect(screen.getByDisplayValue("28.00")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Conception de microservices Spring Boot.")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Expérience avec Java et les bases de données SQL.")).toBeInTheDocument();
    });

    it("devrait soumettre les modifications et formater le salaire en $/h", async () => {
        // Arrange
        const user = userEvent.setup();
        const updatedOffre = {
            ...mockOffre,
            titre: "Développeur Backend Java & Cloud",
            salaire: "32.00 $/h"
        };
        OffreStageService.updateOffreStage.mockResolvedValueOnce(updatedOffre);

        renderModal();

        const inputTitre = screen.getByDisplayValue("Développeur Backend Java");
        const inputSalaire = screen.getByDisplayValue("28.00");
        const boutonEnregistrer = screen.getByRole("button", { name: /enregistrer/i });

        // Act
        await user.clear(inputTitre);
        await user.type(inputTitre, "Développeur Backend Java & Cloud");

        await user.clear(inputSalaire);
        await user.type(inputSalaire, "32");

        await user.click(boutonEnregistrer);

        // Assert
        await waitFor(() => {
            expect(OffreStageService.updateOffreStage).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 10,
                    titre: "Développeur Backend Java & Cloud",
                    salaire: "32.00 $/h"
                }),
                { Authorization: "Bearer token123" }
            );
            expect(handleOffreModifiee).toHaveBeenCalledWith(updatedOffre);
            expect(handleClose).toHaveBeenCalledTimes(1);
        });
    });

    it("devrait appeler onClose sans appeler updateOffreStage lors du clic sur Annuler", () => {
        // Arrange
        renderModal();
        const boutonAnnuler = screen.getByRole("button", { name: /annuler/i });

        // Act
        fireEvent.click(boutonAnnuler);

        // Assert
        expect(handleClose).toHaveBeenCalledTimes(1);
        expect(OffreStageService.updateOffreStage).not.toHaveBeenCalled();
    });

    it("devrait afficher le message d'erreur si l'appel API updateOffreStage échoue", async () => {
        // Arrange
        const user = userEvent.setup();
        OffreStageService.updateOffreStage.mockRejectedValueOnce(new Error("Le titre est trop court."));

        renderModal();
        const boutonEnregistrer = screen.getByRole("button", { name: /enregistrer/i });

        // Act
        await user.click(boutonEnregistrer);

        // Assert
        expect(await screen.findByText("Le titre est trop court.")).toBeInTheDocument();
        expect(handleClose).not.toHaveBeenCalled();
        expect(handleOffreModifiee).not.toHaveBeenCalled();
    });
});
