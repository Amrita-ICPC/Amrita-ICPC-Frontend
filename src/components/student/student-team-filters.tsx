"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StudentTeamFiltersProps {
    view: ViewMode;
    onViewChange: (mode: ViewMode) => void;
}

export function StudentTeamFilters({ view, onViewChange }: StudentTeamFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("search") || "";
    const initialMinSize = searchParams.get("min_size") || "";
    const initialMaxSize = searchParams.get("max_size") || "";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [minSize, setMinSize] = useState(initialMinSize);
    const [maxSize, setMaxSize] = useState(initialMaxSize);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedMinSize = useDebounce(minSize, 500);
    const debouncedMaxSize = useDebounce(maxSize, 500);

    // Sync debounced text inputs → URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        const updateParam = (key: string, value: string) => {
            if (value) {
                if (params.get(key) !== value) {
                    params.set(key, value);
                    changed = true;
                }
            } else {
                if (params.has(key)) {
                    params.delete(key);
                    changed = true;
                }
            }
        };

        updateParam("search", debouncedSearch);
        updateParam("min_size", debouncedMinSize);
        updateParam("max_size", debouncedMaxSize);

        if (changed) {
            params.set("page", "1");
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [debouncedSearch, debouncedMinSize, debouncedMaxSize, pathname, router, searchParams]);

    // Read current boolean filter state directly from URL
    const isLeaderOnly = searchParams.get("leader_only") === "true";
    const isCreatedOnly = searchParams.get("created_only") === "true";
    const isPublicParam = searchParams.get("is_public");
    const visibility =
        isPublicParam === "true" ? "public" : isPublicParam === "false" ? "private" : "all";

    // Toggle a boolean URL param on/off
    const handleToggleFilter = (key: "leader_only" | "created_only") => {
        const params = new URLSearchParams(searchParams.toString());
        const isActive = params.get(key) === "true";

        if (isActive) {
            params.delete(key);
        } else {
            params.set(key, "true");
        }

        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleVisibilityChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === "public") {
            params.set("is_public", "true");
        } else if (value === "private") {
            params.set("is_public", "false");
        } else {
            params.delete("is_public");
        }

        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const filterBadgeBase =
        "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-xs font-extrabold border transition-all duration-200 cursor-pointer select-none";
    const filterBadgeActive =
        "bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5";
    const filterBadgeIdle =
        "bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-white/10 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800";

    return (
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search teams by name..."
                    className="pl-9 h-10 border-slate-200/60 dark:border-white/10 dark:bg-slate-900/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Team Size Range Filter */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-lg border border-slate-200/60 dark:border-white/10">
                    <div className="flex items-center gap-1.5 px-2">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Size
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Input
                            type="number"
                            placeholder="Min"
                            min="1"
                            className="w-16 h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-2"
                            value={minSize}
                            onChange={(e) => setMinSize(e.target.value)}
                        />
                        <span className="text-slate-300 dark:text-slate-700 mx-0.5">–</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            min="1"
                            className="w-16 h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-2"
                            value={maxSize}
                            onChange={(e) => setMaxSize(e.target.value)}
                        />
                    </div>
                </div>

                {/* Leader Filter Badge */}
                <button
                    onClick={() => handleToggleFilter("leader_only")}
                    className={`${filterBadgeBase} ${isLeaderOnly ? filterBadgeActive : filterBadgeIdle}`}
                    aria-pressed={isLeaderOnly}
                >
                    👑 Teams I Lead
                </button>

                {/* Creator Filter Badge */}
                <button
                    onClick={() => handleToggleFilter("created_only")}
                    className={`${filterBadgeBase} ${isCreatedOnly ? filterBadgeActive : filterBadgeIdle}`}
                    aria-pressed={isCreatedOnly}
                >
                    🛠️ Teams I Created
                </button>

                {/* Visibility Filter Dropdown */}
                <Select value={visibility} onValueChange={handleVisibilityChange}>
                    <SelectTrigger className="w-[145px] h-10 border-slate-200/60 dark:border-white/10 dark:bg-slate-900/50 text-xs font-extrabold text-muted-foreground bg-slate-50 dark:bg-slate-900/50">
                        <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs font-semibold">
                            🌐 All Visibility
                        </SelectItem>
                        <SelectItem value="public" className="text-xs font-semibold">
                            🌐 Public Only
                        </SelectItem>
                        <SelectItem value="private" className="text-xs font-semibold">
                            🔒 Private Only
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* View Toggle */}
                <ViewToggle view={view} onChange={onViewChange} />
            </div>
        </div>
    );
}
