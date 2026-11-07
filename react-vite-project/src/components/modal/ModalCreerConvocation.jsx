import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CalendarInput from "./CalendarInput.jsx";
import { Building, Clock, Mail } from "lucide-react";

function isDateValid(date, minDate) {
    return date.getTime() >= minDate.getTime();
}

function RendezVousCard({ index, date, lieu, onChange, onRemove }) {
    const { t } = useTranslation(["main"]);

    const dateValue = useRef(date);
    const tempsRef = useRef(null);
    const lieuRef = useRef(null);

    const theActualTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    minDate.setHours(0, 0, 0, 0);

    function onFormChange() {
        const maDate = new Date(dateValue.current);
        const monTemps = tempsRef.current.value.toString();
        maDate.setHours(Number(monTemps.slice(0, 2)), Number(monTemps.slice(3, 5)), 0, 0);
        onChange(index, {
            date: maDate,
            lieu: lieuRef.current.value,
        });
    }

    function onDateChange(newDate) {
        dateValue.current = newDate;
        onFormChange();
    }

    return (
        <div className="flex flex-col gap-2 bg-white rounded-lg p-3 border border-gray-200 shadow-sm w-full">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">
                    {t("candidatures_offre.slot", { number: index + 1 })}
                </span>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                >
                    {t("common.delete")}
                </button>
            </div>

            <div className="flex flex-row gap-2">
                <CalendarInput
                    buttonClassName={!isDateValid(dateValue.current, minDate) && "border-red-500"}
                    min={minDate}
                    onChange={onDateChange}
                    defaultValue={date}
                    required
                    allowClear={false}
                />
                <div className="flex items-center rounded-xl p-1 px-3 border border-gray-300">
                    <input
                        ref={tempsRef}
                        onChange={onFormChange}
                        className="text-sm font-medium focus:outline-none"
                        type="time"
                        defaultValue={theActualTime}
                        required
                    />
                </div>
            </div>

            <div className="relative flex items-center border border-gray-300 rounded-xl h-10 px-3">
                <Building className="w-4 h-4 text-blue-500 shrink-0 pointer-events-none" />
                <input
                    ref={lieuRef}
                    onChange={onFormChange}
                    className="w-full pl-2 text-sm font-medium focus:outline-none placeholder:text-gray-400"
                    type="text"
                    defaultValue={lieu || ""}
                    placeholder={t('placeholder.lieu')}
                    required
                />
            </div>
        </div>
    );
}

export default function ModalCreerConvocation({
    rendezVousPossibles,
    onConfirm,
    onCancel,
}) {
    const { t } = useTranslation(["main"]);
    const [finalRendezVous, setFinalRendezVous] = useState(rendezVousPossibles || []);
    const messageRef = useRef(null);

    const peutConfirmer =
        finalRendezVous.length > 0 &&
        finalRendezVous.every((rv) => rv.lieu && rv.lieu.trim() !== "");

    function updateRendezVous(index, data) {
        setFinalRendezVous(finalRendezVous.map((dat, i) => (i === index ? data : dat)));
    }

    function appendRendezVous(data) {
        setFinalRendezVous([...finalRendezVous, data]);
    }

    function removeRendezVous(index) {
        setFinalRendezVous(finalRendezVous.filter((_, i) => i !== index));
    }

    function onChange(index, data) {
        updateRendezVous(index, data);
    }

    function onInsert() {
        const newDate = new Date();
        newDate.setTime(newDate.getTime() - newDate.getTimezoneOffset());
        newDate.setDate(newDate.getDate() + 3);
        appendRendezVous({
            date: newDate,
            lieu: "",
        });
    }

    function onRemove(index) {
        removeRendezVous(index);
    }

    function onSubmit() {
        onConfirm(finalRendezVous, messageRef.current.value);
    }

    return (
        <div className="ds-modal-backdrop">
            <div className="ds-modal-panel max-w-lg p-6 flex flex-col gap-4 max-h-[90vh]">
                <h2 className="text-xl font-bold text-slate-900">
                    {t("candidatures_offre.modal_convoquer_title")}
                </h2>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-3 max-h-72 overflow-y-auto">
                    {finalRendezVous.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
                            <Clock className="w-6 h-6" />
                            <p className="text-sm">{t('candidatures_offre.create_rendezvous')}</p>
                        </div>
                    ) : (
                        finalRendezVous.map((entry, index) => (
                            <RendezVousCard
                                key={index}
                                index={index}
                                date={entry.date}
                                lieu={entry.lieu}
                                onChange={onChange}
                                onRemove={onRemove}
                            />
                        ))
                    )}

                    <button
                        type="button"
                        onClick={onInsert}
                        className="btn-outline w-full py-2"
                    >
                        {t("candidatures_offre.add_slot")}
                    </button>
                </div>

                <div className="relative flex items-start bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-1 pointer-events-none" />
                    <textarea
                        ref={messageRef}
                        className="w-full pl-2 text-sm bg-transparent focus:outline-none resize-none h-16 placeholder:text-slate-400 text-slate-900"
                        placeholder={t('placeholder.message')}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!peutConfirmer}
                        className="btn-success"
                    >
                        {t("common.confirm")}
                    </button>
                </div>
            </div>
        </div>
    );
}
