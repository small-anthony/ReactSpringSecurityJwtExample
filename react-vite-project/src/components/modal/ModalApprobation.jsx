import { useState } from "react";
import { verifierMatricule } from "../../services/api/EtudiantService";
import { Check, Plus, X } from "lucide-react";

export default function ModalApprobation({ offre, onClose, onConfirm, authHeader }) {
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
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Approuver l'offre</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">
                        Souhaitez-vous rendre <span className="font-semibold text-gray-900">"{offre.titre}"</span> visible pour tous les étudiants, ou la restreindre ?
                    </p>
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Étudiants ciblés (Optionnel)</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Chercher par matricule (ex: 12345)"
                                    className="w-full text-sm border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
                        <button
                            onClick={() => onConfirm(offre.id, etudiantsCibles.map(e => e.id))}
                            className="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}