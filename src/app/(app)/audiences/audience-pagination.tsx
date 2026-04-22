"use client";

import type { Pagination as PaginationType } from "@/types/api";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type AudiencePaginationProps = {
    pagination: PaginationType;
    onPageChange: (page: number) => void;
};

export function AudiencePagination({ pagination, onPageChange }: AudiencePaginationProps) {
    const totalPages = pagination.total_pages || 1;
    const currentPage = pagination.page || 1;

    return (
        <Pagination className="mt-8 justify-center sm:justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (pagination.has_previous) onPageChange(currentPage - 1);
                        }}
                        className={!pagination.has_previous ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = idx + 1;
                    else if (currentPage <= 3) pageNum = idx + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
                    else pageNum = currentPage - 2 + idx;

                    return (
                        <PaginationItem key={pageNum}>
                            <PaginationLink
                                href="#"
                                isActive={pageNum === currentPage}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(pageNum);
                                }}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (pagination.has_next) onPageChange(currentPage + 1);
                        }}
                        className={!pagination.has_next ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
