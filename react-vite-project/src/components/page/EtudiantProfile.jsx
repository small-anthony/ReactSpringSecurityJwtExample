import CvUploadModal from "../modal/CvUploadModal.jsx";
import { useEffect, useState } from "react";
import { checkCvExists } from "../../services/api/CvEtudiantAPI.jsx";
import {useTranslation} from "react-i18next";

export default function EtudiantProfile() {
    const { t } = useTranslation("main");
    const [cvExiste, setCvExiste] = useState(null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const verifierCv = async () => {
            try {
                setCvExiste(await checkCvExists());
            } catch (error) {
                setErreur("Une erreur est survenue lors de la vérification du CV");
                setCvExiste(false);
            }
        };

        verifierCv();
    }, []);

    if (cvExiste === null && !erreur) {
        return <div className="p-8 text-center text-slate-500">{t("etudiant_profile.loading")}</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-3xl font-bold mb-6">{t("etudiant_profile.title")}</h1>

            {erreur && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md">
                    {erreur}
                </div>
            )}

            {cvExiste === false ? (
                <CvUploadModal
                    onUploadSuccess={() => {
                        setCvExiste(true);
                        setErreur(null);
                    }}
                />
            ) : (
                <h2 className="text-xl font-semibold mb-4">{t("etudiant_profile.cv_uploaded")}</h2>
            )}
        </div>
    );
}