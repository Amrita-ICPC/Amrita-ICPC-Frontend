"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { CreateAudienceDialog } from "@/components/audience/create-audience-dialog";
import { AudienceFilters } from "@/components/audience/audience-filters";
import { AudienceCard } from "@/components/audience/audience-card";
import { AudienceSkeleton } from "@/components/audience/audience-skeleton";
import { useAudiences } from "@/query/audience-query";
import type { AudienceType } from "@/api/generated/model";

const AUDIENCE_TYPES = ["class", "department", "batch", "campus"] as const;

function parseAudienceType(value: string | null): AudienceType | null {
    if (!value) return null;
    return (AUDIENCE_TYPES as readonly string[]).includes(value) ? (value as AudienceType) : null;
}

type InitialParams = {
    page: number;
    page_size: number;
    q: string;
    audience_type?: string;
};

export function AudienceClient({ initialParams }: { initialParams: InitialParams }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const params = {
        page: Number.parseInt(searchParams.get("page") || String(initialParams.page || 1), 10),
        page_size: Number.parseInt(
            searchParams.get("page_size") || String(initialParams.page_size || 10),
            10,
        ),
        q: searchParams.get("q") || initialParams.q || null,
        audience_type: searchParams.get("audience_type") || initialParams.audience_type || null,
    };

    const selectedType = parseAudienceType(
        params.audience_type?.trim() ? params.audience_type.trim() : null,
    );

    const query = useAudiences({
        page: Number.isFinite(params.page) && params.page > 0 ? params.page : 1,
        page_size:
            Number.isFinite(params.page_size) && params.page_size > 0 ? params.page_size : 10,
        q: params.q?.trim() ? params.q.trim() : null,
        audience_type: selectedType,
    });

    const pagination = query.data?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const audiences = query.data?.data ?? [];
    const visibleAudiences = selectedType
        ? audiences.filter((a) => String(a.audience_type) === selectedType)
        : audiences;

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audiences</h1>
                    <p className="text-muted-foreground">
                        Create and manage audience groups for visibility and access.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="button" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Audience
                    </Button>
                </div>
            </div>

            <CreateAudienceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <div className="flex flex-col gap-6">
                <AudienceFilters />

                {query.isError ? (
                    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-border/50 bg-destructive/5 text-destructive p-8 text-center">
                        <p className="mb-2 font-medium">Failed to load audiences</p>
                        <p className="text-sm opacity-80">
                            Please try refreshing the page or check your connection.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {query.isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => <AudienceSkeleton key={i} />)
                        ) : visibleAudiences.length > 0 ? (
                            visibleAudiences.map((audience) => (
                                <AudienceCard key={audience.id} audience={audience} />
                            ))
                        ) : (
                            <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                No audiences found. Try adjusting your filters.
                            </div>
                        )}
                    </div>
                )}

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
                                        !pagination.has_previous
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                                let pageNum = currentPage;
                                if (totalPages <= 5) pageNum = idx + 1;
                                else if (currentPage <= 3) pageNum = idx + 1;
                                else if (currentPage >= totalPages - 2)
                                    pageNum = totalPages - 4 + idx;
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
        </div>
    );
}
