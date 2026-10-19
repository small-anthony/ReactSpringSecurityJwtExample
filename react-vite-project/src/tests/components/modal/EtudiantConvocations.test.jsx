import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import EtudiantConvocations from "../../../components/page/EtudiantConvocations.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as ConvocationAPI from "../../../services/api/ConvocationAPI.jsx";
import i18n from "../../../../i18n.config.js";

vi.mock("../services/api/ConvocationAPI");

const mockAuth = {
    buildAuthHeader: () => ({ Authorization: "Bearer token123" })
};

const MockEtudiantConvocations = (props) => {
    return (
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <EtudiantConvocations {...props} />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

const mockConvocations = [
    {
        id: 1,
        titrePoste: "Développeur Full Stack",
        nomEntreprise: "Google",
        statut: "EN_ATTENTE",
        messageEmployeur: "Merci de préparer vos questions pour l'entrevue.",
        rendezVousPossibles: [
            { id: 101, date: "2026-11-01T10:00:00", lieu: "En ligne (Google Meet)" },
            { id: 102, date: "2026-11-02T14:00:00", lieu: "Bureau Montréal" }
        ]
    },
    {
        id: 2,
        titrePoste: "Analyste QA",
        nomEntreprise: "Ubisoft",
        statut: "ACCEPTEE",
        rendezVousSelection: { date: "2026-11-05T09:00:00", lieu: "En ligne (Teams)" }
    },
    {
        id: 3,
        titrePoste: "DevOps Junior",
        nomEntreprise: "Amazon",
        statut: "REFUSEE",
        reponseEtudiant: "Conflit d'horaire avec un examen"
    }
];

describe("EtudiantConvocations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18n.changeLanguage("fr");
    });

    it("devrait afficher les convocations au chargement", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockResolvedValueOnce(mockConvocations);

        render(<MockEtudiantConvocations />);

        expect(await screen.findByText("Développeur Full Stack")).toBeInTheDocument();
        expect(screen.getByText("Google")).toBeInTheDocument();
        expect(screen.getByText("Analyste QA")).toBeInTheDocument();
        expect(screen.getByText("Ubisoft")).toBeInTheDocument();
        expect(screen.getByText("DevOps Junior")).toBeInTheDocument();
        expect(screen.getByText("Amazon")).toBeInTheDocument();
        expect(ConvocationAPI.getConvocationsEtudiant).toHaveBeenCalledWith({ Authorization: "Bearer token123" });
    });

    it("devrait afficher l'état vide si l'étudiant n'a aucune convocation", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockResolvedValueOnce([]);

        render(<MockEtudiantConvocations />);

        expect(await screen.findByText(/aucune convocation/i)).toBeInTheDocument();
    });

    it("devrait filtrer les convocations par statut", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockResolvedValueOnce(mockConvocations);

        render(<MockEtudiantConvocations />);

        expect(await screen.findByText("Développeur Full Stack")).toBeInTheDocument();

        const filtreConfirmees = screen.getByRole("button", { name: /confirmées/i });
        fireEvent.click(filtreConfirmees);

        expect(screen.getByText("Analyste QA")).toBeInTheDocument();
        expect(screen.queryByText("Développeur Full Stack")).not.toBeInTheDocument();
        expect(screen.queryByText("DevOps Junior")).not.toBeInTheDocument();

        const filtreRefusees = screen.getByRole("button", { name: /refusées/i });
        fireEvent.click(filtreRefusees);

        expect(screen.getByText("DevOps Junior")).toBeInTheDocument();
        expect(screen.queryByText("Analyste QA")).not.toBeInTheDocument();
    });

    it("devrait accepter une convocation avec le créneau sélectionné", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockResolvedValueOnce(mockConvocations);
        const convocationAcceptee = {
            ...mockConvocations[0],
            statut: "ACCEPTEE",
            rendezVousSelection: mockConvocations[0].rendezVousPossibles[0]
        };
        ConvocationAPI.accepterConvocation.mockResolvedValueOnce(convocationAcceptee);

        render(<MockEtudiantConvocations />);

        const boutonAccepter = await screen.findByRole("button", { name: /accepter l'entrevue/i });
        fireEvent.click(boutonAccepter);

        expect(ConvocationAPI.accepterConvocation).toHaveBeenCalledWith(
            1,
            mockConvocations[0].rendezVousPossibles[0],
            { Authorization: "Bearer token123" }
        );
        expect(await screen.findByText(/l'entrevue a été confirmée/i)).toBeInTheDocument();
    });

    it("devrait refuser une convocation avec un motif via la modale", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockResolvedValueOnce(mockConvocations);
        const convocationRefusee = {
            ...mockConvocations[0],
            statut: "REFUSEE",
            reponseEtudiant: "Indisponible à ces dates"
        };
        ConvocationAPI.refuserConvocation.mockResolvedValueOnce(convocationRefusee);

        render(<MockEtudiantConvocations />);

        const boutonRefuser = await screen.findByRole("button", { name: /^refuser$/i });
        fireEvent.click(boutonRefuser);

        const inputMotif = screen.getByPlaceholderText(/j'ai déjà accepté une autre offre/i);
        fireEvent.change(inputMotif, { target: { value: "Indisponible à ces dates" } });

        const boutonConfirmer = screen.getByRole("button", { name: /confirmer le refus/i });
        fireEvent.click(boutonConfirmer);

        expect(ConvocationAPI.refuserConvocation).toHaveBeenCalledWith(
            1,
            "Indisponible à ces dates",
            { Authorization: "Bearer token123" }
        );
        expect(await screen.findByText(/la convocation a été refusée/i)).toBeInTheDocument();
    });

    it("devrait afficher un message d'erreur si le chargement échoue", async () => {
        ConvocationAPI.getConvocationsEtudiant.mockRejectedValueOnce(new Error("Erreur réseau serveur"));

        render(<MockEtudiantConvocations />);

        expect(await screen.findByText("Erreur réseau serveur")).toBeInTheDocument();
    });
});
