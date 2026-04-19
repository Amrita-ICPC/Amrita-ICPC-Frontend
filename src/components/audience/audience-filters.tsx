"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export function AudienceFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("q") || "";
    const initialType = searchParams.get("audience_type") || "all";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentQ = searchParams.get("q") || "";

        if (debouncedSearch) {
            params.set("q", debouncedSearch);
        } else {
            params.delete("q");
        }

        // Reset page when the search changes.
        if (currentQ !== debouncedSearch) {
            params.set("page", "1");
        }

        const nextQueryString = params.toString();
        if (nextQueryString !== searchParams.toString()) {
            router.replace(`${pathname}?${nextQueryString}`);
        }
    }, [debouncedSearch, pathname, router, searchParams]);

    const handleTypeChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== "all") {
            params.set("audience_type", value);
        } else {
            params.delete("audience_type");
        }

        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search audiences..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Select value={initialType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Audience type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="batch">Batch</SelectItem>
                    <SelectItem value="campus">Campus</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
