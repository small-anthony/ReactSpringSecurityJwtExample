import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CandidaturesOffre from "../../../components/page/CandidaturesOffre.jsx";
import {
    getCandidatures,
    getCvCandidat,
    accepterCandidature,
    refuserCandidature,
} from "../../../services/api/OffreStageService.jsx";
import {
    getConvocationsEmployeur,
    proposeConvocation,
} from "../../../services/api/ConvocationAPI.jsx";

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

vi.mock("../../../services/api/ConvocationAPI", () => ({
    getConvocationsEmployeur: vi.fn(),
    proposeConvocation: vi.fn(),
}));

vi.mock("../../../components/modal/ModalCreerConvocation", async () => {
    const React = await import("react");
    return {
        default: ({ onConfirm, onCancel }) =>
            React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    {
                        type: "button",
                        onClick: () =>
                            onConfirm(
                                [{ date: new Date("2030-01-01T10:00:00"), lieu: "Bureau CGI" }],
                                "Message de test"
                            ),
                    },
                    "stub.confirm"
                ),
                React.createElement(
                    "button",
                    { type: "button", onClick: onCancel },
                    "stub.cancel"
                )
            ),
    };
});

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

const uneConvocation = (surcharge = {}) => ({
    id: 5,
    candidatureId: 1,
    statut: "EN_ATTENTE",
    dateLimite: "2030-01-04T10:00:00Z",
    rendezVousSelection: null,
    reponseEtudiant: null,
    ...surcharge,
});

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
        getConvocationsEmployeur.mockResolvedValue([]);
    });

    it("smoke test : la page s'affiche sans erreur", async () => {
        getCandidatures.mockResolvedValue([]);

        const { container } = afficherPage();

        expect(container).not.toBeEmptyDOMElement();
        expect(screen.getByText("candidatures_offre.title")).toBeInTheDocument();
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

    it("affiche une erreur quand le chargement échoue", async () => {
        getCandidatures.mockRejectedValue(new Error("Erreur réseau"));

        afficherPage();

        expect(await screen.findByText("Erreur réseau")).toBeInTheDocument();
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
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
        expect(refuserCandidature).not.toHaveBeenCalled();
    });

    it("n'affiche pas les candidatures déjà refusées", async () => {
        getCandidatures.mockResolvedValue([
            { ...candidatureEnAttente, statut: "REFUSEE", messageReponse: "Profil non retenu" },
        ]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.no_candidates")).toBeInTheDocument();
        expect(screen.queryByText("Sophie Martin")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.statuts.REFUSEE")).not.toBeInTheDocument();
    });

    it("accepter ouvre le modal, puis confirmer accepte la candidature et crée la convocation", async () => {
        const user = userEvent.setup();
        getCandidatures
            .mockResolvedValueOnce([candidatureEnAttente])
            .mockResolvedValueOnce([{ ...candidatureEnAttente, statut: "EN_ATTENTE_REPONSE" }]);
        getConvocationsEmployeur
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([uneConvocation()]);
        accepterCandidature.mockResolvedValue({ ...candidatureEnAttente, statut: "ACCEPTEE" });
        proposeConvocation.mockResolvedValue({ statut: "EN_ATTENTE" });

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.accept"));

        expect(screen.getByText("stub.confirm")).toBeInTheDocument();
        expect(accepterCandidature).not.toHaveBeenCalled();

        await user.click(screen.getByText("stub.confirm"));

        await waitFor(() => {
            expect(proposeConvocation).toHaveBeenCalledTimes(1);
        });
        expect(accepterCandidature).toHaveBeenCalledWith(1, {});
        expect(proposeConvocation).toHaveBeenCalledWith(1, "Message de test", expect.any(Array), {});
        expect(await screen.findByText("candidatures_offre.entrevue.EN_ATTENTE")).toBeInTheDocument();
        expect(screen.queryByText("stub.confirm")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
    });

    it("annuler le modal n'accepte pas la candidature", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.accept"));
        await user.click(screen.getByText("stub.cancel"));

        expect(screen.queryByText("stub.confirm")).not.toBeInTheDocument();
        expect(accepterCandidature).not.toHaveBeenCalled();
        expect(proposeConvocation).not.toHaveBeenCalled();
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
    });

    it("affiche l'erreur du serveur et ferme le modal quand la création échoue", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        accepterCandidature.mockResolvedValue({ ...candidatureEnAttente, statut: "ACCEPTEE" });
        proposeConvocation.mockRejectedValue(new Error("Erreur serveur convocation"));

        afficherPage();
        await user.click(await screen.findByText("candidatures_offre.accept"));
        await user.click(screen.getByText("stub.confirm"));

        expect(await screen.findByText("Erreur serveur convocation")).toBeInTheDocument();
        expect(screen.queryByText("stub.confirm")).not.toBeInTheDocument();
    });

    it("une candidature acceptée sans convocation propose le bouton Convoquer", async () => {
        const user = userEvent.setup();
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "ACCEPTEE" }]);
        proposeConvocation.mockResolvedValue({ statut: "EN_ATTENTE" });

        afficherPage();

        expect(await screen.findByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.statuts.ACCEPTEE")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();

        await user.click(screen.getByText("candidatures_offre.convoquer"));
        await user.click(screen.getByText("stub.confirm"));

        await waitFor(() => {
            expect(proposeConvocation).toHaveBeenCalledWith(1, "Message de test", expect.any(Array), {});
        });
        expect(accepterCandidature).not.toHaveBeenCalled();
    });

    it("affiche l'entrevue proposée sans bouton de décision ni Convoquer", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "EN_ATTENTE_REPONSE" }]);
        getConvocationsEmployeur.mockResolvedValue([uneConvocation()]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.entrevue.EN_ATTENTE")).toBeInTheDocument();
        expect(screen.getByText(/candidatures_offre.entrevue.date_limite/)).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
    });

    it("affiche l'entrevue confirmée avec le rendez-vous retenu et la réponse de l'étudiant", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "ACCEPTEE" }]);
        getConvocationsEmployeur.mockResolvedValue([
            uneConvocation({
                statut: "ACCEPTEE",
                rendezVousSelection: { date: "2030-01-02T14:00:00", lieu: "Bureau CGI" },
                reponseEtudiant: "Merci, j'y serai",
            }),
        ]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.entrevue.ACCEPTEE")).toBeInTheDocument();
        expect(screen.getByText(/Bureau CGI/)).toBeInTheDocument();
        expect(screen.getByText(/Merci, j'y serai/)).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.convoquer")).not.toBeInTheDocument();
    });

    it("garde visible une candidature refusée par l'étudiant avec l'entrevue refusée", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "REFUSEE" }]);
        getConvocationsEmployeur.mockResolvedValue([
            uneConvocation({ statut: "REFUSEE", reponseEtudiant: "Conflit d'horaire" }),
        ]);

        afficherPage();

        expect(await screen.findByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.entrevue.REFUSEE")).toBeInTheDocument();
        expect(screen.getByText(/Conflit d'horaire/)).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.accept")).not.toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.refuse")).not.toBeInTheDocument();
    });

    it("propose de nouveau Convoquer quand la convocation est expirée", async () => {
        getCandidatures.mockResolvedValue([{ ...candidatureEnAttente, statut: "EN_ATTENTE_REPONSE" }]);
        getConvocationsEmployeur.mockResolvedValue([uneConvocation({ statut: "EXPIREE" })]);

        afficherPage();

        expect(await screen.findByText("candidatures_offre.entrevue.EXPIREE")).toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.convoquer")).toBeInTheDocument();
    });

    it("n'affiche aucune entrevue sur une candidature encore en attente", async () => {
        getCandidatures.mockResolvedValue([candidatureEnAttente]);
        getConvocationsEmployeur.mockResolvedValue([uneConvocation()]);

        afficherPage();

        expect(await screen.findByText("Sophie Martin")).toBeInTheDocument();
        expect(screen.queryByText("candidatures_offre.entrevue.EN_ATTENTE")).not.toBeInTheDocument();
        expect(screen.getByText("candidatures_offre.accept")).toBeInTheDocument();
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

        const btnVoirCv = await screen.findByText("candidatures_offre.view_cv");
        await user.click(btnVoirCv);

        expect(getCvCandidat).toHaveBeenCalledWith(1, {});
        expect(await screen.findByText("Sophie Martin - CV")).toBeInTheDocument();

        const btnFermer = screen.getByTitle("approbation.cvs.close");
        await user.click(btnFermer);

        await waitFor(() => {
            expect(screen.queryByText("Sophie Martin - CV")).not.toBeInTheDocument();
        });
        expect(revokeObjectURLMock).toHaveBeenCalled();
    });
});