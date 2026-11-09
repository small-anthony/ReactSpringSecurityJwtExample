import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Printer } from "lucide-react";
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

    const handleImprimer = () => {
        try {
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            iframe.src = pdfUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            };
        } catch {
            window.print();
        }
    };

    return (
        <div
            className="ds-modal-backdrop animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ds-modal-panel max-w-4xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">{titre}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleImprimer}
                            className="btn-secondary py-1.5 px-3 text-xs"
                            title={t("contrats.actions.print")}
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>{t("contrats.actions.print")}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200/80 text-slate-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title={t("approbation.cvs.close")}
                        >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex-grow bg-slate-100 p-2 overflow-auto flex justify-center">
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={({ numPages }) => {
                            setNombrePages(numPages);
                            setPageCourante(1);
                        }}
                        loading={
                            <p className="text-slate-500 p-4 font-medium">
                                {t("approbation.cvs.loading_pdf")}
                            </p>
                        }
                        error={
                            <p className="text-red-600 p-4 font-medium">
                                {t("approbation.cvs.error_pdf")}
                            </p>
                        }
                    >
                        <Page pageNumber={pageCourante} width={800} className="shadow-inner" />
                    </Document>
                </div>

                {nombrePages > 1 && (
                    <div className="flex items-center justify-center gap-4 p-3 border-t border-slate-200 bg-slate-50">
                        <button
                            type="button"
                            onClick={pagePrecedente}
                            disabled={pageCourante <= 1}
                            className="btn-primary py-1.5 px-4 text-xs"
                        >
                            {t("approbation.cvs.previous_page")}
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                            {t("approbation.cvs.page_of", {
                                current: pageCourante,
                                total: nombrePages,
                            })}
                        </span>
                        <button
                            type="button"
                            onClick={pageSuivante}
                            disabled={pageCourante >= nombrePages}
                            className="btn-primary py-1.5 px-4 text-xs"
                        >
                            {t("approbation.cvs.next_page")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}