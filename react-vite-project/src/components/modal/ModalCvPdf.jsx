import {useTranslation} from "react-i18next";
import {X} from "lucide-react";

export default function ModalCvPdf({ pdfUrl, onClose, titre }) {
    const { t } = useTranslation("main");

    if (!pdfUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{titre}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                        title={t('approbation.cvs.close')}
                    >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                </div>
                <div className="flex-grow bg-gray-100 p-2">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full rounded-xl border-none shadow-inner"
                        title={titre}
                    ></iframe>
                </div>
            </div>
        </div>
    );
}