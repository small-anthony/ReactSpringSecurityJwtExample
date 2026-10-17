import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ConvocationCard from "../components/convocation/ConvocationCard";
import i18n from "../../i18n.config";

describe("ConvocationCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    const mockConvocationEnAttente = {
        id: 1,
        titrePoste: "Développeur React",
        nomEntreprise: "Shopify",
        statut: "EN_ATTENTE",
        dateLimite: "2026-11-01T23:59:59",
        messageEmployeur: "Entrevue technique de 45 minutes",
        rendezVousPossibles: [
            { id: 10, date: "2026-11-05T10:00:00", lieu: "En ligne (Zoom)" },
            { id: 11, date: "2026-11-06T14:00:00", lieu: "Bureau Montréal" }
        ]
    };

    it("devrait afficher les informations d'une convocation en attente et déclencher onAccepter", () => {
        const handleAccepter = vi.fn();
        const handleRefuser = vi.fn();

        render(
            <ConvocationCard
                convocation={mockConvocationEnAttente}
                onAccepter={handleAccepter}
                onRefuser={handleRefuser}
                actionLoadingId={null}
            />
        );

        expect(screen.getByText("Développeur React")).toBeInTheDocument();
        expect(screen.getByText("Shopify")).toBeInTheDocument();
        expect(screen.getByText(/entrevue technique de 45 minutes/i)).toBeInTheDocument();
        expect(screen.getByText(/en attente de votre réponse/i)).toBeInTheDocument();

        const boutonAccepter = screen.getByRole("button", { name: /accepter l'entrevue/i });
        fireEvent.click(boutonAccepter);

        expect(handleAccepter).toHaveBeenCalledWith(1, mockConvocationEnAttente.rendezVousPossibles[0]);
    });

    it("devrait permettre de changer de créneau horaire avant d'accepter", () => {
        const handleAccepter = vi.fn();
        const handleRefuser = vi.fn();

        render(
            <ConvocationCard
                convocation={mockConvocationEnAttente}
                onAccepter={handleAccepter}
                onRefuser={handleRefuser}
                actionLoadingId={null}
            />
        );

        const creneau2 = screen.getByText(/bureau montréal/i);
        fireEvent.click(creneau2);

        const boutonAccepter = screen.getByRole("button", { name: /accepter l'entrevue/i });
        fireEvent.click(boutonAccepter);

        expect(handleAccepter).toHaveBeenCalledWith(1, mockConvocationEnAttente.rendezVousPossibles[1]);
    });

    it("devrait déclencher onRefuser lors du clic sur le bouton Refuser", () => {
        const handleAccepter = vi.fn();
        const handleRefuser = vi.fn();

        render(
            <ConvocationCard
                convocation={mockConvocationEnAttente}
                onAccepter={handleAccepter}
                onRefuser={handleRefuser}
                actionLoadingId={null}
            />
        );

        const boutonRefuser = screen.getByRole("button", { name: /refuser/i });
        fireEvent.click(boutonRefuser);

        expect(handleRefuser).toHaveBeenCalledWith(mockConvocationEnAttente);
    });

    it("devrait afficher le statut et le créneau confirmé pour une convocation acceptée", () => {
        const convocationAcceptee = {
            id: 2,
            titrePoste: "Développeur Java",
            nomEntreprise: "Desjardins",
            statut: "ACCEPTEE",
            rendezVousSelection: { date: "2026-11-10T09:30:00", lieu: "En ligne (Teams)" }
        };

        render(
            <ConvocationCard
                convocation={convocationAcceptee}
                onAccepter={vi.fn()}
                onRefuser={vi.fn()}
                actionLoadingId={null}
            />
        );

        expect(screen.getByText("Développeur Java")).toBeInTheDocument();
        expect(screen.getByText("Desjardins")).toBeInTheDocument();
        expect(screen.getByText(/rendez-vous confirmé/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /accepter l'entrevue/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /refuser/i })).not.toBeInTheDocument();
    });

    it("devrait afficher le motif de refus pour une convocation refusée", () => {
        const convocationRefusee = {
            id: 3,
            titrePoste: "Stagiaire Mobile",
            nomEntreprise: "Bell",
            statut: "REFUSEE",
            reponseEtudiant: "J'ai déjà signé une autre offre"
        };

        render(
            <ConvocationCard
                convocation={convocationRefusee}
                onAccepter={vi.fn()}
                onRefuser={vi.fn()}
                actionLoadingId={null}
            />
        );

        expect(screen.getByText("Stagiaire Mobile")).toBeInTheDocument();
        expect(screen.getByText("Bell")).toBeInTheDocument();
        expect(screen.getByText(/j'ai déjà signé une autre offre/i)).toBeInTheDocument();
    });
});
