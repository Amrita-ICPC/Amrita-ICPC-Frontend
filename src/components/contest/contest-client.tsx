"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useContests } from "@/query/contest-query";
import type { GetContestsParams } from "@/types/contest";
import { ContestFilters } from "./contest-filters";
import { ContestCard } from "./contest-card";
import { ContestSkeleton } from "./contest-skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { ContestStatus } from "@/api/generated/model/contestStatus";

interface ContestClientProps {
    initialParams: GetContestsParams;
}

export function ContestClient({ initialParams }: ContestClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Combine initial params with live query state changes
    const params: GetContestsParams = {
        ...initialParams,
        page: parseInt(searchParams.get("page") || String(initialParams.page || 1)),
        page_size: initialParams.page_size || 10,
        search: searchParams.get("search") || initialParams.search,
        contest_status:
            ContestStatus[searchParams.get("contest_status") as keyof typeof ContestStatus] ||
            initialParams.contest_status,
    };

    const { data, isLoading, isError } = useContests(params);

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    // derived pagination values
    const pagination = data?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    return (
        <div className="flex flex-col gap-6">
            <ContestFilters />

            {isError ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border/50 bg-destructive/5 text-destructive p-8 text-center">
                    <p className="mb-2 font-medium">Failed to load contests</p>
                    <p className="text-sm opacity-80">
                        Please try refreshing the page or check your connection.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,500px))]">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => <ContestSkeleton key={i} />)
                    ) : data?.data && data.data.length > 0 ? (
                        data.data.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))
                    ) : (
                        <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            No contests found. Try adjusting your filters.
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && (
                <Pagination className="mt-8 justify-center sm:justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (pagination.has_previous) setPage(currentPage - 1);
                                }}
                                className={
                                    !pagination.has_previous ? "pointer-events-none opacity-50" : ""
                                }
                            />
                        </PaginationItem>

                        {/* Simple page enumerator up to 5 pages around current */}
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                            // rough centering algorithm for paginator
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
                                            setPage(pageNum);
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
                                    if (pagination.has_next) setPage(currentPage + 1);
                                }}
                                className={
                                    !pagination.has_next ? "pointer-events-none opacity-50" : ""
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
