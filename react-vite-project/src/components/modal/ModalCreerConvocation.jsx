import React, {useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import CalendarInput from "./CalendarInput.tsx";
import { Building, Clock, Mail, Plus, Trash } from "lucide-react";

function RendezVousCard({
    index,
    date, // incluant le temps
    lieu,
    onChange,
    onRemove,
}) {
    const { t } = useTranslation(["main"])

    const dateValue = useRef(date);
    const tempsRef = useRef(null);
    const lieuRef = useRef(null);

    const theActualTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    minDate.setHours(0, 0, 0, 0);

    function onFormChange(e) {
        const maDate = dateValue.current;
        const monTemps = tempsRef.current.value.toString();
        maDate.setHours(monTemps.slice(0, 2), monTemps.slice(3, 5), 0, 0);
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
        <form onChange={(e) => {e.preventDefault(); onFormChange();}} className="relative shadow w-100">
            <div className="absolute inset-0">
                <button onClick={(e) => {e.preventDefault(); onRemove(index);}} className="absolute inset-y-4 inset-x-0 -right-2 hover:-right-6 bg-red-500 border-black border flex items-center justify-end rounded hover:text-white text-transparent">
                    <Trash className=""/>
                </button>
            </div>
            <div className="flex flex-col gap-2 bg-white relative rounded p-2">
                <div className={"flex flex-row gap-2 z-auto"}>
                    <CalendarInput min={minDate} onChange={onDateChange} defaultValue={date} required allowClear={false}/>
                    <div className="flex items-center rounded-xl p-1 px-3 border border-gray-300">
                        <input ref={tempsRef} className="text-sm font-medium" type="time" defaultValue={theActualTime} required/>
                    </div>
                </div>
                <div className="flex flex-row items-center border border-gray-300 rounded-xl gap-2.5 h-10">
                    <Building className="absolute pointer-events-none w-10.5 h-4 align-middle inline-block text-blue-500"/>
                    <input ref={lieuRef} className="ps-10.5 w-full h-8 text-sm font-medium focus:outline-0 placeholder:text-gray-400" type="text" defaultValue={lieu} placeholder={t('placeholder.lieu')} required/>
                </div>
            </div>
        </form>
        );
}

export default function ModalCreerConvocation({
    rendezVousPossibles,
    onConfirm,
    onCancel,
}) {
    const { t } = useTranslation(["main"]);
    const [finalRendezVous, setFinalRendezVous] = useState(rendezVousPossibles);

    const messageRef = useRef(null);

    function updateRendezVous(index, data) {
        setFinalRendezVous(finalRendezVous.map((dat, i) => i === index ? data : dat));
    }

    function appendRendezVous(data) {
        setFinalRendezVous([...finalRendezVous, data])
    }

    function removeRendezVous(index) {
        setFinalRendezVous(finalRendezVous.filter((_, i) => i !== index));
    }

    function onChange(index, data) {
        updateRendezVous(index, data);
    }

    function onInsert(e) {
        const newDate = new Date();
        newDate.setTime(newDate.getTime() - newDate.getTimezoneOffset());
        newDate.setDate(newDate.getDate() + 3)
        appendRendezVous({
            date: newDate,
            lieu: null,
        });
    }

    function onRemove(index) {
        removeRendezVous(index);
    }

    function RenderCards() {
        if(finalRendezVous.length <= 0) {
            return (
                <div className="flex flex-col justify-center items-center text-gray-400">
                    <Clock/>
                    {t('candidatures_offre.create_rendezvous')}
                </div>
            );
        } else {
            return finalRendezVous.map((entry, index) =>
                <RendezVousCard
                    key={index}
                    index={index}
                    date={entry.date}
                    lieu={entry.lieu}
                    onChange={onChange}
                    onRemove={onRemove}
                />)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {t("candidatures_offre.modal_convoquer_title")}
                </h2>
                <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-start gap-2 max-h-100 overflow-x-visible overflow-y-auto">
                    {RenderCards()}
                </div>
                <div className="bg-gray-100 rounded-2xl mt-2 p-2 flex items-center">
                    <textarea ref={messageRef} className="ps-8 w-full h-full focus:outline-0 resize-none field-sizing-content max-h-18" placeholder={t('placeholder.message')} />
                    <Mail className={`absolute pointer-events-none`}/>
                </div>
                <div className="mt-auto pt-4 flex flex-wrap justify-between">
                    <button
                        type="button"
                        onClick={() => onConfirm(finalRendezVous, messageRef.current.value)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                    >
                        {t("common.confirm")}
                    </button>
                    <button
                        type="button"
                        onClick={onInsert}
                        className="px-2 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                    >
                        {<Plus className="w-full h-fit"/>}
                    </button>
                    <button
                        type="button"
                        onClick={() => onCancel()}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                        {t("common.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}