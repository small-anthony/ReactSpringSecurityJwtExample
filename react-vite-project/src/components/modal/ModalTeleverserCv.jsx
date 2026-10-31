import React, { useState } from 'react';
import { uploadCv } from '../../services/api/EtudiantCvService.js';
import {useTranslation} from "react-i18next";
import { X } from "lucide-react";
import ModalConfirmation from "./ModalConfirmation.jsx";

export default function ModalTeleverserCv({ onUploadSuccess, onClose }) {
    const { t } = useTranslation("main");
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const validateSetFile = (selectedFile) => {
        if (!selectedFile) return;

        const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name?.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
            setError(t('cv_upload.errors.notPdf'));
            setFile(null);
        } else {
            setError('');
            setFile(selectedFile);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        validateSetFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            validateSetFile(droppedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) return;

        setIsLoading(true);
        setError('');

        try {
            await uploadCv(file);
            setIsSuccess(true);
        } catch (err) {
            setError(err.message || t('cv_upload.errors.default'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <ModalConfirmation
                isOpen={true}
                type="success"
                isSuccess={true}
                title={t('cv_upload.successMessage')}
                details={file?.name}
                confirmText={t('common.confirm')}
                onConfirm={onUploadSuccess}
            />
        );
    }

    return (
        <div onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => e.preventDefault()}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t('cv_upload.title')}
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <input type="file" id="cv-upload-input"
                               accept="application/pdf" onChange={handleFileChange}
                               className="hidden"
                        />
                        <label
                            htmlFor="cv-upload-input"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`cursor-pointer flex items-center w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors bg-gray-50 ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-300"
                                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors bg-gray-50"
                            }`}
                        >
                            <span className="text-sm text-gray-700 font-medium whitespace-nowrap px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                                {t("cv_upload.choose_file")}
                            </span>
                            <span className="text-sm text-gray-500 truncate ml-3 flex-1">
                                {file ? file.name : t("cv_upload.no_file_chosen")}
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={!file || isLoading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                            !file || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? t('cv_upload.loading') : t('cv_upload.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}