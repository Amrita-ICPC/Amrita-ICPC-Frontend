"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, UserPlus, UserCheck, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useListStudentsApiV1UsersStudentsGet } from "@/api/generated/users/users";
import { useInviteToTeamApiV1StudentsTeamsTeamIdInvitationInviteUserIdPost } from "@/api/generated/students/students";
import type { StudentTeamCardResponse } from "@/api/generated/model";

interface StudentInviteDialogProps {
    team: StudentTeamCardResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentInviteDialog({ team, open, onOpenChange }: StudentInviteDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());

    // Debounce the search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Query student list
    const { data: studentsData, isLoading: isSearching } = useListStudentsApiV1UsersStudentsGet(
        {
            q: debouncedQuery || undefined,
            team_id: team.id,
            page: 1,
            page_size: 20,
        },
        {
            query: {
                enabled: open,
            },
        },
    );

    const students = studentsData?.data || [];

    // Invite mutation
    const { mutate: inviteUser, isPending: isInvitingId } =
        useInviteToTeamApiV1StudentsTeamsTeamIdInvitationInviteUserIdPost({
            mutation: {
                meta: {
                    successMessage: "Invitation sent successfully!",
                },
            },
        });

    const [activeInviteId, setActiveInviteId] = useState<string | null>(null);

    const handleInvite = (studentUserId: string) => {
        setActiveInviteId(studentUserId);
        inviteUser(
            { teamId: team.id, inviteUserId: studentUserId },
            {
                onSuccess: () => {
                    setActiveInviteId(null);
                    setInvitedUserIds((prev) => {
                        const next = new Set(prev);
                        next.add(studentUserId);
                        return next;
                    });
                },
                onError: () => {
                    setActiveInviteId(null);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-lg font-bold leading-tight">
                                Invite Members
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Search students by name or email to invite them to{" "}
                                <strong className="text-foreground">{team.title}</strong>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 py-4 flex flex-col gap-4 flex-1 overflow-hidden">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Type student name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-full"
                        />
                        {isSearching && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    {/* Results Container */}
                    <ScrollArea className="flex-1 min-h-[250px] max-h-[350px] pr-2.5">
                        {students.length > 0 ? (
                            <div className="space-y-2">
                                {students.map((student) => {
                                    const isInTeam = student.is_in_team;
                                    const isAlreadyInvited = student.is_already_invited;
                                    const isInvitedLocally = invitedUserIds.has(student.id);
                                    const isInviting = activeInviteId === student.id;

                                    return (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-3 border border-border/40 bg-slate-50/30 dark:bg-slate-900/10 rounded-xl hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-8 w-8 border border-border shadow-xs">
                                                    <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                                        {student.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col leading-tight min-w-0 text-left">
                                                    <span className="text-xs font-bold text-foreground truncate">
                                                        {student.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">
                                                        {student.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 pl-2">
                                                {isInTeam ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0.5 px-2 flex items-center gap-1"
                                                    >
                                                        <UserCheck className="h-3 w-3 stroke-[2.5]" />
                                                        In Team
                                                    </Badge>
                                                ) : isAlreadyInvited || isInvitedLocally ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border-indigo-500/20 py-0.5 px-2 flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                                                        Invited
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleInvite(student.id)}
                                                        disabled={isInviting || isInvitingId}
                                                        className="h-7 px-3.5 text-[10px] font-extrabold gap-1 cursor-pointer"
                                                    >
                                                        {isInviting ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Inviting
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="h-3 w-3" />
                                                                Invite
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : searchQuery.trim().length > 0 && !isSearching ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/30" />
                                <p className="text-xs font-bold text-muted-foreground">
                                    No students found matching &quot;{searchQuery}&quot;
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                <Search className="h-8 w-8 text-muted-foreground/20" />
                                <p className="text-xs font-bold text-muted-foreground text-left">
                                    Search by typing student name or email
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
