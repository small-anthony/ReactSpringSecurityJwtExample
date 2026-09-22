import CvUploadModal from "../modal/CvUploadModal.jsx";
import {useEffect, useState} from "react";
import {checkCvExists} from "../../services/api/CvEtudiantAPI.jsx";

export const EtudiantHome = () => {
    const [cvExiste, setCvExiste] = useState(null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const verifierCv = async () => {
            try {
                const cvExiste = await checkCvExists();
                setCvExiste(cvExiste);
            } catch (error) {
                setErreur('Une erreur est survenue lors de la vérification du CV');
                setCvExiste(false);
            }
        };

        verifierCv();
    }, []);

    if (cvExiste === null && !erreur) {
        return <div className="p-8 text-center text-slate-500">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord etudiant</h1>

            {erreur && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md">
                    {erreur}
                </div>
            )}
            <p className="text-slate-600">Bienvenue</p>

            {cvExiste === false && (
                <CvUploadModal
                    onUploadSuccess={() => {
                        setCvExiste(true);
                        setErreur(null);
                    }} />
            )}
        </div>
    );
}