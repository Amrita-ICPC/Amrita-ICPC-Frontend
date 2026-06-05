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
import {
    Search,
    Plus,
    Trash2,
    Loader2,
    Users,
    School,
    Layers,
    CheckCircle2,
    ShieldAlert,
} from "lucide-react";
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

    const {
        data: myAudiencesData,
        isLoading: isLoadingMyAudiences,
        isError: isErrorMyAudiences,
        error: errorMyAudiences,
        refetch: refetchMyAudiences,
    } = useMyAudiences({
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
            onError: (error: any) => {
                toast.error(`Failed to add audience: ${error.message}`);
            },
        },
    });

    const removeMutation = useRemoveAudiences({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: contestAudiencesKeys(contestId) });
                toast.success("Audience removed from contest");
            },
            onError: (error: any) => {
                toast.error(`Failed to remove audience: ${error.message}`);
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
            <Card className="border-border/60 bg-card/20 shadow-sm backdrop-blur-md rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Layers className="h-4 w-4" />
                        </div>
                        Available Audiences
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Select student groups (classes/batches) that can participate in this
                        contest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-5 flex-1 flex flex-col">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Filter audiences..."
                            className="pl-10 h-12 bg-background/50 border-border/60 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all rounded-xl shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {isLoadingMyAudiences && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-[350px] border border-border/40 rounded-xl bg-background/30 overflow-hidden relative">
                        <AsyncStateHandler
                            isLoading={false}
                            isError={isErrorMyAudiences}
                            error={errorMyAudiences}
                            onRetry={refetchMyAudiences}
                            inline
                        >
                            <ScrollArea className="h-full absolute inset-0">
                                {availableAudiences.length > 0 ? (
                                    <div className="p-3 space-y-2">
                                        {availableAudiences.map((audience) => {
                                            const isAssigned = currentAudiences.some(
                                                (a) => a.id === audience.id,
                                            );
                                            return (
                                                <div
                                                    key={audience.id}
                                                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-background/40 hover:bg-background hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                            <School className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                                {audience.name}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] h-5 px-2 font-medium border-border/60 bg-muted/30"
                                                                >
                                                                    {audience.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isAssigned ? (
                                                        <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-semibold text-xs">
                                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                            Assigned
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-8 rounded-lg shadow-sm font-semibold px-4 transition-all"
                                                            onClick={() =>
                                                                handleAddAudience(audience.id)
                                                            }
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
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
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
                                            <Layers className="h-7 w-7 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">No audiences found</p>
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        Restricted To
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Only students from these groups will be allowed to participate.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 min-h-[432px] relative border border-border/40 rounded-xl bg-background/30 overflow-hidden">
                        <AsyncStateHandler
                            isLoading={isLoadingContestAudiences}
                            isError={isErrorContestAudiences}
                            error={errorContestAudiences}
                            onRetry={refetchContestAudiences}
                            inline
                        >
                            <ScrollArea className="h-full absolute inset-0">
                                {currentAudiences.length > 0 ? (
                                    <div className="p-3 space-y-3">
                                        {currentAudiences.map((audience) => (
                                            <div
                                                key={audience.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background hover:shadow-md transition-all duration-300 group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-lg bg-orange-500/5 flex items-center justify-center border border-orange-500/10 shadow-sm group-hover:bg-orange-500/10 transition-colors">
                                                        <School className="h-5 w-5 text-orange-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold truncate group-hover:text-orange-500 transition-colors">
                                                            {audience.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] h-5 px-2 font-bold border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5"
                                                            >
                                                                {audience.type}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 shadow-sm"
                                                    aria-label={`Remove ${audience.name} audience`}
                                                    onClick={() =>
                                                        handleRemoveAudience(audience.id)
                                                    }
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
                                                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4 py-24">
                                        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border/60">
                                            <Users className="h-7 w-7 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Participation is currently unrestricted (Public)
                                        </p>
                                        <p className="text-xs mt-1 text-muted-foreground/60 text-center max-w-[250px]">
                                            Add an audience to restrict participation to specific
                                            groups.
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
