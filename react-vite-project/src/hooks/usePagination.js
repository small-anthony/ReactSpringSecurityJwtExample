import { useEffect, useMemo, useState } from "react";

export function usePagination(items = [], initialPageSize = 10, resetDeps = []) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalItems = Array.isArray(items) ? items.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, resetDeps);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    const handleChangePageSize = (nextSize) => {
        setPageSize(nextSize);
        setPage(1);
    };

    return {
        page: safePage,
        setPage,
        pageSize,
        setPageSize: handleChangePageSize,
        totalItems,
        totalPages,
        paginatedItems
    };
}
