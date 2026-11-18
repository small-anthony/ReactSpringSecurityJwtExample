import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { rechercherEtudiants } from "../../services/api/EtudiantService.js";
import { Check, X, Search } from "lucide-react";

export default function ModalApprobation({ offre, onClose, onConfirm, authHeader }) {
    const { t } = useTranslation("main");
    const [etudiantsCibles, setEtudiantsCibles] = useState([]);

    const [rechercheInput, setRechercheInput] = useState("");
    const [resultats, setResultats] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (rechercheInput.trim() === "") {
            setResultats([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(() => {
            rechercherEtudiants(rechercheInput, authHeader)
                .then(data => {
                    setResultats(data);
                    setShowDropdown(true);
                })
                .catch(() => setResultats([]));
        }, 300);

        return () => clearTimeout(timer);
    }, [rechercheInput, authHeader]);

    const handleAjouter = (etudiant) => {
        if (!etudiantsCibles.find(e => e.id === etudiant.id)) {
            setEtudiantsCibles(prev => [...prev, etudiant]);
        }
        setRechercheInput("");
        setResultats([]);
        setShowDropdown(false);
    };

    const handleRetirer = (etudiantId) => {
        setEtudiantsCibles(prev => prev.filter(e => e.id !== etudiantId));
    };

    return (
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-900">{t('approbation.offres.approbation.title')}</h3>
            </div>

            <p className="text-sm text-slate-600 mb-5">
                {t('approbation.offres.approbation.question', { titre: offre.titre })}
            </p>

            <div className="mb-4">
                <label className="ds-label">{t('approbation.offres.approbation.target')}</label>
                <div className="flex items-center gap-2">

                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('approbation.offres.approbation.search_placeholder')}
                            className="ds-input pl-9"
                            value={rechercheInput}
                            onChange={(e) => {
                                setRechercheInput(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => {
                                if (resultats.length > 0) setShowDropdown(true);
                            }}
                            onBlur={() => setShowDropdown(false)}
                        />

                        {showDropdown && resultats.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                {resultats.map(etud => (
                                    <div
                                        key={etud.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAjouter(etud);
                                        }}
                                        className="flex justify-between items-center px-4 py-3 text-sm border-b border-slate-100 hover:bg-slate-50 cursor-pointer last:border-0 transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{etud.firstName} {etud.lastName}</span>
                                            <span className="text-slate-500 text-xs mt-0.5">{etud.email}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono text-xs">{etud.matricule}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {etudiantsCibles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {etudiantsCibles.map(etud => (
                            <span key={etud.id} className="inline-flex items-center gap-1.5 bg-white text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                                {etud.firstName} {etud.lastName}
                                <button onClick={() => handleRetirer(etud.id)} className="text-slate-400 hover:text-red-500 focus:outline-none cursor-pointer">
                                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-4 justify-end">
                <button onClick={onClose} className="btn-secondary">
                    {t('approbation.offres.approbation.cancel')}
                </button>
                <button
                    onClick={() => onConfirm(offre.id, etudiantsCibles.map(e => e.id))}
                    className="btn-success"
                >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    {t('approbation.offres.approbation.confirm')}
                </button>
            </div>
        </div>
    );
}