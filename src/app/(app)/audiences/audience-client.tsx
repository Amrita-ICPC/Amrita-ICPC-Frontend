"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CreateAudienceDialog } from "@/components/audience/create-audience-dialog";
import { AudienceFilters } from "@/components/audience/audience-filters";
import { useAudiences } from "@/query/audience-query";
import type { AudienceType } from "@/api/generated/model";
import { clampPage, clampPageSize } from "@/lib/utils/pagination";
import { AudienceGrid } from "./audience-grid";
import { AudiencePageHeader } from "./audience-page-header";
import { AudiencePagination } from "./audience-pagination";

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
        page: clampPage(Number.isFinite(params.page) ? params.page : 1),
        page_size: clampPageSize(Number.isFinite(params.page_size) ? params.page_size : 10),
        q: params.q?.trim() ? params.q.trim() : null,
        audience_type: selectedType,
    });

    const pagination = query.data?.pagination;

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const audiences = query.data?.data ?? [];

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            <AudiencePageHeader onCreate={() => setIsCreateOpen(true)} />

            <CreateAudienceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <div className="flex flex-col gap-6">
                <AudienceFilters />

                <AudienceGrid
                    audiences={audiences}
                    selectedType={selectedType}
                    isLoading={query.isLoading}
                    isError={query.isError}
                    onRetry={() => query.refetch()}
                />

                {pagination && (
                    <AudiencePagination pagination={pagination} onPageChange={setPage} />
                )}
            </div>
        </div>
    );
}
