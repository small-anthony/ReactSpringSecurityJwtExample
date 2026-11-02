import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CandidaturesOffre from "../../../components/page/CandidaturesOffre.jsx";
import {
    getCandidatures,
    getCvCandidat,
    refuserCandidature,
    embaucherCandidature,
} from "../../../services/api/OffreStageService.js";
import { proposeConvocation } from "../../../services/api/ConvocationAPI.js";

vi.mock("../../../services/AuthService.tsx", async () => {
    const React = await import("react");
    return {
        AuthServiceContext: React.createContext({ buildAuthHeader: () => ({}) }),
    };
});

vi.mock("../../../services/api/OffreStageService.js", () => ({
    getCandidatures: vi.fn(),
    getCvCandidat: vi.fn(),
    refuserCandidature: vi.fn(),
    embaucherCandidature: vi.fn(),
}));

vi.mock("../../../services/api/ConvocationAPI.js", () => ({
    proposeConvocation: vi.fn(),
}));

vi.mock("../../../components/modal/ModalCvPdf.jsx", () => ({
    default: ({ titre, onClose }) => (
        <div>
            <span>{titre}</span>
            <button type="button" title="approbation.cvs.close" onClick={onClose} />
        </div>
    ),
}));

vi.mock("../../../components/modal/ModalCreerConvocation.jsx", () => ({
    default: ({ onConfirm, onCancel }) => (
        <div data-testid="modal-convocation">
            <button
                type="button"
                onClick={() =>
                    onConfirm([{ lieu: "Bureau", date: new Date(Date.now() + 86400000) }], null)
                }
            >
                confirmer-convocation
            </button>
            <button type="button" onClick={onCancel}>
                annuler-convocation
            </button>
        </div>
    ),
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
        await screen.findByText("candidatures_offre.no_candidates");
    });

    it("affiche plusieurs candidats en attente avec Convoquer / Refuser et sans badge", async () => {
        getCandidatures.mockResolvedValue([candidatureEnAttente, deuxiemeCandidature]);

        afficherPage();

        expect(await screen.findAllByText("candidatures_offre.convoquer")).toHaveLength(2);
        expect(screen.getAllByText("candidatures_offre.refuse")).toHaveLength(2);
        expect(screen.queryByText("candidatures_offre.hire")).not.toBeInTheDocument();
        expect(screen.getByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("Marc Dubois")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.status.EN_ATTENTE")).not.toBeInTheDocument();
    });

    it("affiche un message quand il n'y a aucune candidature", async () => {
        getCandidatures.mockResolvedValue([]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.no_candidates")).toBeInTheDocument();
    });

    it("convoque un candidat : le modal s'ouvre, la convocation est envoyée et le badge Convocation envoyée apparaît", async () => {
        const user = userEvent.setup();
        getCandidatures
            .mockResolvedValueOnce([candidatureEnAttente])
            .mockResolvedValueOnce([{ ...candidatureEnAttente, statut: "EN_ATTENTE_REPONSE" }]);
        proposeConvocation.mockResolvedValue({ statut: "EN_ATTENTE" });

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.convoquer"));
        expect(screen.getByTestId("modal-convocation")).toBeInTheDocument();

        await user.click(screen.getByText("confirmer-convocation"));

        expect(await screen.findByText("candidatures_offre.status.EN_ATTENTE_REPONSE")).toBeInTheDocument();
        expect(proposeConvocation).toHaveBeenCalledWith(1, null, expect.any(Array), {});
        expect(screen.queryByTestId("modal-convocation")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.hire")).not.toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.refuse")).toBeInTheDocument();
    });

    it("annule la convocation : le modal se ferme sans rien envoyer", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.convoquer"));
        await user.click(screen.getByText("annuler-convocation"));

        expect(screen.queryByTestId("modal-convocation")).not.toBeInTheDocument();
        expect(proposeConvocation).not.toHaveBeenCalled();
        expect(screen.getByText("candidatures_offre.convoquer")).toBeInTheDocument();
    });

    it("convocation envoyée : badge affiché, seul le bouton Refuser reste", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "EN_ATTENTE_REPONSE" }]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.status.EN_ATTENTE_REPONSE")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.refuse")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.hire")).not.toBeInTheDocument();
    });

    it("entrevue acceptée : badge affiché avec les boutons Embaucher et Refuser", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "ACCEPTEE" }]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.status.ACCEPTEE")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.hire")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.refuse")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
    });

    it("embauche un candidat : le badge Embauché apparaît et les boutons disparaissent", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "ACCEPTEE" }]);
        embaucherCandidature.mockResolvedValue({ ...candidatureEnAttente, statut: "EMBAUCHEE" });

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.hire"));

        expect(await screen.findByText("candidatures_offre.status.EMBAUCHEE")).toBeInTheDocument();
        expect(embaucherCandidature).toHaveBeenCalledWith(1, {});
        expect(screen.queryByText("candidatures_offre.hire")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();
    });

    it("affiche une candidature déjà embauchée avec son badge et sans boutons", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "EMBAUCHEE" }]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.status.EMBAUCHEE")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.hire")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
    });

    it("affiche l'erreur du serveur quand l'embauche échoue et garde les boutons", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "ACCEPTEE" }]);
        embaucherCandidature.mockRejectedValue(
            new Error("L'entrevue doit être confirmée par l'étudiant avant l'embauche")
        );

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.hire"));

        expect(
            await screen.findByText("L'entrevue doit être confirmée par l'étudiant avant l'embauche")
        ).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.hire")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.refuse")).toBeInTheDocument();
    });

    it("refuse une candidature avec un message : la carte disparaît et l'autre reste", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente, deuxiemeCandidature]);
        refuserCandidature.mockResolvedValue({
            ...candidatureEnAttente,
            statut: "REFUSEE",
            messageReponse: "Profil non retenu",
        });

        afficherPage();
        const boutonsRefuser = await screen.findAllByText("candidatures_offre.refuse");
        await user.click(boutonsRefuser[0]);
        await user.type(
            screen.getByPlaceholderText("candidatures_offre.refuse_message_placeholder"),
            "Profil non retenu"
        );
        await user.click(screen.getByText("candidatures_offre.confirm_refuse"));

        await waitFor(() => {
            expect(screen.queryByText("Sophie Martin")).not.toBeInTheDocument();
        });
        expect(refuserCandidature).toHaveBeenCalledWith(1, "Profil non retenu", {});
        expect(screen.getByText("Marc Dubois")).toBeInTheDocument();
    });

    it("annule le refus : le champ de message se ferme et les boutons reviennent", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.refuse"));
        expect(screen.getByPlaceholderText("candidatures_offre.refuse_message_placeholder")).toBeInTheDocument();

        await user.click(screen.getByText("candidatures_offre.cancel"));

        expect(screen.queryByPlaceholderText("candidatures_offre.refuse_message_placeholder")).not.toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.convoquer")).toBeInTheDocument();
        expect(refuserCandidature).not.toHaveBeenCalled();
    });

    it("n'affiche pas les candidatures refusées", async () => {
        getCandidatures.mockResolvedValue([
            { ...candidatureEnAttente, statut: "REFUSEE", messageReponse: "Profil non retenu" },
        ]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.no_candidates")).toBeInTheDocument();
        expect(screen.queryByText("Sophie Martin")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.status.REFUSEE")).not.toBeInTheDocument();
    });

    it("ouvre le modal CV au clic sur le bouton voir le CV puis le referme", async () => {
        const user = userEvent.setup();
        const createObjectURLMock = vi.fn(() => "blob:http://localhost/mock-cv");
        const revokeObjectURLMock = vi.fn();
        globalThis.URL.createObjectURL = createObjectURLMock;
        globalThis.URL.revokeObjectURL = revokeObjectURLMock;

        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        getCvCandidat.mockResolvedValue(new Blob(["mock pdf content"], { type: "application/pdf" }));

        afficherPage();

        await user.click(await screen.findByText("candidatures_offre.view_cv"));

        expect(getCvCandidat).toHaveBeenCalledWith(1, {});
        expect(await screen.findByText("Sophie Martin - CV")).toBeInTheDocument();

        await user.click(screen.getByTitle("approbation.cvs.close"));

        await waitFor(() => {
            expect(screen.queryByText("Sophie Martin - CV")).not.toBeInTheDocument();
        });
        expect(revokeObjectURLMock).toHaveBeenCalled();
    });
});