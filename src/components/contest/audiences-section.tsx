"use client";

import { useState } from "react";
import {
    useGetContestAudiences,
    useAssignAudiences,
    useRemoveAudiences,
    useMyAudiences,
    contestAudiencesKeys,
} from "@/query/contest-query";
import { useDebounce } from "@/hooks/use-debounce";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Trash2, Loader2, Users, School, Layers, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AudiencesSectionProps {
    contestId: string;
}

export function AudiencesSection({ contestId }: AudiencesSectionProps) {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const queryClient = useQueryClient();

    const {
        data: contestAudiencesData,
        isLoading: isLoadingContestAudiences,
        isError: isErrorContestAudiences,
        error: errorContestAudiences,
        refetch: refetchContestAudiences,
    } = useGetContestAudiences(contestId);

    const { data: myAudiencesData, isLoading: isLoadingMyAudiences } = useMyAudiences({
        q: debouncedSearch || undefined,
        page: 1,
        page_size: 10,
    });

    const assignMutation = useAssignAudiences({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: contestAudiencesKeys(contestId) });
                setSearch("");
                toast.success("Audience added to contest");
            },
        },
    });

    const removeMutation = useRemoveAudiences({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: contestAudiencesKeys(contestId) });
                toast.success("Audience removed from contest");
            },
        },
    });

    const currentAudiences = (contestAudiencesData?.data ?? []).map((a) => ({
        ...a,
        type: a.audience_type,
    }));
    const availableAudiences = myAudiencesData?.data ?? [];

    const handleAddAudience = (audienceId: string) => {
        assignMutation.mutate({
            contestId,
            data: { audience_ids: [audienceId] },
        });
    };

    const handleRemoveAudience = (audienceId: string) => {
        removeMutation.mutate({
            contestId,
            data: { audience_ids: [audienceId] },
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Available Audiences
                    </CardTitle>
                    <CardDescription>
                        Select student groups (classes/batches) that can participate in this
                        contest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <Input
                            placeholder="Filter audiences..."
                            className="pl-9 h-11 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isLoadingMyAudiences && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                            </div>
                        )}
                    </div>

                    <ScrollArea className="h-[400px]">
                        {availableAudiences.length > 0 ? (
                            <div className="space-y-2">
                                {availableAudiences.map((audience) => {
                                    const isAssigned = currentAudiences.some(
                                        (a) => a.id === audience.id,
                                    );
                                    return (
                                        <div
                                            key={audience.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                                    <School className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold truncate">
                                                        {audience.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] h-4 px-1.5 font-medium border-border/60"
                                                        >
                                                            {audience.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {isAssigned ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={() => handleAddAudience(audience.id)}
                                                    disabled={
                                                        assignMutation.isPending &&
                                                        assignMutation.variables?.data.audience_ids.includes(
                                                            audience.id,
                                                        )
                                                    }
                                                >
                                                    {assignMutation.isPending &&
                                                    assignMutation.variables?.data.audience_ids.includes(
                                                        audience.id,
                                                    ) ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                    ) : (
                                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
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
                                <Layers className="h-12 w-12 opacity-20" />
                                <p className="text-sm italic">No audiences found</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Restricted To
                    </CardTitle>
                    <CardDescription>
                        Only students from these groups will be allowed to participate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AsyncStateHandler
                        isLoading={isLoadingContestAudiences}
                        isError={isErrorContestAudiences}
                        error={errorContestAudiences}
                        onRetry={refetchContestAudiences}
                        inline
                    >
                        <ScrollArea className="h-[464px]">
                            {currentAudiences.length > 0 ? (
                                <div className="space-y-3">
                                    {currentAudiences.map((audience) => (
                                        <div
                                            key={audience.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background transition-all group shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                                                    <School className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold truncate">
                                                        {audience.name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] h-4 px-1.5 font-bold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                                                        >
                                                            {audience.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                                                aria-label={`Remove ${audience.name} audience`}
                                                onClick={() => handleRemoveAudience(audience.id)}
                                                disabled={
                                                    removeMutation.isPending &&
                                                    removeMutation.variables?.data.audience_ids.includes(
                                                        audience.id,
                                                    )
                                                }
                                            >
                                                {removeMutation.isPending &&
                                                removeMutation.variables?.data.audience_ids.includes(
                                                    audience.id,
                                                ) ? (
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
                                    <Layers className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-sm font-medium italic">
                                        Participation is currently unrestricted (Public)
                                    </p>
                                    <p className="text-[10px] mt-1 text-muted-foreground/60 text-center max-w-[200px]">
                                        Add an audience to restrict participation to specific
                                        groups.
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
