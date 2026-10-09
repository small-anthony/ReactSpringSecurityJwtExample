import { useTranslation } from "react-i18next";
import { useState } from "react";
import { verifierMatricule } from "../../services/api/EtudiantService";
import { Check, Plus, X } from "lucide-react";

export default function ModalApprobation({ offre, onClose, onConfirm, authHeader }) {
    const { t } = useTranslation("main");
    const [etudiantsCibles, setEtudiantsCibles] = useState([]);
    const [matriculeInput, setMatriculeInput] = useState("");
    const [verificationStatus, setVerificationStatus] = useState(null);

    const handleVerifier = () => {
        if (!matriculeInput) return;

        verifierMatricule(matriculeInput, authHeader)
            .then((etudiantTrouve) => {
                setVerificationStatus('success');
                if (!etudiantsCibles.find(e => e.id === etudiantTrouve.id)) {
                    setEtudiantsCibles(prev => [...prev, etudiantTrouve]);
                }
                setMatriculeInput("");
                setTimeout(() => setVerificationStatus(null), 1500);
            })
            .catch(() => {
                setVerificationStatus('error');
                setTimeout(() => setVerificationStatus(null), 1500);
            });
    };

    const handleRetirer = (etudiantId) => {
        setEtudiantsCibles(prev => prev.filter(e => e.id !== etudiantId));
    };

    return (
        <div className="mt-6 pt-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">{t('approbation.offres.approbation.title')}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <X className="w-5 h-5" strokeWidth={2} />
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
                {t('approbation.offres.approbation.question', { titre: offre.titre })} <span className="font-semibold text-gray-900">"{offre.titre}"</span> visible pour tous les étudiants, ou la restreindre ?
            </p>
            
            <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('approbation.offres.approbation.target')}</label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('approbation.offres.approbation.search')}
                            className="w-full text-sm border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={matriculeInput}
                            onChange={(e) => {
                                setMatriculeInput(e.target.value);
                                setVerificationStatus(null);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleVerifier(); }}
                        />
                        <button
                            onClick={handleVerifier}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {verificationStatus === 'success' ? (
                                <Check className="w-5 h-5 text-green-500" strokeWidth={2.5} />
                            ) : verificationStatus === 'error' ? (
                                <X className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                            ) : (
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                            )}
                        </button>
                    </div>
                </div>

                {etudiantsCibles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        {etudiantsCibles.map(etud => (
                            <span key={etud.id} className="inline-flex items-center gap-1.5 bg-white text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-blue-200 shadow-sm">
                                {etud.firstName} {etud.lastName}
                                <button onClick={() => handleRetirer(etud.id)} className="text-blue-400 hover:text-red-500 focus:outline-none">
                                    <X className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-3 justify-end">
                <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    {t('approbation.offres.approbation.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(offre.id, etudiantsCibles.map(e => e.id))}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm text-white bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    {t('approbation.offres.approbation.confirm')}
                </button>
            </div>
        </div>
    );
}