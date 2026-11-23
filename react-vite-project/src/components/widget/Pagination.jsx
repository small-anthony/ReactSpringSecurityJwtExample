import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

function buildPageNumbers(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
        pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i += 1) {
        pages.push(i);
    }

    if (end < totalPages - 1) {
        pages.push("ellipsis-end");
    }

    pages.push(totalPages);
    return pages;
}

export default function Pagination({
    page,
    totalItems,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    className = ""
}) {
    const { t } = useTranslation("main");
    const minSize = pageSizeOptions[0] ?? pageSize;

    if (!totalItems || totalItems <= minSize) {
        return null;
    }

    const debut = (page - 1) * pageSize + 1;
    const fin = Math.min(totalItems, page * pageSize);
    const pages = buildPageNumbers(page, totalPages);

    return (
        <div
            className={`mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-2xs ${className}`}
        >
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-medium">
                    {t("pagination.info", { debut, fin, total: totalItems })}
                </span>

                {onPageSizeChange && (
                    <label className="inline-flex items-center gap-1.5">
                        <span className="text-slate-500">{t("pagination.per_page")}</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {totalPages > 1 && (
                <nav className="flex items-center gap-1 flex-wrap justify-center" aria-label="Pagination">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        aria-label={t("pagination.prev")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t("pagination.prev")}</span>
                    </button>

                    {pages.map((item) => {
                        if (typeof item === "string") {
                            return (
                                <span key={item} className="px-1.5 text-xs text-slate-400 select-none">
                                    …
                                </span>
                            );
                        }
                        const isActive = item === page;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                aria-label={t("pagination.page_label", { page: item })}
                                aria-current={isActive ? "page" : undefined}
                                className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        aria-label={t("pagination.next")}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                        <span className="hidden sm:inline">{t("pagination.next")}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </nav>
            )}
        </div>
    );
}
