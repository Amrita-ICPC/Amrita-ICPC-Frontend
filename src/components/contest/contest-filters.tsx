"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export function ContestFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("search") || "";
    const initialStatus = searchParams.get("contest_status") || "all";
    const initialRunStatus = searchParams.get("run_status") || "all";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync to URL whenever filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = searchParams.get("search") || "";

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        // Reset page to 1 when search changes
        if (currentSearch !== debouncedSearch) {
            params.set("page", "1");
        }

        const newQueryString = params.toString();
        if (newQueryString !== searchParams.toString()) {
            router.replace(`${pathname}?${newQueryString}`);
        }
    }, [debouncedSearch, pathname, router, searchParams]);

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== "all") {
            params.set("contest_status", value);
        } else {
            params.delete("contest_status");
        }

        // Reset page to 1 when status changes
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleRunStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== "all") {
            params.set("run_status", value);
        } else {
            params.delete("run_status");
        }

        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                <Input
                    type="search"
                    placeholder="Search contests..."
                    className="h-10 border-primary/15 bg-background/80 pl-9 shadow-xs placeholder:text-muted-foreground/70 focus-visible:border-primary/35 focus-visible:ring-primary/15"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Select value={initialRunStatus} onValueChange={handleRunStatusChange}>
                    <SelectTrigger className="h-10 w-[140px] border-primary/15 bg-background/80 shadow-xs focus:ring-primary/15">
                        <SelectValue placeholder="Run Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                        <SelectItem value="LIVE">Live</SelectItem>
                        <SelectItem value="ENDED">Ended</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={initialStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-10 w-[150px] border-primary/15 bg-background/80 shadow-xs focus:ring-primary/15">
                        <SelectValue placeholder="Contest Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
