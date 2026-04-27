"use client";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface AppPaginationProps {
    currentPage: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    onPageChange: (page: number) => void;
}

export function AppPagination({
    currentPage,
    totalPages,
    hasPrevious,
    hasNext,
    onPageChange,
}: AppPaginationProps) {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }

    return (
        <Pagination className="justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (hasPrevious) onPageChange(currentPage - 1); }}
                        className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
                {pages.map((p) => (
                    <PaginationItem key={p}>
                        <PaginationLink
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                        >
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (hasNext) onPageChange(currentPage + 1); }}
                        className={!hasNext ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
