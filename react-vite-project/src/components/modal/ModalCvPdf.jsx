import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

export default function ModalCvPdf({ pdfUrl, onClose, titre }) {
    const { t } = useTranslation("main");
    const [nombrePages, setNombrePages] = useState(0);
    const [pageCourante, setPageCourante] = useState(1);

    if (!pdfUrl) return null;

    const pagePrecedente = () => setPageCourante((p) => Math.max(1, p - 1));
    const pageSuivante = () => setPageCourante((p) => Math.min(nombrePages, p + 1));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{titre}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"
                        title={t("approbation.cvs.close")}
                    >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-grow bg-gray-100 p-2 overflow-auto flex justify-center">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={({ numPages }) => {
                            setNombrePages(numPages);
                            setPageCourante(1);
                        }}
                        loading={
                            <p className="text-gray-500 p-4">
                                {t("approbation.cvs.loading_pdf", { defaultValue: "Chargement du PDF..." })}
                            </p>
                        }
                        error={
                            <p className="text-red-600 p-4">
                                {t("approbation.cvs.error_pdf", { defaultValue: "Impossible d'afficher le PDF." })}
                            </p>
                        }
                    >
                        <Page pageNumber={pageCourante} width={800} className="shadow-inner" />
                    </Document>
                </div>

                {nombrePages > 1 && (
                    <div className="flex items-center justify-center gap-4 p-3 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={pagePrecedente}
                            disabled={pageCourante <= 1}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {t("approbation.cvs.previous_page", { defaultValue: "Précédente" })}
                        </button>
                        <span className="text-sm text-gray-700">
                            {t("approbation.cvs.page_of", {
                                defaultValue: "Page {{current}} / {{total}}",
                                current: pageCourante,
                                total: nombrePages,
                            })}
                        </span>
                        <button
                            type="button"
                            onClick={pageSuivante}
                            disabled={pageCourante >= nombrePages}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {t("approbation.cvs.next_page", { defaultValue: "Suivante" })}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}