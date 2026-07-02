"use client";

import { AlertCircle, Database, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetAllBanksApiV1BanksGet } from "@/api/generated/banks/banks";
import { BankSortBy } from "@/api/generated/model/bankSortBy";
import { AppPagination } from "@/components/shared/app-pagination";
import { type ViewMode, ViewToggle } from "@/components/shared/view-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toApiError } from "@/lib/api/error";

import { BankCard } from "./bank-card";
import { BankRowItem } from "./bank-row-item";

function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-[20px] border border-border/40" />
            ))}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex min-h-[72px] items-center gap-4 rounded-[16px] border border-border/60 p-3"
                >
                    <Skeleton className="hidden md:block h-[64px] w-[64px] rounded-[14px]" />
                    <div className="flex flex-1 min-w-0 flex-col gap-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function BankList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [view, setView] = useState<ViewMode>("grid");

    const currentPage = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("search") || "";
    const sortBy = (searchParams.get("sort_by") as BankSortBy) || "updated_new";

    const { data, isLoading, isError, error } = useGetAllBanksApiV1BanksGet({
        page: currentPage,
        page_size: 12,
        search: searchQuery || undefined,
        sort_by: sortBy,
    });

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleSearch = (value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value) newParams.set("search", value);
        else newParams.delete("search");
        newParams.set("page", "1");
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleSort = (value: BankSortBy) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("sort_by", value);
        newParams.set("page", "1");
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const pagination = data?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const apiError = error ? toApiError(error) : null;

    const filtered = data?.data ?? [];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search banks..."
                            className="pl-10 h-10 bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-lg shadow-sm"
                            defaultValue={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => handleSort(value as BankSortBy)}
                    >
                        <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-lg bg-background/50 border-border/60 shadow-sm text-sm font-medium">
                            <SelectValue placeholder="Sort by: Updated (Newest)" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="updated_new">Sort by: Updated (Newest)</SelectItem>
                            <SelectItem value="updated_old">Sort by: Updated (Oldest)</SelectItem>
                            <SelectItem value="name">Sort by: Name (A-Z)</SelectItem>
                            <SelectItem value="created_at">Sort by: Created (Newest)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <ViewToggle view={view} onChange={setView} />
            </div>

            {isLoading ? (
                view === "grid" ? (
                    <GridSkeleton />
                ) : (
                    <ListSkeleton />
                )
            ) : isError ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
                    <AlertCircle className="size-10 text-destructive mb-2" />
                    <div>
                        <p className="font-bold text-destructive text-lg">
                            {apiError?.status === 403 ? "Access Denied" : "Failed to load banks"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {apiError?.message ||
                                "We couldn't fetch the question banks. Please try again."}
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="rounded-xl border-border/60 hover:bg-background shadow-sm"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                        {apiError?.status === 403 && (
                            <Button asChild className="rounded-xl shadow-sm">
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/5 p-6 text-center shadow-sm">
                    <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                        <Database className="size-8 opacity-30 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-semibold">No banks found</p>
                        <p className="max-w-sm text-center text-sm text-muted-foreground">
                            {searchQuery
                                ? "Try a different search term to find what you're looking for."
                                : "Create your first question bank to get started building your collection."}
                        </p>
                    </div>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((bank) => (
                        <BankCard key={bank.id} bank={bank} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((bank) => (
                        <BankRowItem key={bank.id} bank={bank} />
                    ))}
                </div>
            )}

            {pagination && (
                <div className="mt-4">
                    <AppPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasPrevious={pagination.has_previous}
                        hasNext={pagination.has_next}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
