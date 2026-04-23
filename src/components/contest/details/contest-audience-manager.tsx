"use client";

import { useState } from "react";
import { UsersRound, Plus, X, Search, Loader2 } from "lucide-react";
import { useContestAudiences, useAssignAudiences, useRemoveAudiences } from "@/query/contest-query";
import { useUserAudiences } from "@/query/user-query";
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

interface ContestAudienceManagerProps {
    contestId: string;
}

export function ContestAudienceManager({ contestId }: ContestAudienceManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data: linkedAudiences, isLoading: isLoadingLinked } = useContestAudiences(contestId);
    const { data: allAudiences } = useUserAudiences({
        page: 1,
        page_size: 50,
        ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
    });

    const assignMutation = useAssignAudiences(contestId);
    const removeMutation = useRemoveAudiences(contestId);

    const handleAssign = async (audienceId: string) => {
        try {
            await assignMutation.mutateAsync({ audience_ids: [audienceId] });
            toast.success("Audience added");
        } catch {
            toast.error("Failed to add");
        }
    };

    const handleRemove = async (audienceId: string) => {
        try {
            await removeMutation.mutateAsync({ audience_ids: [audienceId] });
            toast.success("Audience removed");
        } catch {
            toast.error("Failed to remove");
        }
    };

    const linkedIds = new Set(linkedAudiences?.map((a) => a.id) || []);

    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card h-full flex flex-col max-w-md mx-auto lg:mx-0">
            <CardHeader className="pb-3 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <UsersRound className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        Target Audiences
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
                            <DialogTitle>Manage Audiences</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search audiences..."
                                    className="h-10 pl-9 rounded-xl border-border/60"
                                />
                            </div>
                            <ScrollArea className="h-[280px] pr-4">
                                <div className="space-y-1">
                                    {allAudiences?.data?.length === 0 ? (
                                        <div className="text-center py-10 text-sm text-muted-foreground">
                                            No results
                                        </div>
                                    ) : (
                                        allAudiences?.data?.map((audience) => {
                                            const isLinked = linkedIds.has(audience.id);
                                            return (
                                                <div
                                                    key={audience.id}
                                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold truncate">
                                                            {audience.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                            {audience.type.replace("_", " ")}
                                                        </span>
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
                                                                ? handleRemove(audience.id)
                                                                : handleAssign(audience.id)
                                                        }
                                                    >
                                                        {isLinked ? "Remove" : "Add"}
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
                ) : linkedAudiences?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 bg-muted/20 rounded-xl border border-dashed h-full min-h-[120px]">
                        <UsersRound className="h-6 w-6 text-muted-foreground/30" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            None linked
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[150px]">
                        <div className="flex flex-col gap-2 pr-4">
                            {linkedAudiences?.map((audience) => (
                                <div
                                    key={audience.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/40 group"
                                >
                                    <span className="text-xs font-semibold truncate">
                                        {audience.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="h-6 w-6 rounded-md hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        onClick={() => handleRemove(audience.id)}
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
