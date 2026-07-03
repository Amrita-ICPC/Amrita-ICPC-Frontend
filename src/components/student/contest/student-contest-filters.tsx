"use client";

import { Search, Users } from "lucide-react";
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

export function StudentContestFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialSearch = searchParams.get("search") || "";
    const initialRunStatus = searchParams.get("run_status") || "all";
    const initialMinTeam = searchParams.get("min_team_size") || "";
    const initialMaxTeam = searchParams.get("max_team_size") || "";

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [minTeam, setMinTeam] = useState(initialMinTeam);
    const [maxTeam, setMaxTeam] = useState(initialMaxTeam);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedMinTeam = useDebounce(minTeam, 500);
    const debouncedMaxTeam = useDebounce(maxTeam, 500);

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
        updateParam("min_team_size", debouncedMinTeam);
        updateParam("max_team_size", debouncedMaxTeam);

        if (changed) {
            params.set("page", "1");
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [debouncedSearch, debouncedMinTeam, debouncedMaxTeam, pathname, router, searchParams]);

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
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-3 shadow-sm lg:flex-row lg:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                <Input
                    type="search"
                    placeholder="Search by contest name..."
                    className="h-10 border-primary/15 bg-background/80 pl-9 shadow-xs placeholder:text-muted-foreground/70 focus-visible:border-primary/35 focus-visible:ring-primary/15"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Team Size Range */}
                <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-background/80 p-1">
                    <div className="flex items-center gap-1.5 px-2">
                        <Users className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Team
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Input
                            type="number"
                            placeholder="Min"
                            min="1"
                            className="w-16 h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-2"
                            value={minTeam}
                            onChange={(e) => setMinTeam(e.target.value)}
                        />
                        <span className="text-slate-300 dark:text-slate-700 mx-0.5">–</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            min="1"
                            className="w-16 h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-2"
                            value={maxTeam}
                            onChange={(e) => setMaxTeam(e.target.value)}
                        />
                    </div>
                </div>

                {/* Run Status Select */}
                <Select value={initialRunStatus} onValueChange={handleRunStatusChange}>
                    <SelectTrigger className="h-10 w-[130px] border-primary/15 bg-background/80 shadow-xs focus:ring-primary/15">
                        <SelectValue placeholder="Run Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                        <SelectItem value="LIVE">Live</SelectItem>
                        <SelectItem value="ENDED">Ended</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
