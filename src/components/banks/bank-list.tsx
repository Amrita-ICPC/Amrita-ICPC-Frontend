"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, Database } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BankCard } from "./bank-card";
import { BankRowItem } from "./bank-row-item";
import { useGetAllBanksApiV1BanksGet } from "@/api/generated/banks/banks";
import { AppPagination } from "@/components/shared/app-pagination";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { toApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function BankList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [view, setView] = useState<ViewMode>("grid");

    const currentPage = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("search") || "";

    const { data, isLoading, isError, error } = useGetAllBanksApiV1BanksGet({
        page: currentPage,
        page_size: 12,
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

    const pagination = data?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const apiError = error ? toApiError(error) : null;

    const banks = data?.data ?? [];
    const filtered = searchQuery
        ? banks.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : banks;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search banks..."
                        className="pl-8"
                        defaultValue={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <ViewToggle view={view} onChange={setView} />
            </div>

            {isLoading ? (
                view === "grid" ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-44 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bank</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <td className="p-4"><Skeleton className="h-9 w-48" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )
            ) : isError ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                    <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                    <p className="font-semibold text-destructive mb-1">
                        {apiError?.status === 403 ? "Access Denied" : "Failed to load banks"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {apiError?.message || "Error fetching question banks. Please try again."}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                        {apiError?.status === 403 && (
                            <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                        )}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
                    <Database className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">No banks found</p>
                    <p className="text-xs max-w-xs text-center">
                        {searchQuery ? "Try a different search term." : "Create your first question bank to get started."}
                    </p>
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((bank) => <BankCard key={bank.id} bank={bank} />)}
                </div>
            ) : (
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bank</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((bank) => <BankRowItem key={bank.id} bank={bank} />)}
                        </TableBody>
                    </Table>
                </div>
            )}

            {pagination && (
                <AppPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasPrevious={pagination.has_previous}
                    hasNext={pagination.has_next}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
