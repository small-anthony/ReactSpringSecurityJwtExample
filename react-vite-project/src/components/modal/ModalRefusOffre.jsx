import { useState } from "react";

export default function ModalRefusOffre({ offre, onClose, onConfirm }) {
    const [message, setMessage] = useState("");

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">
                        Refuser l'offre
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        Vous êtes sur le point de refuser l'offre <span className="font-semibold text-gray-900">"{offre.titre}"</span>. Veuillez indiquer le motif du refus pour l'employeur.
                    </p>

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Motif du refus <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow resize-none"
                            rows="4"
                            placeholder="Ex: La description du stage est trop courte..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    {/* --- Boutons d'action --- */}
                    <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={() => onConfirm(offre.id, message)}
                            disabled={!message.trim()}
                            className={`px-5 py-2.5 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm ${
                                !message.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Confirmer le refus
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}