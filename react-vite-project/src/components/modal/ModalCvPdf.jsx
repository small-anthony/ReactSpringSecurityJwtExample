import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Printer } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const LARGEUR_MAX = 800;
const RATIO_PAGE_PAR_DEFAUT = 1.414;

function PagePdf({ numero, largeur, racine }) {
    const conteneurRef = useRef(null);
    const [visible, setVisible] = useState(typeof IntersectionObserver === "undefined");
    const [rendue, setRendue] = useState(false);

    useEffect(() => {
        if (visible) return undefined;
        const element = conteneurRef.current;
        if (!element || !racine) return undefined;
        const observateur = new IntersectionObserver(
            ([entree]) => {
                if (entree.isIntersecting) {
                    setVisible(true);
                    observateur.disconnect();
                }
            },
            { root: racine, rootMargin: "1200px 0px" }
        );
        observateur.observe(element);
        return () => observateur.disconnect();
    }, [visible, racine]);

    return (
        <div
            ref={conteneurRef}
            data-page={numero}
            className="mb-3 bg-white shadow-md"
            style={{ width: largeur, minHeight: rendue ? undefined : largeur * RATIO_PAGE_PAR_DEFAUT }}
        >
            {visible && (
                <Page
                    pageNumber={numero}
                    width={largeur}
                    onRenderSuccess={() => setRendue(true)}
                />
            )}
        </div>
    );
}

export default function ModalCvPdf({ pdfUrl, onClose, titre }) {
    const { t } = useTranslation("main");
    const [nombrePages, setNombrePages] = useState(0);
    const [pageCourante, setPageCourante] = useState(1);
    const [racine, setRacine] = useState(null);
    const [largeur, setLargeur] = useState(LARGEUR_MAX);
    const imageRef = useRef(null);

    useEffect(() => {
        if (!racine || typeof ResizeObserver === "undefined") return undefined;
        const mettreAJour = () =>
            setLargeur(Math.max(200, Math.min(LARGEUR_MAX, racine.clientWidth - 32)));
        mettreAJour();
        const observateur = new ResizeObserver(mettreAJour);
        observateur.observe(racine);
        return () => observateur.disconnect();
    }, [racine]);

    useEffect(() => {
        return () => {
            if (imageRef.current) cancelAnimationFrame(imageRef.current);
        };
    }, []);

    const mettreAJourPageCourante = useCallback(() => {
        if (!racine) return;
        const limites = racine.getBoundingClientRect();
        const milieu = limites.top + limites.height / 2;
        const pages = racine.querySelectorAll("[data-page]");
        for (const page of pages) {
            const rect = page.getBoundingClientRect();
            if (rect.top <= milieu && rect.bottom > milieu) {
                setPageCourante(Number(page.dataset.page));
                return;
            }
        }
    }, [racine]);

    const surDefilement = () => {
        if (imageRef.current) return;
        imageRef.current = requestAnimationFrame(() => {
            imageRef.current = null;
            mettreAJourPageCourante();
        });
    };

    if (!pdfUrl) return null;

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
                        <button
                            type="button"
                            onClick={handleImprimer}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold shadow-xs transition cursor-pointer"
                            title={t("contrats.actions.print", { defaultValue: "Imprimer" })}
                        >
                            <Printer className="w-3.5 h-3.5 text-gray-600" />
                            <span>{t("contrats.actions.print", { defaultValue: "Imprimer" })}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            title={t("approbation.cvs.close")}
                        >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div
                    ref={setRacine}
                    onScroll={surDefilement}
                    className="flex-grow bg-gray-100 p-2 overflow-auto"
                >
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
                            {Array.from({ length: nombrePages }, (_, index) => (
                                <PagePdf
                                    key={index + 1}
                                    numero={index + 1}
                                    largeur={largeur}
                                    racine={racine}
                                />
                            ))}
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