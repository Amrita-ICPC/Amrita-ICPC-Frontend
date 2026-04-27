"use client";

import { Search, LayoutGrid, List as ListIcon, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BankCard } from "./bank-card";
import { useGetAllBanksApiV1BanksGet } from "@/api/generated/banks/banks";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { toApiError } from "@/lib/api/error";

export function BankList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [view, setView] = useState<"grid" | "list">("grid");

    const currentPage = parseInt(searchParams.get("page") || "1");
    const searchQuery = searchParams.get("search") || "";

    const { data, isLoading, isError, error } = useGetAllBanksApiV1BanksGet({
        page: currentPage,
        page_size: 12,
        // search: searchQuery, // Add search if API supports it later
    });

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleSearch = (value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value) {
            newParams.set("search", value);
        } else {
            newParams.delete("search");
        }
        newParams.set("page", "1");
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const pagination = data?.pagination;
    const totalPages = pagination?.total_pages || 1;

    const apiError = error ? toApiError(error) : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search banks..."
                        className="pl-9 border-white/10 bg-white/5 focus-visible:ring-primary/50"
                        defaultValue={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
                    <Button
                        variant={view === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setView("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setView("list")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : isError ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-2xl mx-auto">
                    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                    <p className="text-xl font-bold text-white mb-2">
                        {apiError?.status === 403 ? "Access Denied" : "Failed to load banks"}
                    </p>
                    <p className="text-sm text-white/60 mb-6">
                        {apiError?.message || "There was an error fetching the question banks. Please try again."}
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="border-white/10"
                            onClick={() => window.location.reload()}
                        >
                            Retry Request
                        </Button>
                        {apiError?.status === 403 && (
                            <Button asChild>
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : data?.data && data.data.length > 0 ? (
                <>
                    <div
                        className={
                            view === "grid"
                                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "flex flex-col gap-4"
                        }
                    >
                        {data.data.map((bank) => (
                            <BankCard key={bank.id} bank={bank} />
                        ))}
                    </div>

                    {pagination && totalPages > 1 && (
                        <div className="flex justify-center pt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pagination.has_previous)
                                                    setPage(currentPage - 1);
                                            }}
                                            className={
                                                !pagination.has_previous
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }).map(
                                        (_, idx) => {
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
                                        },
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (pagination.has_next) setPage(currentPage + 1);
                                            }}
                                            className={
                                                !pagination.has_next
                                                    ? "pointer-events-none opacity-50"
                                                    : ""
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                    <p className="text-lg font-semibold text-white/80">No banks found</p>
                    <p className="text-sm text-white/40 max-w-xs">
                        You haven&apos;t created any question banks yet. Create your first bank to
                        start organizing questions.
                    </p>
                </div>
            )}
        </div>
    );
}
