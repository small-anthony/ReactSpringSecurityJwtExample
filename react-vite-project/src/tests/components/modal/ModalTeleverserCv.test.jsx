import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ModalTeleverserCv from "../../../components/modal/ModalTeleverserCv.jsx";
import * as EtudiantCvService from "../../../services/api/EtudiantCvService.js";

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

vi.mock('../../../services/api/EtudiantCvService.js', () => ({
    uploadCv: vi.fn(),
    checkCvExists: vi.fn(),
}));

describe('ModalTeleverserCv', () => {
    const mockOnUploadSuccess = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderModal = (props = {}) => {
        const { container } = render(
            <ModalTeleverserCv
                onUploadSuccess={mockOnUploadSuccess}
                onClose={mockOnClose}
                {...props}
            />
        );
        return {
            container,
            input: container.querySelector('input[type="file"]'),
            dropZone: container.querySelector('label[for="cv-upload-input"]'),
            televerserButton: screen.getByRole('button', { name: /téléverser mon cv/i }),
            form: container.querySelector('form'),
            closeButton: container.querySelector('button[type="button"]'),
        };
    };

    it('doit charger le modal avec le bouton de televerser le cv desactivé', async () => {
        // Arrange & Act
        const { televerserButton } = renderModal();

        // Assert
        expect(screen.getByRole('heading', { name: /téléverser votre cv/i })).toBeInTheDocument();
        expect(televerserButton).toBeDisabled();
    });

    it('doit afficher un message d\'erreur quand un fichier non pdf est choisi via l\'explorateur', async () => {
        // Arrange
        const { input, televerserButton } = renderModal();
        const invalidFile = new File(['image-content'], 'photo.png', { type: 'image/png' });

        // Act
        fireEvent.change(input, { target: { files: [invalidFile] } });

        // Assert
        expect(screen.getByText(/veuillez sélectionner un fichier pdf/i)).toBeInTheDocument();
        expect(televerserButton).toBeDisabled();
    });

    it('doit activer le bouton de televerser le cv quand un fichier pdf est choisi via l\'explorateur', async () => {
        // Arrange
        const { input, televerserButton } = renderModal();
        const validFile = new File(['pdf-content'], 'cv.pdf', { type: 'application/pdf' });

        // Act
        fireEvent.change(input, { target: { files: [validFile] } });

        // Assert
        expect(televerserButton).toBeEnabled();
        expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    });

    it('doit afficher un message d\'erreur quand un fichier non-PDF est glissé-déposé (drag and drop)', () => {
        // Arrange
        const { dropZone, televerserButton } = renderModal();
        const invalidFile = new File(['image-data'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        // Act
        fireEvent.dragEnter(dropZone);
        fireEvent.dragOver(dropZone, { dataTransfer: { files: [invalidFile] } });
        fireEvent.drop(dropZone, { dataTransfer: { files: [invalidFile] } });

        // Assert
        expect(screen.getByText(/veuillez sélectionner un fichier pdf/i)).toBeInTheDocument();
        expect(televerserButton).toBeDisabled();
    });

    it('doit accepter le fichier et activer le bouton quand un fichier PDF est glissé-déposé (drag and drop)', () => {
        // Arrange
        const { dropZone, televerserButton } = renderModal();
        const validFile = new File(['pdf-data'], 'mon_cv.pdf', { type: 'application/pdf' });

        // Act
        fireEvent.dragEnter(dropZone);
        fireEvent.dragOver(dropZone, { dataTransfer: { files: [validFile] } });
        fireEvent.drop(dropZone, { dataTransfer: { files: [validFile] } });

        // Assert
        expect(screen.queryByText(/veuillez sélectionner un fichier pdf/i)).not.toBeInTheDocument();
        expect(screen.getByText('mon_cv.pdf')).toBeInTheDocument();
        expect(televerserButton).toBeEnabled();
    });

    it('doit appeler onClose quand l\'utilisateur clique sur le bouton fermer (X)', () => {
        // Arrange
        const { closeButton } = renderModal();

        // Act
        fireEvent.click(closeButton);

        // Assert
        expect(mockOnClose).toHaveBeenCalledTimes(1);
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