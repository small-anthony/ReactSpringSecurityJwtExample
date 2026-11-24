import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import GestionnaireContrats from "../../../components/page/GestionnaireContrats.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as ContratAPI from "../../../services/api/ContratAPI.js";
import * as OffreStageService from "../../../services/api/OffreStageService.js";
import i18n from "../../../../i18n.config.js";

vi.mock("../../../services/api/ContratAPI.js");
vi.mock("../../../services/api/OffreStageService.js", () => ({
    getAnneesGestionnaire: vi.fn()
}));

vi.mock("../../../components/modal/ModalCvPdf.jsx", () => ({
    default: ({ titre, onClose }) => (
        <div data-testid="mock-modal-cv-pdf">
            <span>{titre}</span>
            <button type="button" onClick={onClose}>Fermer</button>
        </div>
    ),
}));

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" })),
    getUserData: vi.fn(() => ({ id: 1, role: "ROLE_GESTIONNAIRE" }))
};

const MockGestionnaireContrats = () => {
    return (
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <GestionnaireContrats />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

const mockContrats = [
    {
        id: 201,
        titreOffre: "Développeur Backend",
        nomEntreprise: "Ubisoft",
        etudiantNom: "Bélanger",
        etudiantPrenom: "Luc",
        etudiantEmail: "luc@test.com",
        etudiantMatricule: 5551234,
        dateDebut: "2026-05-11",
        dateFin: "2026-08-21",
        horaire: "35h/semaine",
        salaire: "26.00$/h",
        statut: "SIGNE_PAR_ETUDIANT_ET_EMPLOYEUR",
        signeParEtudiant: true,
        signeParEmployeur: true,
        signeParGestionnaire: false
    },
    {
        id: 202,
        titreOffre: "Analyste Sécurité",
        nomEntreprise: "Desjardins",
        etudiantNom: "Roy",
        etudiantPrenom: "Emma",
        etudiantEmail: "emma@test.com",
        etudiantMatricule: 9998888,
        dateDebut: "2026-05-18",
        dateFin: "2026-08-28",
        horaire: "35h/semaine",
        salaire: "28.00$/h",
        statut: "EN_ATTENTE_SIGNATURE",
        signeParEtudiant: true,
        signeParEmployeur: false,
        signeParGestionnaire: false
    }
];

describe("GestionnaireContrats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        OffreStageService.getAnneesGestionnaire.mockResolvedValue([]);
        i18n.changeLanguage("fr");
        globalThis.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    it("devrait charger et afficher les contrats", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);

        render(<MockGestionnaireContrats />);

        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();
        expect(screen.getByText(/Emma Roy/i)).toBeInTheDocument();
        expect(screen.getByText(/Ubisoft/i)).toBeInTheDocument();
    });

    it("devrait permettre de signer seulement lorsque l'etudiant et l'employeur ont deja signe", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);

        const { container } = render(<MockGestionnaireContrats />);

        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();
        expect(container.querySelector("#btn-signer-contrat-201")).toBeInTheDocument();
        expect(container.querySelector("#btn-signer-contrat-202")).not.toBeInTheDocument();
        expect(screen.getByText(/En attente des signatures de l'étudiant et de l'employeur/i)).toBeInTheDocument();
    });

    it("devrait ouvrir la modale de signature lors du clic sur Signer le contrat", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);

        const { container } = render(<MockGestionnaireContrats />);
        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();

        const btnSigner = container.querySelector("#btn-signer-contrat-201");
        fireEvent.click(btnSigner);

        expect(await screen.findByText(/Signer le contrat de stage/i)).toBeInTheDocument();
    });

    it("devrait appeler l'impression lors du clic sur Imprimer", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);
        vi.spyOn(ContratAPI, "getContratDocumentBlob").mockResolvedValue(new Blob(["pdf"]));

        const { container } = render(<MockGestionnaireContrats />);
        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();

        const btnImprimer = container.querySelector("#btn-imprimer-contrat-201");
        fireEvent.click(btnImprimer);

        await waitFor(() => {
            expect(ContratAPI.getContratDocumentBlob).toHaveBeenCalledWith(201, expect.any(Object));
        });
    });

    it("devrait permettre au gestionnaire de refuser un contrat avec confirmation", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);
        vi.spyOn(ContratAPI, "rejeterContrat").mockResolvedValue({ id: 201, statut: "REFUSE" });

        const { container } = render(<MockGestionnaireContrats />);
        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();

        const btnRefuser = container.querySelector("#btn-refuser-contrat-201");
        fireEvent.click(btnRefuser);

        expect(screen.getByText(/Êtes-vous certain de vouloir refuser ce contrat de stage/i)).toBeInTheDocument();

        const btnConfirm = container.querySelector("#btn-confirm-refus-gestionnaire");
        fireEvent.click(btnConfirm);

        await waitFor(() => {
            expect(ContratAPI.rejeterContrat).toHaveBeenCalledWith(201, expect.any(Object));
        });
    });

    it("devrait ouvrir directement l'onglet Liste et le modal de signature depuis une notification SIGNER_CONTRAT", async () => {
        vi.spyOn(ContratAPI, "getCandidaturesAccepteesPourContrat").mockResolvedValue([]);
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue(mockContrats);

        render(
            <AuthServiceContext.Provider value={mockAuth}>
                <MemoryRouter initialEntries={["/gestionnaire/contrats?contratId=201&action=signer"]}>
                    <GestionnaireContrats />
                </MemoryRouter>
            </AuthServiceContext.Provider>
        );

        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();
        expect(await screen.findByText(/Signer le contrat de stage/i)).toBeInTheDocument();
    });

    it("trie les contrats par priorité (à signer avant complétés et refusés)", async () => {
        vi.spyOn(ContratAPI, "getTousLesContrats").mockResolvedValue([
            {
                ...mockContrats[1],
                id: 301,
                etudiantPrenom: "Paul",
                etudiantNom: "Refusé",
                statut: "REFUSE"
            },
            {
                ...mockContrats[0],
                id: 302,
                etudiantPrenom: "Claire",
                etudiantNom: "Complétée",
                statut: "COMPLETE",
                signeParGestionnaire: true
            },
            mockContrats[0]
        ]);

        const { container } = render(<MockGestionnaireContrats />);
        expect(await screen.findByText(/Luc Bélanger/i)).toBeInTheDocument();

        const texte = container.textContent;
        expect(texte.indexOf("Luc Bélanger")).toBeLessThan(texte.indexOf("Claire Complétée"));
        expect(texte.indexOf("Claire Complétée")).toBeLessThan(texte.indexOf("Paul Refusé"));
    });
});
