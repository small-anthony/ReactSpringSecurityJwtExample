import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CandidaturesOffre from "../../../components/page/CandidaturesOffre.jsx";
import {
    getCandidatures,
    accepterCandidature,
    refuserCandidature,
} from "../../../services/api/OffreStageService.js";


vi.mock("../../../services/AuthService.tsx", async () => {
    const React = await import("react");
    return {
        AuthServiceContext: React.createContext({ buildAuthHeader: () => ({}) }),
    };
});


vi.mock("../../../services/api/OffreStageService", () => ({
    getCandidatures: vi.fn(),
    getCvCandidat: vi.fn(),
    accepterCandidature: vi.fn(),
    refuserCandidature: vi.fn(),
}));


vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (cle) => cle,
        i18n: { language: "fr" },
    }),
}));

const candidatureEnAttente = {
    id: 1,
    statut: "EN_ATTENTE",
    messageReponse: null,
    dateDecision: null,
    etudiant: {
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie@test.com",
        discipline: "info",
        hasCv: true,
    },
};

const deuxiemeCandidature = {
    ...candidatureEnAttente,
    id: 2,
    etudiant: {
        ...candidatureEnAttente.etudiant,
        firstName: "Marc",
        lastName: "Dubois",
        email: "marc@test.com",
    },
};

function afficherPage() {
    return render(
        <MemoryRouter initialEntries={["/employeur/offres/10/candidatures"]}>
            <Routes>
                <Route path="/employeur/offres/:offreId/candidatures" element={<CandidaturesOffre />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("CandidaturesOffre", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("smoke test : la page s'affiche sans erreur", async () => {
        getCandidatures.mockResolvedValue([]);

        const { container } = afficherPage();

        expect(container).not.toBeEmptyDOMElement();
        expect(screen.getByText("candidatures_offre.title")).toBeInTheDocument();
        // On attend la fin du chargement pour que la page soit complètement stable
        await screen.findByText("candidatures_offre.no_candidates");
    });

    it("affiche plusieurs candidats, chacun avec ses boutons Accepter / Refuser", async () => {
        getCandidatures.mockResolvedValue([candidatureEnAttente, deuxiemeCandidature]);

        afficherPage();


        const boutonsAccepter = await screen.findAllByText("candidatures_offre.accept");
        expect(boutonsAccepter).toHaveLength(2);


        expect(screen.getAllByText("candidatures_offre.refuse")).toHaveLength(2);
        expect(screen.getByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("Marc Dubois")).toBeInTheDocument();


        expect(screen.queryAllByText("candidatures_offre.statuts.ACCEPTEE")).toHaveLength(0);
    });

    it("affiche le candidat et les boutons Accepter / Refuser quand la candidature est en attente", async () => {
        getCandidatures.mockResolvedValue([candidatureEnAttente]);

        afficherPage();

        expect(await screen.findByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.refuse")).toBeInTheDocument();
    });

    it("affiche un message quand il n'y a aucune candidature", async () => {
        getCandidatures.mockResolvedValue([]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.no_candidates")).toBeInTheDocument();
    });

    it("accepte une candidature : le statut change et les boutons disparaissent", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        accepterCandidature.mockResolvedValue({ ...candidatureEnAttente, statut: "ACCEPTEE" });

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.accept"));

        expect(await screen.findByText("candidatures_offre.statuts.ACCEPTEE")).toBeInTheDocument();
        expect(accepterCandidature).toHaveBeenCalledWith(1, {});
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();
    });

    it("refuse une candidature avec un message : le statut et le message s'affichent", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        refuserCandidature.mockResolvedValue({
            ...candidatureEnAttente,
            statut: "REFUSEE",
            messageReponse: "Profil non retenu",
        });

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.refuse"));
        await user.type(
            screen.getByPlaceholderText("candidatures_offre.refuse_message_placeholder"),
            "Profil non retenu"
        );
        await user.click(screen.getByText("candidatures_offre.confirm_refuse"));

        expect(await screen.findByText("candidatures_offre.statuts.REFUSEE")).toBeInTheDocument();
        expect(refuserCandidature).toHaveBeenCalledWith(1, "Profil non retenu", {});
        expect(screen.getByText("Profil non retenu")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
    });

    it("annule le refus : le champ de message se ferme et les boutons reviennent", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.refuse"));
        expect(screen.getByPlaceholderText("candidatures_offre.refuse_message_placeholder")).toBeInTheDocument();

        await user.click(screen.getByText("candidatures_offre.cancel"));

        expect(screen.queryByPlaceholderText("candidatures_offre.refuse_message_placeholder")).not.toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
        expect(refuserCandidature).not.toHaveBeenCalled();
    });

    it("n'affiche pas les boutons quand la candidature a déjà reçu une réponse", async () => {
        getCandidatures.mockResolvedValue([
            { ...candidatureEnAttente, statut: "REFUSEE", messageReponse: "Profil non retenu" },
        ]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.statuts.REFUSEE")).toBeInTheDocument();
        expect(screen.getByText("Profil non retenu")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();
    });

    it("affiche l'erreur du serveur quand l'acceptation échoue", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        accepterCandidature.mockRejectedValue(new Error("Cette candidature a déjà reçu une réponse"));

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.accept"));

        expect(await screen.findByText("Cette candidature a déjà reçu une réponse")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
    });
});