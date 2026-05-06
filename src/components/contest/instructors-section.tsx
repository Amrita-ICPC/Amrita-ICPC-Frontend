"use client";

import { useState } from "react";
import {
    useGetContestInstructors,
    useAssignInstructors,
    useRemoveInstructors,
    useListUsers,
    instructorKeys,
} from "@/query/contest-query";
import { useDebounce } from "@/hooks/use-debounce";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus, Trash2, Loader2, ShieldCheck, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

    const { data: usersData, isLoading: isLoadingUsers } = useListUsers(
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
        },
    });

    const removeMutation = useRemoveInstructors({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: instructorKeys(contestId) });
                toast.success("Instructor removed from contest");
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
            .toUpperCase();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Add Instructors
                    </CardTitle>
                    <CardDescription>
                        Search for users to grant management access to this contest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 h-11 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isLoadingUsers && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                            </div>
                        )}
                    </div>

                    <ScrollArea className="h-[400px]">
                        {search.length < 2 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-2 py-20">
                                <Users className="h-12 w-12 opacity-20" />
                                <p className="text-sm italic">
                                    Type at least 2 characters to search
                                </p>
                            </div>
                        ) : foundUsers.length > 0 ? (
                            <div className="space-y-2">
                                {foundUsers.map((user) => {
                                    const isInstructor = currentInstructors.some(
                                        (i: any) => i.id === user.id,
                                    );
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border/40">
                                                    <AvatarFallback className="bg-primary/5 text-xs text-primary font-bold">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold truncate">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground truncate">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                            {isInstructor ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-7 text-[10px] uppercase tracking-wider font-bold"
                                                >
                                                    Already Added
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={() => handleAddInstructor(user.id)}
                                                    disabled={assignMutation.isPending}
                                                >
                                                    {assignMutation.isPending ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                    ) : (
                                                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                                    )}
                                                    Add
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-2 py-20">
                                <Search className="h-12 w-12 opacity-20" />
                                <p className="text-sm italic">No users found</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Current Instructors
                    </CardTitle>
                    <CardDescription>Users with management access to this contest.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AsyncStateHandler
                        isLoading={isLoadingInstructors}
                        isError={isErrorInstructors}
                        error={errorInstructors}
                        onRetry={refetchInstructors}
                        inline
                    >
                        <ScrollArea className="h-[464px]">
                            {currentInstructors.length > 0 ? (
                                <div className="space-y-3">
                                    {currentInstructors.map((instructor: any) => (
                                        <div
                                            key={instructor.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background transition-all group shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                        {getInitials(instructor.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold flex items-center gap-1.5">
                                                        {instructor.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {instructor.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                                onClick={() =>
                                                    handleRemoveInstructor(instructor.id)
                                                }
                                                disabled={removeMutation.isPending}
                                            >
                                                {removeMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 border border-dashed border-border/40 rounded-xl bg-muted/5">
                                    <ShieldCheck className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-sm font-medium italic">
                                        No instructors assigned yet
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </AsyncStateHandler>
                </CardContent>
            </Card>
        </div>
    );
}
