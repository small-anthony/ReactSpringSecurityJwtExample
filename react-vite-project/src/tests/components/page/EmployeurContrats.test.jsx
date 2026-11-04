import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import EmployeurContrats from "../../../components/page/EmployeurContrats.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import * as ContratAPI from "../../../services/api/ContratAPI.js";

vi.mock("../../../services/api/ContratAPI.js");

const mockAuth = {
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" })),
    getUserData: vi.fn(() => ({ id: 1, role: "ROLE_EMPLOYEUR" }))
};

const MockEmployeurContrats = () => {
    return (
        <AuthServiceContext.Provider value={mockAuth}>
            <BrowserRouter>
                <EmployeurContrats />
            </BrowserRouter>
        </AuthServiceContext.Provider>
    );
};

const mockContrats = [
    {
        id: 101,
        titreOffre: "Analyste Cybersécurité Junior",
        nomEntreprise: "CGI Inc.",
        etudiantNom: "Tremblay",
        etudiantPrenom: "Jean",
        etudiantEmail: "jean.tremblay@test.com",
        etudiantMatricule: 1234567,
        dateDebut: "2026-05-11",
        dateFin: "2026-08-21",
        horaire: "Du lundi au vendredi, 9h à 17h (35h/semaine)",
        salaire: "27.00$/h",
        statut: "EN_ATTENTE_SIGNATURE",
        signeParEtudiant: true,
        signeParEmployeur: false,
        signeParGestionnaire: false
    },
    {
        id: 102,
        titreOffre: "Développeur Full Stack",
        nomEntreprise: "CGI Inc.",
        etudiantNom: "Gagnon",
        etudiantPrenom: "Sophie",
        etudiantEmail: "sophie.gagnon@test.com",
        etudiantMatricule: 7654321,
        dateDebut: "2026-06-01",
        dateFin: "2026-08-31",
        horaire: "37.5h/semaine",
        salaire: "25.00$/h",
        statut: "SIGNE_PAR_EMPLOYEUR",
        signeParEtudiant: true,
        signeParEmployeur: true,
        signeParGestionnaire: false
    }
];

describe("EmployeurContrats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    it("devrait afficher les contrats de l'employeur au chargement", async () => {
        // Arrange
        vi.spyOn(ContratAPI, "getContratsEmployeur").mockResolvedValue(mockContrats);

        // Act
        render(<MockEmployeurContrats />);

        // Assert
        expect(await screen.findByText(/Jean Tremblay/i)).toBeInTheDocument();
        expect(screen.getByText(/Sophie Gagnon/i)).toBeInTheDocument();
        expect(screen.getByText(/Analyste Cybersécurité Junior/i)).toBeInTheDocument();
        expect(screen.getByText(/27.00\$\/h/i)).toBeInTheDocument();
    });

    it("devrait filtrer les contrats à signer et signés", async () => {
        // Arrange
        vi.spyOn(ContratAPI, "getContratsEmployeur").mockResolvedValue(mockContrats);
        render(<MockEmployeurContrats />);
        expect(await screen.findByText(/Jean Tremblay/i)).toBeInTheDocument();

        // Act
        const btnASigner = screen.getByRole("button", { name: /À signer/i });
        fireEvent.click(btnASigner);

        // Assert
        expect(screen.getByText(/Jean Tremblay/i)).toBeInTheDocument();
        expect(screen.queryByText(/Sophie Gagnon/i)).not.toBeInTheDocument();

        // Act
        const btnSignes = screen.getByRole("button", { name: /Signés/i });
        fireEvent.click(btnSignes);

        // Assert
        expect(screen.queryByText(/Jean Tremblay/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Sophie Gagnon/i)).toBeInTheDocument();
    });

    it("devrait afficher un message si aucun contrat n'est disponible", async () => {
        // Arrange
        vi.spyOn(ContratAPI, "getContratsEmployeur").mockResolvedValue([]);

        // Act
        render(<MockEmployeurContrats />);

        // Assert
        expect(await screen.findByText(/Aucun contrat de stage trouvé/i)).toBeInTheDocument();
    });

    it("devrait ouvrir la modale de refus et refuser le contrat", async () => {
        // Arrange
        vi.spyOn(ContratAPI, "getContratsEmployeur").mockResolvedValue(mockContrats);
        vi.spyOn(ContratAPI, "rejeterContrat").mockResolvedValue({ id: 101, statut: "REFUSE" });
        render(<MockEmployeurContrats />);
        expect(await screen.findByText(/Jean Tremblay/i)).toBeInTheDocument();

        // Act
        const btnRefuser = screen.getByRole("button", { name: /Refuser le contrat/i });
        fireEvent.click(btnRefuser);

        // Assert
        expect(screen.getByText(/Êtes-vous certain de vouloir refuser/i)).toBeInTheDocument();

        // Act
        const btnConfirmRefus = screen.getByRole("button", { name: /Confirmer le refus/i });
        fireEvent.click(btnConfirmRefus);

        // Assert
        await waitFor(() => {
            expect(ContratAPI.rejeterContrat).toHaveBeenCalledWith(101, expect.any(Object));
        });
    });

    it("devrait appeler getContratDocumentBlob lors du clic sur Télécharger le PDF", async () => {
        // Arrange
        vi.spyOn(ContratAPI, "getContratsEmployeur").mockResolvedValue(mockContrats);
        vi.spyOn(ContratAPI, "getContratDocumentBlob").mockResolvedValue(new Blob(["pdf"]));
        render(<MockEmployeurContrats />);
        expect(await screen.findByText(/Jean Tremblay/i)).toBeInTheDocument();

        // Act
        const btnsDownload = screen.getAllByRole("button", { name: /Télécharger le PDF/i });
        fireEvent.click(btnsDownload[0]);

        // Assert
        await waitFor(() => {
            expect(ContratAPI.getContratDocumentBlob).toHaveBeenCalledWith(101, expect.any(Object));
        });
    });
});
