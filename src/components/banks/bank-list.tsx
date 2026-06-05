"use client";

import { useState } from "react";
import { Search, AlertCircle, Database, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankCard } from "./bank-card";
import { BankRowItem } from "./bank-row-item";
import { useGetAllBanksApiV1BanksGet } from "@/api/generated/banks/banks";
import { AppPagination } from "@/components/shared/app-pagination";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { toApiError } from "@/lib/api/error";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
        <Card className="border-border/60 bg-card/20 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                                <Database className="size-4" />
                            </div>
                            Bank Directory
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-xs">
                            Open a bank to manage questions, sharing, and cloning.
                        </CardDescription>
                    </div>
                    <ViewToggle view={view} onChange={setView} />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search banks..."
                            className="pl-10 h-10 bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-lg shadow-sm"
                            defaultValue={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <Select defaultValue="updated_desc">
                            <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-lg bg-background/50 border-border/60 shadow-sm text-sm font-medium">
                                <SelectValue placeholder="Sort by: Updated (Newest)" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="updated_desc">
                                    Sort by: Updated (Newest)
                                </SelectItem>
                                <SelectItem value="updated_asc">
                                    Sort by: Updated (Oldest)
                                </SelectItem>
                                <SelectItem value="name_asc">Sort by: Name (A-Z)</SelectItem>
                                <SelectItem value="name_desc">Sort by: Name (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    view === "grid" ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start content-start">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-56 rounded-[16px] border border-border/40"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="font-semibold">Bank</TableHead>
                                        <TableHead className="font-semibold">Visibility</TableHead>
                                        <TableHead className="font-semibold">Questions</TableHead>
                                        <TableHead className="font-semibold">Updated</TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <TableRow
                                            key={i}
                                            className="border-border/40 hover:bg-background/40"
                                        >
                                            <td className="p-4">
                                                <Skeleton className="h-9 w-48 rounded-md" />
                                            </td>
                                            <td className="p-4">
                                                <Skeleton className="h-4 w-16 rounded-md" />
                                            </td>
                                            <td className="p-4">
                                                <Skeleton className="h-4 w-12 rounded-md" />
                                            </td>
                                            <td className="p-4">
                                                <Skeleton className="h-4 w-24 rounded-md" />
                                            </td>
                                            <td className="p-4">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </td>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                ) : isError ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
                        <AlertCircle className="size-10 text-destructive mb-2" />
                        <div>
                            <p className="font-bold text-destructive text-lg">
                                {apiError?.status === 403
                                    ? "Access Denied"
                                    : "Failed to load banks"}
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-start content-start">
                        {filtered.map((bank) => (
                            <BankCard key={bank.id} bank={bank} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="font-semibold h-12">Bank</TableHead>
                                    <TableHead className="font-semibold h-12">Visibility</TableHead>
                                    <TableHead className="font-semibold h-12">Questions</TableHead>
                                    <TableHead className="font-semibold h-12">Updated</TableHead>
                                    <TableHead className="text-right font-semibold h-12">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((bank) => (
                                    <BankRowItem key={bank.id} bank={bank} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {pagination && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                            Showing {(currentPage - 1) * 12 + 1} to{" "}
                            {Math.min(currentPage * 12, pagination.total ?? 12)} of{" "}
                            {pagination.total ?? filtered.length} banks
                        </div>
                        <AppPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
