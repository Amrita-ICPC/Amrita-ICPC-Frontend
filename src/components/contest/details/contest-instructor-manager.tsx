"use client";

import { useState } from "react";
import { Users, Plus, X, Search, Loader2 } from "lucide-react";
import { useAssignInstructors, useRemoveInstructors } from "@/mutation/contest-mutation";
import { useContestInstructors } from "@/query/contest-query";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/api/generated/users/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError } from "next/dist/server/api-utils";

interface ContestInstructorManagerProps {
    contestId: string;
}

const usersApi = getUsers();

export function ContestInstructorManager({ contestId }: ContestInstructorManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data: linkedInstructors, isLoading: isLoadingLinked } =
        useContestInstructors(contestId);

    const { data: allInstructors, isLoading: isLoadingAll } = useQuery({
        queryKey: ["users", "instructor", debouncedSearch],
        queryFn: async () => {
            const response = await usersApi.listUsersApiV1UsersGet({
                role: "instructor",
                q: debouncedSearch.trim() || undefined,
                page: 1,
                page_size: 50,
            });
            return response.data;
        },
    });

    const assignMutation = useAssignInstructors(contestId);
    const removeMutation = useRemoveInstructors(contestId);

    const handleAssign = async (instructorId: string) => {
        try {
            await assignMutation.mutateAsync({ instructor_ids: [instructorId] });
            toast.success("Instructor assigned");
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message || "Failed to remove");
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleRemove = async (instructorId: string) => {
        try {
            await removeMutation.mutateAsync({ instructor_ids: [instructorId] });
            toast.success("Instructor removed");
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message || "Failed to remove");
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const linkedIds = new Set(linkedInstructors?.map((i) => i.id) || []);

    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        Instructors
                    </CardTitle>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Instructors</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search instructors..."
                                    className="h-10 pl-9 rounded-xl border-border/60"
                                />
                            </div>
                            <ScrollArea className="h-[280px] pr-4">
                                <div className="space-y-1">
                                    {isLoadingAll ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : allInstructors?.length === 0 ? (
                                        <div className="text-center py-10 text-sm text-muted-foreground">
                                            No results
                                        </div>
                                    ) : (
                                        allInstructors?.map((instructor) => {
                                            const isLinked = linkedIds.has(instructor.id);
                                            return (
                                                <div
                                                    key={instructor.id}
                                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                                                                {instructor.name
                                                                    .substring(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-semibold truncate">
                                                                {instructor.name}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                {instructor.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={isLinked ? "outline" : "default"}
                                                        className="h-8 px-3 rounded-lg font-bold text-[10px] shrink-0 ml-2"
                                                        disabled={
                                                            assignMutation.isPending ||
                                                            removeMutation.isPending
                                                        }
                                                        onClick={() =>
                                                            isLinked
                                                                ? handleRemove(instructor.id)
                                                                : handleAssign(instructor.id)
                                                        }
                                                    >
                                                        {isLinked ? "Remove" : "Assign"}
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold w-full"
                                onClick={() => setIsOpen(false)}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1">
                {isLoadingLinked ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : linkedInstructors?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 bg-muted/20 rounded-xl border border-dashed h-full min-h-[120px]">
                        <Users className="h-6 w-6 text-muted-foreground/30" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            None assigned
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[150px]">
                        <div className="flex flex-col gap-2 pr-4">
                            {linkedInstructors?.map((instructor) => (
                                <div
                                    key={instructor.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 group"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Avatar className="h-6 w-6 shrink-0 font-bold">
                                            <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                                                {instructor.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-semibold truncate">
                                            {instructor.name}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="h-6 w-6 rounded-md hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        onClick={() => handleRemove(instructor.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
