"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey,
    useInviteToTeamApiV1StudentsTeamsTeamIdInvitationPost,
    useSearchTeamsByNameApiV1StudentsTeamsSearchGet,
} from "@/api/generated/students/students";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function StudentSearchTeamDialog() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [requestedTeamIds, setRequestedTeamIds] = useState<Record<string, boolean>>({});

    const queryClient = useQueryClient();

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSearchQuery("");
            setDebouncedQuery("");
        }
    };

    // Search query hook
    const {
        data: searchResponse,
        isLoading,
        isError,
    } = useSearchTeamsByNameApiV1StudentsTeamsSearchGet(
        { name: debouncedQuery, page: 1, page_size: 20 },
        {
            query: {
                enabled: open && debouncedQuery.trim().length >= 2,
            },
        },
    );

    // Request mutation hook
    const { mutate: requestToJoin, isPending: isRequesting } =
        useInviteToTeamApiV1StudentsTeamsTeamIdInvitationPost({
            mutation: {
                onSuccess: (_, variables) => {
                    toast.success("Join request sent successfully!");
                    // Optimistically mark as requested
                    setRequestedTeamIds((prev) => ({
                        ...prev,
                        [variables.teamId]: true,
                    }));
                    // Invalidate invitations to update pending counts
                    queryClient.invalidateQueries({
                        queryKey: getGetTeamInvitationsApiV1StudentsTeamsInvitationsGetQueryKey(),
                    });
                },
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message || "Failed to send join request.";
                    toast.error(message);
                },
            },
        });

    const handleRequestJoin = (teamId: string) => {
        requestToJoin({
            teamId,
            params: {
                type: "REQUEST",
            },
        });
    };

    const searchResults = searchResponse?.data?.teams || [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-slate-900/60 backdrop-blur-md text-slate-100 hover:text-white gap-1.5 h-9 px-4.5 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all font-extrabold text-xs rounded-lg cursor-pointer"
                >
                    <UserPlus className="h-4 w-4 stroke-[2]" />
                    Join Team
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[540px] gap-0 p-0 overflow-hidden border border-border/80 shadow-2xl bg-card rounded-xl">
                {/* Header Section */}
                <div className="p-6 border-b border-border/40 bg-slate-50/50 dark:bg-slate-950/20">
                    <DialogHeader className="gap-1.5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-xs">
                                <Search className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground leading-tight flex items-center gap-1.5">
                                    Search Public Teams
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-semibold">
                                    Find and join active public student teams.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Search Bar Input */}
                <div className="p-4 border-b border-border/30 bg-slate-50/30 dark:bg-slate-900/5">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                        <Input
                            placeholder="Type team name (e.g. ByteForce)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-11 border-border/60 bg-background/50 focus-visible:ring-primary/20 text-sm font-semibold rounded-lg"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content Panel */}
                <div className="max-h-[360px] overflow-y-auto p-4 custom-scrollbar">
                    {/* State 1: Query too short */}
                    {debouncedQuery.trim().length < 2 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/60 border border-dashed border-border text-muted-foreground/75">
                                <Search className="h-6 w-6 stroke-[1.8]" />
                            </div>
                            <div className="space-y-1 max-w-[280px]">
                                <h3 className="text-sm font-extrabold text-foreground leading-snug">
                                    Find Your Next Team
                                </h3>
                                <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed">
                                    Enter at least 2 characters to search for public teams available
                                    to join.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* State 2: Loading skeletons */}
                    {debouncedQuery.trim().length >= 2 && isLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 animate-pulse bg-slate-50/40 dark:bg-slate-900/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted" />
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-32 bg-muted rounded" />
                                            <div className="h-3 w-48 bg-muted rounded" />
                                        </div>
                                    </div>
                                    <div className="h-8 w-24 bg-muted rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* State 3: Error state */}
                    {debouncedQuery.trim().length >= 2 && !isLoading && isError && (
                        <div className="py-8 text-center text-xs font-semibold text-destructive border border-dashed border-destructive/20 bg-destructive/5 rounded-xl">
                            Failed to fetch search results. Please try again.
                        </div>
                    )}

                    {/* State 4: No results */}
                    {debouncedQuery.trim().length >= 2 &&
                        !isLoading &&
                        !isError &&
                        searchResults.length === 0 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900/60 border border-dashed border-border text-muted-foreground/75">
                                    <Users className="h-6 w-6 stroke-[1.8]" />
                                </div>
                                <div className="space-y-1 max-w-[280px]">
                                    <h3 className="text-sm font-extrabold text-foreground leading-snug">
                                        No Teams Found
                                    </h3>
                                    <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed">
                                        We couldn&apos;t find any public teams matching &ldquo;
                                        {debouncedQuery}&rdquo;.
                                    </p>
                                </div>
                            </div>
                        )}

                    {/* State 5: Populate Results */}
                    {debouncedQuery.trim().length >= 2 &&
                        !isLoading &&
                        !isError &&
                        searchResults.length > 0 && (
                            <div className="space-y-2.5">
                                {searchResults.map((team) => {
                                    const hasRequested =
                                        team.has_requested || requestedTeamIds[team.id];
                                    const isMember = team.is_leader; // If they are leader, they are definitely a member

                                    return (
                                        <div
                                            key={team.id}
                                            className="group flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:border-primary/30 bg-slate-50/20 dark:bg-slate-900/5 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 hover:shadow-xs transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
                                                {/* Beautiful gradient logo/initial placeholder */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/15 border border-indigo-500/15 group-hover:border-primary/20 text-primary font-black text-sm uppercase shadow-xs">
                                                    {team.title.charAt(0)}
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                            {team.title}
                                                        </span>
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            {team.member_count}{" "}
                                                            {team.member_count === 1
                                                                ? "member"
                                                                : "members"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground/90 font-medium truncate mt-0.5">
                                                        {team.description ||
                                                            "No description provided."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                {isMember ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/20">
                                                        Joined
                                                    </span>
                                                ) : hasRequested ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 border border-amber-500/20">
                                                        Pending
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRequestJoin(team.id)}
                                                        disabled={isRequesting}
                                                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs h-8 px-3 rounded-lg border border-transparent shadow-xs transition-all gap-1 cursor-pointer"
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5 stroke-[2.2]" />
                                                        Request
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
