"use client";

import { useState } from "react";
import type { ContestTeamResponse } from "@/api/generated/model/contestTeamResponse";
import type { TeamMemberPreview } from "@/api/generated/model/teamMemberPreview";
import type { TeamMemberResponse } from "@/api/generated/model/teamMemberResponse";
import { useGetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGet } from "@/api/generated/teams/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initialsColor(initials: string) {
    const palette = [
        "bg-blue-500/20 text-blue-300 ring-blue-500/20",
        "bg-emerald-500/20 text-emerald-300 ring-emerald-500/20",
        "bg-violet-500/20 text-violet-300 ring-violet-500/20",
        "bg-amber-500/20 text-amber-300 ring-amber-500/20",
        "bg-rose-500/20 text-rose-300 ring-rose-500/20",
        "bg-cyan-500/20 text-cyan-300 ring-cyan-500/20",
    ];
    const n = initials.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return palette[n % palette.length];
}

function MembersPreview({
    members,
    extraCount,
}: {
    members?: TeamMemberPreview[];
    extraCount?: number;
}) {
    const preview = members ?? [];
    return (
        <div className="flex items-center">
            <div className="flex -space-x-2">
                {preview.slice(0, 3).map((m) => {
                    const c = initialsColor(m.initials);
                    return (
                        <Avatar
                            key={m.id}
                            className={`h-8 w-8 border border-white/10 ring-1 ring-white/10 ${c}`}
                        >
                            {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                            <AvatarFallback className="bg-transparent text-[11px] font-semibold">
                                {m.initials}
                            </AvatarFallback>
                        </Avatar>
                    );
                })}
            </div>
            {(extraCount ?? 0) > 0 && (
                <div className="ml-2 text-xs text-muted-foreground">+{extraCount}</div>
            )}
        </div>
    );
}

export function TeamMembersDropdown({
    contestId,
    team,
}: {
    contestId: string;
    team: ContestTeamResponse;
}) {
    const [open, setOpen] = useState(false);

    const { data, isLoading, isError } =
        useGetTeamMembersApiV1ContestsContestIdTeamsTeamIdMembersGet(
            contestId,
            team.id,
            { page: 1, page_size: 50 },
            { query: { enabled: open } },
        );

    // Fix for "Parameter 'm' implicitly has an 'any' type"
    const members: TeamMemberResponse[] = data?.data ?? [];

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 rounded-md border border-transparent hover:border-border/60 hover:bg-muted/30"
                >
                    <MembersPreview
                        members={team.members_preview}
                        extraCount={team.extra_members_count}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 shadow-lg">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground">Team members</p>
                </div>
                <DropdownMenuSeparator />
                {isLoading ? (
                    <div className="px-3 py-3 text-xs text-muted-foreground">Loading members…</div>
                ) : isError ? (
                    <div className="px-3 py-3 text-xs text-destructive">
                        Failed to load members.
                    </div>
                ) : members.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-muted-foreground">No members found.</div>
                ) : (
                    <div className="max-h-72 overflow-auto">
                        {members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center justify-between gap-3 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {m.email}
                                    </p>
                                </div>
                                {m.is_leader ? (
                                    <Badge variant="outline" className="text-[10px]">
                                        Leader
                                    </Badge>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
