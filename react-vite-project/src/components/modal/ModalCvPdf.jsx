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

const LARGEUR_PAGE = 800;
const RATIO_PAGE_PAR_DEFAUT = 1.414;
const ESPACE_ENTRE_PAGES = 12;
const MARGE_INTERIEURE = 8;
const PAGES_VOISINES_AFFICHEES = 2;

function PagePdf({ numero, largeur, ratio, afficher, onDimensions }) {
    return (
        <div
            className="bg-white shadow-md"
            style={{
                width: largeur,
                height: largeur * ratio,
                marginBottom: ESPACE_ENTRE_PAGES,
            }}
        >
            {afficher && (
                <Page
                    pageNumber={numero}
                    width={largeur}
                    onLoadSuccess={numero === 1 ? onDimensions : undefined}
                />
            )}
        </div>
    );
}

export default function ModalCvPdf({ pdfUrl, onClose, titre }) {
    const { t } = useTranslation("main");
    const [nombrePages, setNombrePages] = useState(0);
    const [pageCourante, setPageCourante] = useState(1);
    const [ratio, setRatio] = useState(RATIO_PAGE_PAR_DEFAUT);

    if (!pdfUrl) return null;

    const hauteurParPage = LARGEUR_PAGE * ratio + ESPACE_ENTRE_PAGES;

    const surDefilement = (event) => {
        const { scrollTop, clientHeight } = event.currentTarget;
        const milieu = scrollTop + clientHeight / 2 - MARGE_INTERIEURE;
        const index = Math.floor(milieu / hauteurParPage);
        setPageCourante(Math.min(Math.max(index + 1, 1), nombrePages));
    };

    const surChargementPremierePage = (page) => {
        setRatio(page.originalHeight / page.originalWidth);
    };

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
                    <div className="flex items-center gap-2">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold shadow-xs transition cursor-pointer"
                            title={t("contrats.actions.print", { defaultValue: "Imprimer" })}
                        >
                            <Printer className="w-3.5 h-3.5 text-gray-600" />
                            <span>{t("contrats.actions.print", { defaultValue: "Imprimer" })}</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            title={t("approbation.cvs.close")}
                        >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div onScroll={surDefilement} className="flex-grow bg-gray-100 p-2 overflow-auto">
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
                        <div className="flex flex-col items-center">
                            {Array.from({ length: nombrePages }, (_, index) => {
                                const numero = index + 1;
                                return (
                                    <PagePdf
                                        key={numero}
                                        numero={numero}
                                        largeur={LARGEUR_PAGE}
                                        ratio={ratio}
                                        afficher={Math.abs(numero - pageCourante) <= PAGES_VOISINES_AFFICHEES}
                                        onDimensions={surChargementPremierePage}
                                    />
                                );
                            })}
                        </div>
                    </Document>
                </div>

                {nombrePages > 1 && (
                    <div className="flex items-center justify-center p-3 border-t border-gray-200 bg-gray-50">
                        <span className="text-sm text-gray-700">
                            {t("approbation.cvs.page_of", {
                                defaultValue: "Page {{current}} / {{total}}",
                                current: pageCourante,
                                total: nombrePages,
                            })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}