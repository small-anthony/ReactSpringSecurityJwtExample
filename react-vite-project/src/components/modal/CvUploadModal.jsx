import React, { useState } from 'react';
import { uploadCv } from '../../api/CvEtudiantAPI.jsx';

export default function CvUploadModal({ etudiantId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Veuillez sélectionner un fichier PDF.');
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
            await uploadCv(etudiantId, file);
            onUploadSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Soumission obligatoire du CV
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="file"
                               accept="application/pdf" onChange={handleFileChange}
                               className="block w-full text-sm text-gray-500 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                               required
                        />
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
                        {isLoading ? "Televersement en cours..." : "Soumettre mon CV"}
                    </button>
                </form>
            </div>
        </div>
    );
}