"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    ArrowUpDown,
    Calendar,
    CheckCircle2,
    Crown,
    Loader2,
    LogOut,
    Mail,
    Search,
    ShieldAlert,
    Trash2,
    UserCheck,
    UserPlus,
    Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import type { StudentTeamCardResponse, TeamMemberDetailResponse } from "@/api/generated/model";
import {
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
    getGetTeamMembersApiV1StudentsTeamsTeamIdMembersGetQueryKey,
    useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet,
    useInviteToTeamApiV1StudentsTeamsTeamIdInvitationInviteUserIdPost,
    useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete,
    useRemoveTeamMemberApiV1StudentsTeamsTeamIdMembersMemberIdDelete,
} from "@/api/generated/students/students";
import { useListStudentsApiV1UsersStudentsGet } from "@/api/generated/users/users";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";

interface StudentManageTeamDialogProps {
    team: StudentTeamCardResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contestId?: string;
}

export function StudentManageTeamDialog({
    team,
    open,
    onOpenChange,
    contestId,
}: StudentManageTeamDialogProps) {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    // Active Members tab states
    const [memberSearchQuery, setMemberSearchQuery] = useState("");
    const debouncedMemberSearch = useDebounce(memberSearchQuery, 300);
    const [sortBy, setSortBy] = useState<"name" | "email" | "joined_at">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Invite tab states
    const [inviteSearchQuery, setInviteSearchQuery] = useState("");
    const debouncedInviteSearch = useDebounce(inviteSearchQuery, 300);
    const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
    const [activeInviteId, setActiveInviteId] = useState<string | null>(null);

    // Action Confirmation States
    const [memberToKick, setMemberToKick] = useState<TeamMemberDetailResponse | null>(null);
    const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

    // Get active team members
    const { data: membersData, isLoading: isMembersLoading } =
        useGetTeamMembersApiV1StudentsTeamsTeamIdMembersGet(
            team.id,
            {
                name:
                    debouncedMemberSearch && !debouncedMemberSearch.includes("@")
                        ? debouncedMemberSearch
                        : undefined,
                email:
                    debouncedMemberSearch && debouncedMemberSearch.includes("@")
                        ? debouncedMemberSearch
                        : undefined,
                sort_by: sortBy,
                order: sortOrder,
                contest_id: contestId || undefined,
            },
            {
                query: {
                    enabled: open,
                },
            },
        );

    const members = membersData?.data || [];

    // Get searchable student list for invitation (only for leader, enabled when open)
    const { data: studentsData, isLoading: isStudentsLoading } =
        useListStudentsApiV1UsersStudentsGet(
            {
                q: debouncedInviteSearch || undefined,
                team_id: team.id,
                page: 1,
                page_size: 20,
            },
            {
                query: {
                    enabled: open && team.is_leader,
                },
            },
        );

    const students = studentsData?.data || [];

    // Leave Team Mutation
    const { mutate: leaveTeam, isPending: isLeaving } =
        useLeaveTeamMeApiV1StudentsTeamsTeamIdMembersMeDelete({
            mutation: {
                meta: {
                    successMessage: `Successfully left team "${team.title}"`,
                },
                onSuccess: () => {
                    setIsLeaveConfirmOpen(false);
                    onOpenChange(false);
                    void queryClient.invalidateQueries({
                        queryKey: getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                    });
                },
            },
        });

    // Kick Member Mutation
    const { mutate: kickMember, isPending: isKicking } =
        useRemoveTeamMemberApiV1StudentsTeamsTeamIdMembersMemberIdDelete({
            mutation: {
                meta: {
                    successMessage: `Successfully removed member from team`,
                },
                onSuccess: () => {
                    setMemberToKick(null);
                    void queryClient.invalidateQueries({
                        queryKey: getGetTeamMembersApiV1StudentsTeamsTeamIdMembersGetQueryKey(
                            team.id,
                        ),
                    });
                    void queryClient.invalidateQueries({
                        queryKey: getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                    });
                },
            },
        });

    // Invite User Mutation
    const { mutate: inviteUser, isPending: isInviting } =
        useInviteToTeamApiV1StudentsTeamsTeamIdInvitationInviteUserIdPost({
            mutation: {
                meta: {
                    successMessage: "Invitation sent successfully!",
                },
            },
        });

    const handleLeave = () => {
        leaveTeam({ teamId: team.id });
    };

    const handleKick = () => {
        if (!memberToKick) return;
        kickMember({ teamId: team.id, memberId: memberToKick.id });
    };

    const handleInvite = (studentUserId: string) => {
        setActiveInviteId(studentUserId);
        inviteUser(
            {
                teamId: team.id,
                inviteUserId: studentUserId,
                params: { type: "INVITE" },
            },
            {
                onSuccess: () => {
                    setActiveInviteId(null);
                    setInvitedUserIds((prev) => {
                        const next = new Set(prev);
                        next.add(studentUserId);
                        return next;
                    });
                    void queryClient.invalidateQueries({
                        queryKey: getGetTeamMembersApiV1StudentsTeamsTeamIdMembersGetQueryKey(
                            team.id,
                        ),
                    });
                    void queryClient.invalidateQueries({
                        queryKey: getGetMyTeamsApiV1StudentsTeamsGetQueryKey(),
                    });
                },
                onError: () => {
                    setActiveInviteId(null);
                },
            },
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const isCurrentUser = (member: TeamMemberDetailResponse) => {
        return session?.user?.email === member.email || session?.user?.id === member.id;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="p-6 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Users className="h-5.5 w-5.5" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-lg font-bold leading-tight">
                                    Manage Team - {team.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-1">
                                    View members and invite new students to join. Code:{" "}
                                    <code className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10 font-mono font-bold tracking-widest text-primary text-[11px] select-all">
                                        {team.code}
                                    </code>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {team.is_leader ? (
                        <Tabs
                            defaultValue="members"
                            className="flex-1 flex flex-col overflow-hidden mt-2"
                        >
                            <div className="px-6 border-b border-border/40 pb-2.5">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="members" className="cursor-pointer text-xs">
                                        <Users className="h-3.5 w-3.5 mr-1.5" />
                                        Active Members ({members.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="invite" className="cursor-pointer text-xs">
                                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                        Invite Students
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Active Members Tab Content */}
                            <TabsContent
                                value="members"
                                className="flex-1 flex flex-col overflow-hidden outline-none mt-0"
                            >
                                {/* Active Members Filter & Sorting */}
                                <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b border-border/40 bg-muted/5">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search members..."
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            className="pl-9.5 h-9 text-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Select
                                            value={sortBy}
                                            onValueChange={(val: any) => setSortBy(val)}
                                        >
                                            <SelectTrigger className="w-[130px] h-9 text-xs">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="name" className="text-xs">
                                                    Name
                                                </SelectItem>
                                                <SelectItem value="email" className="text-xs">
                                                    Email
                                                </SelectItem>
                                                <SelectItem value="joined_at" className="text-xs">
                                                    Joined Date
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 cursor-pointer shrink-0"
                                            onClick={() =>
                                                setSortOrder((prev) =>
                                                    prev === "asc" ? "desc" : "asc",
                                                )
                                            }
                                            title={sortOrder === "asc" ? "Ascending" : "Descending"}
                                        >
                                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Active Members Scroll List */}
                                <ScrollArea className="h-[360px] pr-2">
                                    <div className="p-6 space-y-3">
                                        {isMembersLoading ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider animate-pulse">
                                                    Loading Members...
                                                </span>
                                            </div>
                                        ) : members.length > 0 ? (
                                            members.map((member: TeamMemberDetailResponse) => {
                                                const isMe = isCurrentUser(member);
                                                const isLeader = member.team_role === "LEADER";

                                                return (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-3.5 border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 rounded-xl shadow-xs"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border border-border shadow-xs shrink-0">
                                                                <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                                                    {member.name
                                                                        .split(" ")
                                                                        .map((n: string) => n[0])
                                                                        .join("")
                                                                        .toUpperCase()
                                                                        .slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col leading-tight min-w-0 text-left">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-bold text-foreground truncate">
                                                                        {member.name}
                                                                    </span>
                                                                    {isMe && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-primary/10 text-primary border-transparent"
                                                                        >
                                                                            You
                                                                        </Badge>
                                                                    )}
                                                                    {isLeader && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-violet-500/10 text-violet-500 border-violet-500/20 flex items-center gap-0.5"
                                                                        >
                                                                            <Crown className="h-2 w-2" />
                                                                            Leader
                                                                        </Badge>
                                                                    )}
                                                                    {contestId &&
                                                                        member.is_in_contest !==
                                                                            undefined &&
                                                                        (member.is_in_contest ? (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                            >
                                                                                Registered
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                                            >
                                                                                Not Registered
                                                                            </Badge>
                                                                        ))}
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground font-semibold truncate mt-1 flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 shrink-0" />
                                                                    {member.email}
                                                                </span>
                                                                <span className="text-[9px] text-muted-foreground/80 font-medium mt-1 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3 shrink-0" />
                                                                    Joined{" "}
                                                                    {formatDate(member.joined_at)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 pl-2">
                                                            {isMe ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setIsLeaveConfirmOpen(true)
                                                                    }
                                                                    className="h-7 text-[10px] font-black uppercase tracking-wider gap-1 border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer animate-none"
                                                                >
                                                                    <LogOut className="h-3 w-3" />
                                                                    Leave
                                                                </Button>
                                                            ) : (
                                                                team.is_leader &&
                                                                !isLeader && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            setMemberToKick(member)
                                                                        }
                                                                        className="h-7 text-[10px] font-black uppercase tracking-wider gap-1 border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                        Kick
                                                                    </Button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                                                <Users className="h-10 w-10 text-muted-foreground/30" />
                                                <p className="text-xs font-bold text-muted-foreground">
                                                    No team members found
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* Invite Students Tab Content */}
                            <TabsContent
                                value="invite"
                                className="flex-1 flex flex-col overflow-hidden outline-none mt-0"
                            >
                                {/* Search Student Input */}
                                <div className="px-6 py-3 border-b border-border/40 bg-muted/5 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Type student name or email to invite..."
                                            value={inviteSearchQuery}
                                            onChange={(e) => setInviteSearchQuery(e.target.value)}
                                            className="pl-9.5 h-9 text-xs"
                                        />
                                    </div>
                                    {isStudentsLoading && (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                                    )}
                                </div>

                                {/* Student Search Results Scroll List */}
                                <ScrollArea className="h-[360px] pr-2">
                                    <div className="p-6 space-y-3">
                                        {students.length > 0 ? (
                                            students.map((student) => {
                                                const isInTeam = student.is_in_team;
                                                const isAlreadyInvited = student.is_already_invited;
                                                const isInvitedLocally = invitedUserIds.has(
                                                    student.id,
                                                );
                                                const isCurrentlyInviting =
                                                    activeInviteId === student.id;

                                                return (
                                                    <div
                                                        key={student.id}
                                                        className="flex items-center justify-between p-3.5 border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 rounded-xl shadow-xs"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border border-border shadow-xs shrink-0">
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
                                                                <span className="text-[10px] text-muted-foreground font-semibold truncate mt-1 flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 shrink-0" />
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
                                                            ) : isAlreadyInvited ||
                                                              isInvitedLocally ? (
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
                                                                    onClick={() =>
                                                                        handleInvite(student.id)
                                                                    }
                                                                    disabled={
                                                                        isCurrentlyInviting ||
                                                                        isInviting
                                                                    }
                                                                    className="h-7.5 px-3.5 text-[10px] font-black uppercase tracking-wider gap-1 cursor-pointer"
                                                                >
                                                                    {isCurrentlyInviting ? (
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
                                            })
                                        ) : inviteSearchQuery.trim().length > 0 &&
                                          !isStudentsLoading ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                                                <Search className="h-9 w-9 text-muted-foreground/30" />
                                                <p className="text-xs font-bold text-muted-foreground">
                                                    No students found matching &quot;
                                                    {inviteSearchQuery}&quot;
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                                                <Search className="h-9 w-9 text-muted-foreground/20" />
                                                <p className="text-xs font-bold text-muted-foreground">
                                                    Search students by name or email
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* Regular members see clean list without Tabs */
                        <div className="flex-1 flex flex-col overflow-hidden mt-2">
                            {/* Active Members Filter & Sorting */}
                            <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b border-border/40 bg-muted/5">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search members..."
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        className="pl-9.5 h-9 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Select
                                        value={sortBy}
                                        onValueChange={(val: any) => setSortBy(val)}
                                    >
                                        <SelectTrigger className="w-[130px] h-9 text-xs">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name" className="text-xs">
                                                Name
                                            </SelectItem>
                                            <SelectItem value="email" className="text-xs">
                                                Email
                                            </SelectItem>
                                            <SelectItem value="joined_at" className="text-xs">
                                                Joined Date
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 cursor-pointer shrink-0"
                                        onClick={() =>
                                            setSortOrder((prev) =>
                                                prev === "asc" ? "desc" : "asc",
                                            )
                                        }
                                        title={sortOrder === "asc" ? "Ascending" : "Descending"}
                                    >
                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>

                            {/* Active Members Scroll List */}
                            <ScrollArea className="h-[360px] pr-2">
                                <div className="p-6 space-y-3">
                                    {isMembersLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider animate-pulse">
                                                Loading Members...
                                            </span>
                                        </div>
                                    ) : members.length > 0 ? (
                                        members.map((member: TeamMemberDetailResponse) => {
                                            const isMe = isCurrentUser(member);
                                            const isLeader = member.team_role === "LEADER";

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-3.5 border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 rounded-xl shadow-xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar className="h-9 w-9 border border-border shadow-xs shrink-0">
                                                            <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
                                                                {member.name
                                                                    .split(" ")
                                                                    .map((n: string) => n[0])
                                                                    .join("")
                                                                    .toUpperCase()
                                                                    .slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col leading-tight min-w-0 text-left">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground truncate">
                                                                    {member.name}
                                                                </span>
                                                                {isMe && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-primary/10 text-primary border-transparent"
                                                                    >
                                                                        You
                                                                    </Badge>
                                                                )}
                                                                {isLeader && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-violet-500/10 text-violet-500 border-violet-500/20 flex items-center gap-0.5"
                                                                    >
                                                                        <Crown className="h-2 w-2" />
                                                                        Leader
                                                                    </Badge>
                                                                )}
                                                                {contestId &&
                                                                    member.is_in_contest !==
                                                                        undefined &&
                                                                    (member.is_in_contest ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                        >
                                                                            Registered
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[8px] font-black tracking-wider uppercase py-0 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                                        >
                                                                            Not Registered
                                                                        </Badge>
                                                                    ))}
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-semibold truncate mt-1 flex items-center gap-1">
                                                                <Mail className="h-3 w-3 shrink-0" />
                                                                {member.email}
                                                            </span>
                                                            <span className="text-[9px] text-muted-foreground/80 font-medium mt-1 flex items-center gap-1">
                                                                <Calendar className="h-3 w-3 shrink-0" />
                                                                Joined{" "}
                                                                {formatDate(member.joined_at)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 pl-2">
                                                        {isMe && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setIsLeaveConfirmOpen(true)
                                                                }
                                                                className="h-7 text-[10px] font-black uppercase tracking-wider gap-1 border-destructive/20 text-destructive hover:bg-destructive/10 cursor-pointer animate-none"
                                                            >
                                                                <LogOut className="h-3 w-3" />
                                                                Leave
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                                            <Users className="h-10 w-10 text-muted-foreground/30" />
                                            <p className="text-xs font-bold text-muted-foreground">
                                                No team members found
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Leave Confirmation Dialog */}
            <AlertDialog open={isLeaveConfirmOpen} onOpenChange={setIsLeaveConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5.5 w-5.5" />
                            Leave Team
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left text-sm leading-normal">
                            {team.is_leader ? (
                                <>
                                    Are you sure you want to leave the team{" "}
                                    <strong className="text-foreground">
                                        &quot;{team.title}&quot;
                                    </strong>
                                    ? As the leader, leaving the team will dissolve it, and all
                                    members will lose access. This action is permanent.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to leave the team{" "}
                                    <strong className="text-foreground">
                                        &quot;{team.title}&quot;
                                    </strong>
                                    ? You will lose access to this team and will need to request to
                                    join again or be invited by the leader to return.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLeaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Leaving...
                                </>
                            ) : (
                                "Leave Team"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Kick Member Confirmation Dialog */}
            <AlertDialog
                open={!!memberToKick}
                onOpenChange={(open) => !open && setMemberToKick(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5.5 w-5.5" />
                            Kick Team Member
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left text-sm leading-normal">
                            Are you sure you want to remove{" "}
                            <strong className="text-foreground">{memberToKick?.name}</strong> from
                            the team{" "}
                            <strong className="text-foreground">&quot;{team.title}&quot;</strong>?
                            They will immediately lose access to this team and all team resources.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isKicking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleKick}
                            disabled={isKicking}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isKicking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kicking...
                                </>
                            ) : (
                                "Kick Member"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
