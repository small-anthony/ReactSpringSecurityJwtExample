import React, { useState, useEffect } from 'react';
import { uploadCv, getMonCv } from '../../services/api/EtudiantCvService.js';
import {useTranslation} from "react-i18next";
import { X, Eye, FileText } from "lucide-react";
import ModalConfirmation from "./ModalConfirmation.jsx";
import ModalCvPdf from "./ModalCvPdf.jsx";

export default function ModalTeleverserCv({ onUploadSuccess, onClose, cvExiste = false }) {
    const { t } = useTranslation("main");
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const voirCvActuel = async () => {
        try {
            setError('');
            const url = await getMonCv();
            setPdfUrl(url);
        } catch (err) {
            setError(err.message || t('cv_upload.errors.default'));
        }
    };

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
             onClick={onClose}
             className="ds-modal-backdrop">
            <div
                onClick={(e) => e.stopPropagation()}
                className="ds-modal-panel max-w-md p-6 sm:p-8 relative"
            >
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">
                        {t('cv_upload.title')}
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {cvExiste && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">
                                {t('cv_upload.current_cv')}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={voirCvActuel}
                            className="btn-outline py-1.5 px-3 text-xs shrink-0"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('cv_upload.view_current_cv')}</span>
                        </button>
                    </div>
                )}

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
                            className={`cursor-pointer flex items-center w-full px-3.5 py-2.5 border rounded-xl transition-all ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-300"
                                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50"
                            }`}
                        >
                            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs">
                                {t("cv_upload.choose_file")}
                            </span>
                            <span className="text-sm text-slate-500 truncate ml-3 flex-1">
                                {file ? file.name : t("cv_upload.no_file_chosen")}
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="ds-alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit" disabled={!file || isLoading}
                        className="btn-primary w-full py-2.5"
                    >
                        {isLoading ? t('cv_upload.loading') : t('cv_upload.submit')}
                    </button>
                </form>
            </div>

            {pdfUrl && (
                <ModalCvPdf
                    pdfUrl={pdfUrl}
                    titre={t('cv_upload.current_cv')}
                    onClose={() => setPdfUrl(null)}
                />
            )}
        </div>
    );
}