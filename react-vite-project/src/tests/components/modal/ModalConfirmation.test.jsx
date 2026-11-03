import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import ModalConfirmation from "../../../components/modal/ModalConfirmation.jsx";
import i18n from "../../../../i18n.config.js";

describe("ModalConfirmation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    it("ne devrait rien afficher si isOpen est faux", () => {
        const { container } = render(
            <ModalConfirmation
                isOpen={false}
                title="Confirmation"
                message="Êtes-vous sûr ?"
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it("devrait afficher le titre, le message et les détails quand isOpen est vrai", () => {
        render(
            <ModalConfirmation
                isOpen={true}
                title="Supprimer l'offre"
                message="Voulez-vous vraiment supprimer cette offre ?"
                details="Stage Dev Java"
            />
        );

        expect(screen.getByText("Supprimer l'offre")).toBeInTheDocument();
        expect(screen.getByText("Voulez-vous vraiment supprimer cette offre ?")).toBeInTheDocument();
        expect(screen.getByText("Stage Dev Java")).toBeInTheDocument();
    });

    it("devrait supporter la prop titre comme alternative à title", () => {
        render(
            <ModalConfirmation
                isOpen={true}
                titre="Titre alternatif"
                message="Message de confirmation"
            />
        );

        expect(screen.getByText("Titre alternatif")).toBeInTheDocument();
    });

    it("devrait appeler onConfirm lors du clic sur le bouton de confirmation", async () => {
        const user = userEvent.setup();
        const handleConfirm = vi.fn();
        const handleClose = vi.fn();

        render(
            <ModalConfirmation
                isOpen={true}
                title="Confirmer l'action"
                confirmText="Confirmer"
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        );

        const btnConfirmer = screen.getByRole("button", { name: "Confirmer" });
        await user.click(btnConfirmer);

        expect(handleConfirm).toHaveBeenCalledTimes(1);
        expect(handleClose).not.toHaveBeenCalled();
    });

    it("devrait appeler onClose lors du clic sur le bouton d'annulation", async () => {
        const user = userEvent.setup();
        const handleConfirm = vi.fn();
        const handleClose = vi.fn();

        render(
            <ModalConfirmation
                isOpen={true}
                title="Confirmer l'action"
                cancelText="Annuler"
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        );

        const btnAnnuler = screen.getByRole("button", { name: "Annuler" });
        await user.click(btnAnnuler);

        expect(handleClose).toHaveBeenCalledTimes(1);
        expect(handleConfirm).not.toHaveBeenCalled();
    });

    it("devrait appeler onClose lors du clic sur le bouton fermer (X)", async () => {
        const user = userEvent.setup();
        const handleClose = vi.fn();

        const { container } = render(
            <ModalConfirmation
                isOpen={true}
                title="Fermeture"
                onClose={handleClose}
            />
        );

        const closeButton = container.querySelector("button.absolute");
        expect(closeButton).toBeInTheDocument();
        await user.click(closeButton);

        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("en mode isSuccess, ne devrait pas afficher le bouton d'annulation et appeler onClose si onConfirm n'est pas fourni", async () => {
        const user = userEvent.setup();
        const handleClose = vi.fn();

        render(
            <ModalConfirmation
                isOpen={true}
                isSuccess={true}
                title="Succès !"
                message="Opération réussie"
                confirmText="OK"
                onClose={handleClose}
            />
        );

        expect(screen.queryByRole("button", { name: /annuler/i })).not.toBeInTheDocument();

        const btnOk = screen.getByRole("button", { name: "OK" });
        await user.click(btnOk);

        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("devrait désactiver les boutons et afficher l'état de chargement quand loading est vrai", () => {
        render(
            <ModalConfirmation
                isOpen={true}
                title="En cours"
                loading={true}
                confirmText="Confirmer"
                cancelText="Annuler"
                onConfirm={vi.fn()}
                onClose={vi.fn()}
            />
        );

        const buttons = screen.getAllByRole("button");
        buttons.forEach((btn) => {
            expect(btn).toBeDisabled();
        });
    });
});