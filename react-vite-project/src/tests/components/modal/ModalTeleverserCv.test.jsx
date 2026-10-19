import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ModalTeleverserCv from "../../../components/modal/ModalTeleverserCv.jsx";
import * as EtudiantCvService from "../../../services/api/EtudiantCvService.jsx";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'cv_upload.title': 'Téléverser votre CV',
                'cv_upload.choose_file': 'Choisir un fichier PDF',
                'cv_upload.no_file_chosen': 'Aucun fichier choisi',
                'cv_upload.successMessage': 'Votre CV a été televersé avec succès!',
                'cv_upload.loading': 'Téléversement en cours...',
                'cv_upload.submit': 'Téléverser mon CV',
                'cv_upload.errors.notPdf': 'Veuillez sélectionner un fichier PDF.',
                'cv_upload.errors.default': 'Une erreur est survenue lors du téléversement.'
            };

            return translations[key] || key;
        },
    }),
}));

vi.mock('../../services/api/EtudiantCvService.jsx', () => ({
    uploadCv: vi.fn(),
    checkCvExists: vi.fn(),
}));

describe('ModalTeleverserCv', () => {
    const mockOnUploadSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderModal = () => {
        const { container } = render(<ModalTeleverserCv onUploadSuccess={mockOnUploadSuccess} />);
        return {
            input: container.querySelector('input[type="file"]'),
            televerserButton: screen.getByRole('button', { name: /téléverser mon cv/i }),
            form: container.querySelector('form'),
        };
    };

    it('doit charger le modal avec le bouton de televerser le cv desactivé', async () => {
        // Arrange & Act
        const { televerserButton } = renderModal();

        // Assert
        expect(screen.getByRole('heading', { name: /téléverser votre cv/i })).toBeInTheDocument();
        expect(televerserButton).toBeDisabled();
    });

    it('doit afficher un message d\'erreur quand un fichier non pdf est choisi', async () => {
        // Arrange
        const { input, televerserButton } = renderModal();
        const invalidFile = new File(['image-content'], 'photo.png', { type: 'image/png' });

        // Act
        fireEvent.change(input, { target: { files: [invalidFile] } });

        // Assert
        expect(screen.getByText(/veuillez sélectionner un fichier pdf/i)).toBeInTheDocument();
        expect(televerserButton).toBeDisabled();
    });

    it('doit activer le bouton de televerser le cv quand un fichier pdf est choisi', async () => {
        // Arrange
        const { input, televerserButton } = renderModal();
        const validFile = new File(['pdf-content'], 'cv.pdf', { type: 'application/pdf' });

        // Act
        fireEvent.change(input, { target: { files: [validFile] } });

        // Assert
        expect(televerserButton).toBeEnabled();
    });

    it('doit appeler le service de uploadCv et afficher le message de succes de televerser le cv', async () => {
        // Arrange
        vi.useFakeTimers();
        const mockResponse = { message: 'Votre CV a été televersé avec succès!' };
        EtudiantCvService.uploadCv.mockResolvedValue(mockResponse);
        const { input, form } = renderModal();
        const validFile = new File(['pdf-content'], 'cv.pdf', { type: 'application/pdf' });

        // Act
        fireEvent.change(input, { target: { files: [validFile] } });
        await act(async () => {
            fireEvent.submit(form);
        });

        // Assert
        expect(EtudiantCvService.uploadCv).toHaveBeenCalledWith(validFile);
        expect(screen.getByText('Votre CV a été televersé avec succès!')).toBeInTheDocument();

        // Act
        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        // Assert
        expect(mockOnUploadSuccess).toHaveBeenCalled();
    });

    it('doit afficher une erreur de serveur si le uploadCv echoue', async () => {
        // Arrange
        const errorMessage = 'Fichier trop lourd';
        EtudiantCvService.uploadCv.mockRejectedValue(new Error(errorMessage));
        const { input, form } = renderModal();
        const validFile = new File(['pdf-content'], 'cv.pdf', { type: 'application/pdf' });

        // Act
        fireEvent.change(input, { target: { files: [validFile] } });
        await act(async () => {
            fireEvent.submit(form);
        });

        // Assert
        const error = await screen.findByText(errorMessage);
        expect(error).toBeInTheDocument();
        expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });
});