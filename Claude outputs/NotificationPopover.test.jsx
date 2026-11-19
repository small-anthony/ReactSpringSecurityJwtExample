import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { NotificationButton } from "../../../components/modal/NotificationPopover.jsx";
import { AuthServiceContext } from "../../../services/AuthService.tsx";
import {
    getNotifications,
    dismissNotificationApi,
    deleteNotificationApi
} from "../../../services/api/NotificationAPI.js";

const navigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigate
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (cle) => cle
    })
}));

vi.mock("../../../services/api/NotificationAPI.js", () => ({
    getNotifications: vi.fn(),
    dismissNotificationApi: vi.fn(),
    deleteNotificationApi: vi.fn()
}));

const mockAuth = {
    isAuthed: vi.fn(() => true),
    buildAuthHeader: vi.fn(() => ({ Authorization: "Bearer token123" }))
};

const notification = (id, message, actionType, dismissed = false) => ({
    id,
    type: "ACTION_REQUIRED",
    message,
    action: { type: actionType },
    dismissed,
    dateCreation: "2026-11-18T14:00:00Z"
});

const MockNotificationButton = () => (
    <AuthServiceContext.Provider value={mockAuth}>
        <NotificationButton />
    </AuthServiceContext.Provider>
);

const ouvrirLaCloche = async () => {
    render(<MockNotificationButton />);
    await waitFor(() => expect(getNotifications).toHaveBeenCalled());
    fireEvent.click(screen.getAllByRole("button")[0]);
};

describe("NotificationButton", () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.isAuthed.mockReturnValue(true);
        dismissNotificationApi.mockResolvedValue({});
        deleteNotificationApi.mockResolvedValue({});
    });

    it("devrait afficher le message de la notification de convocation", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(1, "etudiant.convocation_received", "VOIR_CONVOCATIONS")
        ]);

        // Act
        await ouvrirLaCloche();

        // Assert
        expect(await screen.findByText("etudiant.convocation_received")).toBeInTheDocument();
    });

    it("devrait indiquer le nombre de notifications non lues sur la cloche", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(1, "etudiant.convocation_received", "VOIR_CONVOCATIONS"),
            notification(2, "etudiant.cv_accepted", "VOIR_OFFRES", true)
        ]);

        // Act
        render(<MockNotificationButton />);

        // Assert
        expect(await screen.findByText("1")).toBeInTheDocument();
    });

    it("devrait ouvrir l'onglet des convocations et marquer la notification comme lue au clic", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(1, "etudiant.convocation_received", "VOIR_CONVOCATIONS")
        ]);
        await ouvrirLaCloche();

        // Act
        fireEvent.click(await screen.findByText("etudiant.convocation_received"));

        // Assert
        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/etudiant?tab=convocations"));
        expect(dismissNotificationApi).toHaveBeenCalledWith(1, { Authorization: "Bearer token123" });
    });

    it("ne devrait pas marquer comme lue une notification déjà lue mais devrait naviguer", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(1, "etudiant.convocation_received", "VOIR_CONVOCATIONS", true)
        ]);
        await ouvrirLaCloche();

        // Act
        fireEvent.click(await screen.findByText("etudiant.convocation_received"));

        // Assert
        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/etudiant?tab=convocations"));
        expect(dismissNotificationApi).not.toHaveBeenCalled();
    });

    it("devrait toujours ouvrir l'approbation des CV pour la notification du gestionnaire", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(2, "gestionnaire.cv_submitted", "APPROUVER_CV")
        ]);
        await ouvrirLaCloche();

        // Act
        fireEvent.click(await screen.findByText("gestionnaire.cv_submitted"));

        // Assert
        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/gestionnaire/approbations/cvs"));
    });

    it("devrait toujours ouvrir les offres pour un CV accepté", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([notification(3, "etudiant.cv_accepted", "VOIR_OFFRES")]);
        await ouvrirLaCloche();

        // Act
        fireEvent.click(await screen.findByText("etudiant.cv_accepted"));

        // Assert
        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/etudiant?tab=toutes"));
    });

    it("devrait supprimer une notification sans naviguer", async () => {
        // Arrange
        getNotifications.mockResolvedValueOnce([
            notification(1, "etudiant.convocation_received", "VOIR_CONVOCATIONS")
        ]);
        await ouvrirLaCloche();
        await screen.findByText("etudiant.convocation_received");

        // Act
        fireEvent.click(screen.getByTitle("Supprimer"));

        // Assert
        await waitFor(() =>
            expect(screen.queryByText("etudiant.convocation_received")).not.toBeInTheDocument()
        );
        expect(deleteNotificationApi).toHaveBeenCalledWith(1, { Authorization: "Bearer token123" });
        expect(navigate).not.toHaveBeenCalled();
    });

    it("ne devrait pas charger les notifications si l'utilisateur n'est pas connecté", async () => {
        // Arrange
        mockAuth.isAuthed.mockReturnValue(false);

        // Act
        render(<MockNotificationButton />);

        // Assert
        expect(getNotifications).not.toHaveBeenCalled();
    });
});
