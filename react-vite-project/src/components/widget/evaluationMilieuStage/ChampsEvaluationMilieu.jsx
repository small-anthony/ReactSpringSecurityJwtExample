import React from "react";
import { AlertCircle, Check } from "lucide-react";

export function ErreurChampInline({ message }) {
    if (!message) return null;
    return (
        <p role="alert" className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

export const classeChampEvaluation = (erreursChamps, champ) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 transition focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-600 ${
        erreursChamps[champ]
            ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500"
            : "border-gray-200 bg-white focus:ring-blue-200 focus:border-blue-500"
    }`;

export function OptionRadio({ nom, valeur, selectionnee, onSelect, disabled, ariaLabel, children }) {
    const couleurs = selectionnee
        ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-100"
        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40";
    const curseur = disabled ? "cursor-default opacity-90" : "cursor-pointer";
    return (
        <label
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all focus-within:ring-2 focus-within:ring-blue-300 ${couleurs} ${curseur}`}
        >
            <input
                type="radio"
                name={nom}
                value={valeur}
                checked={selectionnee}
                disabled={disabled}
                onChange={onSelect}
                aria-label={ariaLabel}
                className="sr-only"
            />
            {selectionnee && <Check className="w-3.5 h-3.5 shrink-0" />}
            <span>{children}</span>
        </label>
    );
}

export function GroupeRadioEvaluation({ nom, label, options, valeurSelectionnee, erreur, disabled, onSelect }) {
    return (
        <div
            data-champ-erreur={Boolean(erreur)}
            className={erreur ? "rounded-xl p-3 -mx-3 bg-rose-50/40 ring-1 ring-inset ring-rose-200 transition-colors" : "transition-colors"}
        >
            <p className="text-sm font-semibold text-gray-700 mb-2">
                {label} <span className="text-rose-500">*</span>
            </p>
            <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <OptionRadio
                        key={String(opt.valeur)}
                        nom={nom}
                        valeur={String(opt.radioValeur ?? opt.valeur)}
                        selectionnee={valeurSelectionnee === opt.valeur}
                        onSelect={() => onSelect(opt.valeur)}
                        disabled={disabled}
                        ariaLabel={opt.libelle}
                    >
                        {opt.libelle}
                    </OptionRadio>
                ))}
            </div>
            <ErreurChampInline message={erreur} />
        </div>
    );
}

export function InfoCase({ icone, libelle, valeur }) {
    return (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">{icone}</div>
            <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{libelle}</span>
                <span className="block text-xs font-semibold text-gray-800 truncate">{valeur || "—"}</span>
            </div>
        </div>
    );
}

export function ChampTexteEvaluation({
    id,
    label,
    champ,
    formulaire,
    erreursChamps,
    lecture,
    majChamp,
    obligatoire = true,
    type = "text",
    placeholder,
    spanClass = "",
    labelClass = "block text-sm font-semibold text-gray-700 mb-1.5",
    inputMode
}) {
    const erreur = erreursChamps[champ];
    return (
        <div className={spanClass} data-champ-erreur={Boolean(erreur)}>
            <label htmlFor={id} className={labelClass}>
                {label}{obligatoire && !lecture ? <span className="text-rose-500 ml-1">*</span> : ""}
            </label>
            <input
                id={id}
                type={type}
                inputMode={inputMode}
                value={formulaire[champ]}
                onChange={(e) => majChamp(champ, e.target.value)}
                placeholder={placeholder}
                disabled={lecture}
                aria-invalid={Boolean(erreur)}
                className={classeChampEvaluation(erreursChamps, champ)}
            />
            <ErreurChampInline message={erreur} />
        </div>
    );
}
