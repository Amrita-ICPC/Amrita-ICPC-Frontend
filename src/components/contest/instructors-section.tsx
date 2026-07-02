"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Search, ShieldCheck, Trash2, UserCog, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import {
    instructorKeys,
    useAssignInstructors,
    useGetContestInstructors,
    useListUsers,
    useRemoveInstructors,
} from "@/query/contest-query";

import { AsyncStateHandler } from "../shared/async-state-handler";

interface InstructorsSectionProps {
    contestId: string;
}

export function InstructorsSection({ contestId }: InstructorsSectionProps) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const queryClient = useQueryClient();

    const {
        data: instructorsData,
        isLoading: isLoadingInstructors,
        isError: isErrorInstructors,
        error: errorInstructors,
        refetch: refetchInstructors,
    } = useGetContestInstructors(contestId, { page: 1, page_size: 100 });

    const {
        data: usersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        refetch: refetchUsers,
    } = useListUsers(
        { q: debouncedSearch || undefined, page_size: 5 },
        { query: { enabled: debouncedSearch.length >= 2 } },
    );

    const assignMutation = useAssignInstructors({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: instructorKeys(contestId) });
                setSearch("");
                toast.success("Instructor added successfully");
            },
            onError: (error: any) => {
                toast.error(`Failed to add instructor: ${error.message}`);
            },
        },
    });

    const removeMutation = useRemoveInstructors({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: instructorKeys(contestId) });
                toast.success("Instructor removed from contest");
            },
            onError: (error: any) => {
                toast.error(`Failed to remove instructor: ${error.message}`);
            },
        },
    });

    const currentInstructors = instructorsData?.data ?? [];
    const foundUsers = usersData?.data ?? [];

    const handleAddInstructor = (userId: string) => {
        assignMutation.mutate({
            contestId,
            data: { instructor_ids: [userId] },
        });
    };

    const handleRemoveInstructor = (userId: string) => {
        removeMutation.mutate({
            contestId,
            data: { instructor_ids: [userId] },
        });
    };

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/60 bg-card/20 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserPlus className="h-4 w-4" />
                        </div>
                        Add Instructors
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Search for users to grant management access to this contest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-5 flex-1 flex flex-col">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 h-12 bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-xl shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isLoadingUsers && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-[350px] border border-border/40 rounded-xl bg-background/30 overflow-hidden relative">
                        <AsyncStateHandler
                            isLoading={false}
                            isError={isErrorUsers}
                            error={errorUsers}
                            onRetry={refetchUsers}
                            inline
                        >
                            <ScrollArea className="h-full absolute inset-0">
                                {search.length < 2 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4 py-24">
                                        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                                            <Search className="h-7 w-7 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Type at least 2 characters to search
                                        </p>
                                    </div>
                                ) : foundUsers.length > 0 ? (
                                    <div className="p-3 space-y-2">
                                        {foundUsers.map((user) => {
                                            const isInstructor = currentInstructors.some(
                                                (i: any) => i.id === user.id,
                                            );
                                            return (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-background/40 hover:bg-background hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <Avatar className="h-10 w-10 border border-primary/10 shadow-sm">
                                                            <AvatarFallback className="bg-primary/5 text-xs text-primary font-bold">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground truncate">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isInstructor ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-7 px-2.5 text-[10px] uppercase tracking-wider font-bold bg-muted/50 text-muted-foreground border-transparent"
                                                        >
                                                            Added
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="default"
                                                            className="h-8 rounded-lg shadow-sm font-semibold px-4 transition-all"
                                                            onClick={() =>
                                                                handleAddInstructor(user.id)
                                                            }
                                                            disabled={
                                                                assignMutation.isPending &&
                                                                assignMutation.variables?.data.instructor_ids.includes(
                                                                    user.id,
                                                                )
                                                            }
                                                        >
                                                            {assignMutation.isPending &&
                                                            assignMutation.variables?.data.instructor_ids.includes(
                                                                user.id,
                                                            ) ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                                                    Add
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4 py-24">
                                        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                                            <Users className="h-7 w-7 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">No users found</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </AsyncStateHandler>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/20 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        Current Instructors
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Users who actively manage this contest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 min-h-[432px] relative border border-border/40 rounded-xl bg-background/30 overflow-hidden">
                        <AsyncStateHandler
                            isLoading={isLoadingInstructors}
                            isError={isErrorInstructors}
                            error={errorInstructors}
                            onRetry={refetchInstructors}
                            inline
                        >
                            <ScrollArea className="h-full absolute inset-0">
                                {currentInstructors.length > 0 ? (
                                    <div className="p-3 space-y-3">
                                        {currentInstructors.map((instructor: any) => {
                                            const isRemoving =
                                                removeMutation.isPending &&
                                                removeMutation.variables?.data.instructor_ids.includes(
                                                    instructor.id,
                                                );
                                            return (
                                                <div
                                                    key={instructor.id}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background hover:shadow-md transition-all duration-300 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-11 w-11 border-2 border-emerald-500/10 shadow-sm">
                                                            <AvatarFallback className="bg-emerald-500/5 text-emerald-600 font-bold">
                                                                {getInitials(instructor.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold flex items-center gap-2 text-foreground group-hover:text-emerald-600 transition-colors">
                                                                {instructor.name}
                                                                <Badge
                                                                    variant="outline"
                                                                    className="h-5 px-1.5 text-[9px] uppercase tracking-wider font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5"
                                                                >
                                                                    Instructor
                                                                </Badge>
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                                <Mail className="h-3 w-3 opacity-60" />
                                                                {instructor.email}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 shadow-sm"
                                                        aria-label={`Remove ${instructor.name}`}
                                                        onClick={() =>
                                                            handleRemoveInstructor(instructor.id)
                                                        }
                                                        disabled={isRemoving}
                                                    >
                                                        {isRemoving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4 py-24">
                                        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                                            <UserCog className="h-7 w-7 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            No instructors assigned yet
                                        </p>
                                    </div>
                                )}
                            </ScrollArea>
                        </AsyncStateHandler>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
