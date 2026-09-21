import React, { useState } from 'react';
import { uploadCv } from '../../services/api/CvEtudiantAPI.jsx';
import { useTranslation } from "react-i18next";

export default function CvUploadModal({ onUploadSuccess, onClose }) {
    const { t } = useTranslation("main");

    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError(t('cv_upload.errors.notPdf'));
            setFile(null);
        } else {
            setError('');
            setFile(selectedFile);
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

            setTimeout(() => {
                if (onUploadSuccess) onUploadSuccess();
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || t('cv_upload.errors.default'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        >
            <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative transition-all">
                {onClose && !isLoading && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                )}

                {isSuccess ? (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-center rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                        <div className="text-3xl">✓</div>
                        <p className="font-semibold">{t('cv_upload.success')}</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {t('cv_upload.title')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {t('cv_upload.subtitle') || "Format accepté : PDF uniquement"}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Fichier PDF
                                </label>
                                <input 
                                    type="file"
                                    accept="application/pdf" 
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950/50 dark:file:text-blue-300 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-800">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                {onClose && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors disabled:opacity-50"
                                    >
                                        Annuler
                                    </button>
                                )}
                                <button
                                    type="submit" 
                                    disabled={!file || isLoading}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium shadow-md transition-all ${
                                        !file || isLoading 
                                            ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed shadow-none' 
                                            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/25'
                                    }`}
                                >
                                    {isLoading ? t('cv_upload.uploading') : t('cv_upload.submit')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}