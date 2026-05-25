"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Download, Loader2, Trophy, ArrowRight, ArrowLeft, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
    useGetMyTeamsApiV1StudentsTeamsGet,
    useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet,
} from "@/api/generated/students/students";
import { useImportStudentTeamApiV1StudentsContestsContestIdTeamsImportPost } from "@/api/generated/students/students";
import { getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey } from "@/api/generated/students/students";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StudentImportTeamDialogProps {
    contestId: string;
    maxTeamSize?: number;
    trigger?: React.ReactNode;
}

export function StudentImportTeamDialog({
    contestId,
    maxTeamSize = 3,
    trigger,
}: StudentImportTeamDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [teamSearch, setTeamSearch] = useState("");
    const debouncedTeamSearch = useDebounce(teamSearch, 300);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setStep(1);
            setSelectedTeamId(null);
            setSelectedMemberIds([]);
            setMemberSearch("");
            setTeamSearch("");
        }
    };

    // Step 1: Fetch leader teams
    const { data: teamsData, isLoading: isTeamsLoading } = useGetMyTeamsApiV1StudentsTeamsGet(
        {
            page: 1,
            page_size: 50,
            leader_only: true,
            search: debouncedTeamSearch || undefined,
        },
        { query: { enabled: open && step === 1 } },
    );

    const teams = teamsData?.data?.teams || [];

    // Step 2: Fetch members of selected team
    const { data: membersData, isLoading: isMembersLoading } =
        useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet(
            selectedTeamId!,
            { contest_id: contestId },
            { query: { enabled: open && step === 2 && !!selectedTeamId } },
        );

    const members = useMemo(() => membersData?.data || [], [membersData]);

    // Automatically select the leader when members are fetched
    useEffect(() => {
        if (members.length > 0) {
            const leader = members.find((m) => m.team_role === "LEADER");
            if (leader) {
                setTimeout(() => {
                    setSelectedMemberIds((prev) => {
                        if (!prev.includes(leader.id)) {
                            return [...prev, leader.id];
                        }
                        return prev;
                    });
                }, 0);
            }
        }
    }, [members]);

    const { mutate: importTeam, isPending } =
        useImportStudentTeamApiV1StudentsContestsContestIdTeamsImportPost({
            mutation: {
                meta: {
                    successMessage: "Team imported successfully!",
                    invalidateKeys: [
                        getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                            contestId,
                        ),
                    ],
                },
                onSuccess: () => {
                    handleOpenChange(false);
                },
            },
        });

    const handleImport = () => {
        if (!selectedTeamId) return;
        importTeam({
            contestId,
            data: {
                team_id: selectedTeamId,
                member_ids: selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
            },
        });
    };

    const toggleMember = (memberId: string) => {
        const memberObj = members.find((m) => m.id === memberId);
        if (memberObj?.team_role === "LEADER") {
            return;
        }

        setSelectedMemberIds((prev) => {
            if (prev.includes(memberId)) {
                return prev.filter((id) => id !== memberId);
            }
            if (prev.length >= maxTeamSize) {
                return prev;
            }
            return [...prev, memberId];
        });
    };

    const defaultTrigger = (
        <Button variant="outline" className="font-bold gap-2">
            <Download className="h-4 w-4" />
            Import Team
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            {step === 1 ? (
                                <Download className="h-5 w-5 text-primary" />
                            ) : (
                                <Users className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold leading-tight">
                                {step === 1 ? "Import Team" : "Select Members"}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {step === 1
                                    ? "Select one of your existing teams to register for this contest."
                                    : `Choose up to ${maxTeamSize} members to participate in the contest.`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-2">
                    {step === 1 && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/75" />
                                <Input
                                    placeholder="Search teams by name..."
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                            {isTeamsLoading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : teams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8 border border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/20 text-center min-h-[160px]">
                                    <Users className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm font-semibold text-foreground">
                                        {teamSearch
                                            ? "No matching teams found"
                                            : "No teams available"}
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-[250px]">
                                        {teamSearch
                                            ? "Try adjusting your search term."
                                            : "You need to be a team leader to import a team into a contest."}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[230px] pr-3">
                                    <div className="space-y-3">
                                        {teams.map((team) => (
                                            <button
                                                key={team.id}
                                                type="button"
                                                onClick={() => {
                                                    if (selectedTeamId !== team.id) {
                                                        setSelectedMemberIds([]);
                                                    }
                                                    setSelectedTeamId(team.id);
                                                }}
                                                className={cn(
                                                    "w-full flex items-start text-left gap-3 p-3.5 rounded-xl border transition-all",
                                                    selectedTeamId === team.id
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                        : "border-border/60 hover:border-primary/40 bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/30",
                                                )}
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 font-bold text-sm uppercase">
                                                    {team.title.substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col flex-1 gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm leading-none text-foreground">
                                                            {team.title}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] uppercase font-bold py-0 h-5 bg-slate-100 dark:bg-slate-800"
                                                        >
                                                            {team.member_count} Members
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                                                        {team.description || "No description"}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <>
                            {isMembersLoading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/75" />
                                        <Input
                                            placeholder="Search members by name or email..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className="pl-9 h-9 text-xs"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1 pt-1">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Team Roster
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-bold",
                                                selectedMemberIds.length > maxTeamSize
                                                    ? "text-destructive"
                                                    : "text-primary",
                                            )}
                                        >
                                            {selectedMemberIds.length} / {maxTeamSize} Selected
                                        </span>
                                    </div>
                                    <ScrollArea className="h-[210px] pr-3">
                                        <div className="space-y-2.5">
                                            {members
                                                .filter(
                                                    (member) =>
                                                        member.name
                                                            .toLowerCase()
                                                            .includes(memberSearch.toLowerCase()) ||
                                                        member.email
                                                            .toLowerCase()
                                                            .includes(memberSearch.toLowerCase()),
                                                )
                                                .map((member) => {
                                                    const isSelected = selectedMemberIds.includes(
                                                        member.id,
                                                    );
                                                    const isInContest = !!member.is_in_contest;
                                                    const isLeader = member.team_role === "LEADER";
                                                    const isDisabled =
                                                        isInContest ||
                                                        isLeader ||
                                                        (!isSelected &&
                                                            selectedMemberIds.length >=
                                                                maxTeamSize);

                                                    return (
                                                        <label
                                                            key={member.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                                    : "border-border/60 bg-card",
                                                                isLeader
                                                                    ? "cursor-default"
                                                                    : isDisabled
                                                                      ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40"
                                                                      : "cursor-pointer",
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                disabled={isDisabled}
                                                                onCheckedChange={() =>
                                                                    toggleMember(member.id)
                                                                }
                                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <div className="flex flex-col flex-1 leading-none">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-bold text-foreground">
                                                                        {member.name}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {isLeader && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[9px] uppercase text-indigo-500 border-indigo-500/20 bg-indigo-500/10 py-0 h-4"
                                                                            >
                                                                                Leader
                                                                            </Badge>
                                                                        )}
                                                                        {isInContest && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[9px] uppercase text-amber-500 border-amber-500/20 bg-amber-500/10 py-0 h-4"
                                                                            >
                                                                                Already Registered
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className="text-[11px] font-medium text-muted-foreground mt-1">
                                                                    {member.email}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 pt-1">
                    {step === 1 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="min-w-20"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setStep(2);
                                    setMemberSearch("");
                                    setTeamSearch("");
                                }}
                                disabled={!selectedTeamId}
                                className="min-w-32 bg-primary hover:bg-primary/90 text-white shadow-md transition-all"
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex justify-between w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setStep(1);
                                    setMemberSearch("");
                                    setTeamSearch("");
                                }}
                                className="min-w-24 gap-1.5"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={
                                    selectedMemberIds.length === 0 ||
                                    isPending ||
                                    selectedMemberIds.length > maxTeamSize
                                }
                                className="min-w-32 bg-primary hover:bg-primary/90 text-white shadow-md transition-all gap-1.5"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="h-4 w-4" />
                                        Confirm Import
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
