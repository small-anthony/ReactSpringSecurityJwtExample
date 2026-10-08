import React, { useState } from 'react';
import { uploadCv } from '../../services/api/CvEtudiantAPI.jsx';
import {useTranslation} from "react-i18next";
import {X} from "lucide-react";

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
                onUploadSuccess();
            }, 2000);
        } catch (err) {
            setError(err.message || t('cv_upload.errors.default'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative">
                {isSuccess ? (
                    <div className="p-4 bg-green-50 text-green-700 text-center rounded-md">
                        {t('cv_upload.successMessage')}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {t('cv_upload.title')}
                            </h2>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    type="button"
                                    className="text-gray-400 hover:text-gray-800 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input type="file" id="cv-upload-input"
                                       accept="application/pdf" onChange={handleFileChange}
                                       className="hidden"
                                       required
                                />
                                <label
                                    htmlFor="cv-upload-input"
                                    className="cursor-pointer flex items-center w-full px-3 py-2 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors bg-gray-50"
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
                    </>
                )}
            </div>
        </div>
    );
}