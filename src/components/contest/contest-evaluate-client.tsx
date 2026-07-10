"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    CalendarClock,
    Clock3,
    Eye,
    FileCheck2,
    Loader2,
    Pencil,
    RotateCcw,
    Send,
    ShieldAlert,
    Timer,
    Trophy,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
    getGetContestApiV1ContestsContestIdGetQueryKey,
    getGetContestResultsApiV1ContestsContestIdResultsGetQueryKey,
    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey,
    useGetContestApiV1ContestsContestIdGet,
    useGetContestResultsApiV1ContestsContestIdResultsGet,
    useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet,
    usePublishResultsApiV1ContestsContestIdPublishResultsPost,
    useUpdateContestApiV1ContestsContestIdPatch,
} from "@/api/generated/contests/contests";
import { EvaluationDialog } from "@/components/contest/evaluation-dialog";
import { ResultsTeamsClient } from "@/components/contest/results-teams-client";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ContestEvaluateClientProps {
    contestId: string;
}

function errorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null) {
        const candidate = error as { message?: string; response?: { data?: { message?: string } } };
        return candidate.response?.data?.message ?? candidate.message ?? fallback;
    }
    return fallback;
}

export function ContestEvaluateClient({ contestId }: ContestEvaluateClientProps) {
    const queryClient = useQueryClient();
    const contestQuery = useGetContestApiV1ContestsContestIdGet(contestId);
    const resultsQuery = useGetContestResultsApiV1ContestsContestIdResultsGet(contestId);
    const statusQuery = useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet(contestId);

    const contest = contestQuery.data?.data;
    const results = resultsQuery.data?.data;
    const status = statusQuery.data?.data;
    const isPublished = Boolean(contest?.results_published_at);
    const settingsPending = false;

    const invalidateResults = async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: getGetContestApiV1ContestsContestIdGetQueryKey(contestId),
            }),
            queryClient.invalidateQueries({
                queryKey: getGetContestResultsApiV1ContestsContestIdResultsGetQueryKey(contestId),
            }),
            queryClient.invalidateQueries({
                queryKey:
                    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey(contestId),
            }),
        ]);
    };

    const publishMutation = usePublishResultsApiV1ContestsContestIdPublishResultsPost({
        mutation: {
            onSuccess: async (_response, variables) => {
                toast.success(
                    variables.params.publish ? "Results published" : "Results unpublished",
                );
                await invalidateResults();
            },
            onError: (error) =>
                toast.error(errorMessage(error, "Could not update publication status")),
        },
    });

    const updateMutation = useUpdateContestApiV1ContestsContestIdPatch({
        mutation: {
            onSuccess: async () => {
                toast.success("Visibility updated");
                await queryClient.invalidateQueries({
                    queryKey: getGetContestApiV1ContestsContestIdGetQueryKey(contestId),
                });
            },
            onError: (error) => toast.error(errorMessage(error, "Could not update visibility")),
        },
    });

    const evaluationActive = status?.status === "PENDING" || status?.status === "RUNNING";

    return (
        <AsyncStateHandler
            isLoading={contestQuery.isLoading || resultsQuery.isLoading}
            isError={contestQuery.isError || resultsQuery.isError || !contest}
            error={contestQuery.error ?? resultsQuery.error}
            onRetry={() => void invalidateResults()}
            errorTitle="Results unavailable"
        >
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
                        <div className="max-w-3xl space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border-transparent bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/15 dark:text-indigo-300">
                                    Results workspace
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "bg-background/60",
                                        isPublished
                                            ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                            : "border-amber-500/30 text-amber-700 dark:text-amber-300",
                                    )}
                                >
                                    {isPublished ? "Published" : "Draft"}
                                </Badge>
                                {evaluationActive && (
                                    <Badge className="border-transparent bg-primary/10 text-primary hover:bg-primary/10">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Evaluation in progress
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                    {contest?.name}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                                    {contest?.description ||
                                        "Review participation, evaluate submissions, and control what participants can see."}
                                </p>
                            </div>
                            <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                                <MetricCard
                                    icon={FileCheck2}
                                    label="Responses"
                                    value={results?.total_responses ?? 0}
                                    description="Submissions received"
                                    tone="primary"
                                />
                                <MetricCard
                                    icon={ShieldAlert}
                                    label="Flagged participants"
                                    value={results?.flagged_responses ?? 0}
                                    description="Require manual review"
                                    tone={
                                        (results?.flagged_responses ?? 0) > 0 ? "danger" : "success"
                                    }
                                    href={`/contest/${contestId}/evaluate#standings`}
                                />
                            </div>
                            <div className="grid max-w-3xl gap-2 sm:grid-cols-3">
                                <TimeCard
                                    icon={CalendarClock}
                                    label="Starts"
                                    value={formatDateTime(contest?.start_time)}
                                    tone="sky"
                                />
                                <TimeCard
                                    icon={Clock3}
                                    label="Ends"
                                    value={formatDateTime(contest?.end_time)}
                                    tone="rose"
                                />
                                <TimeCard
                                    icon={Timer}
                                    label="Duration"
                                    value={formatDuration(contest?.duration)}
                                    tone="amber"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap justify-end gap-2">
                                <EvaluationDialog
                                    contestId={contestId}
                                    contestMode={contest?.contest_mode}
                                    trigger={
                                        <Button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                                            {evaluationActive ? (
                                                <RotateCcw className="h-4 w-4" />
                                            ) : (
                                                <Zap className="h-4 w-4" />
                                            )}
                                            {evaluationActive ? "Restart evaluation" : "Evaluate"}
                                        </Button>
                                    }
                                />
                                <Button variant="outline" asChild>
                                    <Link href={`/contest/${contestId}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        Edit contest
                                    </Link>
                                </Button>
                            </div>
                            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                                <SettingRow
                                    icon={Send}
                                    title="Publish results"
                                    description="Make results available to participants"
                                    checked={isPublished}
                                    disabled={publishMutation.isPending}
                                    onCheckedChange={(checked) =>
                                        publishMutation.mutate({
                                            contestId,
                                            params: { publish: checked },
                                        })
                                    }
                                    highlighted
                                />
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <SettingRow
                                        icon={Trophy}
                                        title="Leaderboard"
                                        description="Show team rankings"
                                        checked={Boolean(contest?.show_leaderboard)}
                                        disabled={
                                            !isPublished ||
                                            updateMutation.isPending ||
                                            settingsPending
                                        }
                                        onCheckedChange={(checked) =>
                                            updateMutation.mutate({
                                                contestId,
                                                data: { show_leaderboard: checked },
                                            })
                                        }
                                    />
                                    <SettingRow
                                        icon={Eye}
                                        title="Team submissions"
                                        description="Show submitted solutions"
                                        checked={Boolean(contest?.show_team_submissions)}
                                        disabled={
                                            !isPublished ||
                                            updateMutation.isPending ||
                                            settingsPending
                                        }
                                        onCheckedChange={(checked) =>
                                            updateMutation.mutate({
                                                contestId,
                                                data: { show_team_submissions: checked },
                                            })
                                        }
                                    />
                                </div>
                                {!isPublished && (
                                    <p className="px-1 text-xs text-muted-foreground">
                                        Publish results to unlock the visibility controls.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div id="standings" className="scroll-mt-24">
                    <ResultsTeamsClient contestId={contestId} contestMode={contest?.contest_mode} />
                </div>
            </div>
        </AsyncStateHandler>
    );
}

function formatDateTime(value?: string | null) {
    if (!value) return "Not set";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function formatDuration(seconds?: number | null) {
    if (!seconds) return "Not set";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return (
        [hours > 0 && `${hours}h`, minutes > 0 && `${minutes}m`].filter(Boolean).join(" ") || "< 1m"
    );
}

function TimeCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof Clock3;
    label: string;
    value: string;
    tone: "sky" | "rose" | "amber";
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-2.5">
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    tone === "sky" && "bg-sky-500/10 text-sky-700 dark:text-sky-300",
                    tone === "rose" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
                    tone === "amber" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                )}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="truncate text-xs font-semibold">{value}</p>
            </div>
        </div>
    );
}

type MetricTone = "primary" | "danger" | "success";

function MetricCard({
    icon: Icon,
    label,
    value,
    description,
    tone,
    href,
}: {
    icon: typeof AlertTriangle;
    label: string;
    value: number;
    description: string;
    tone: MetricTone;
    href?: string;
}) {
    const body = (
        <Card className="h-full border-border/60 bg-background/70 shadow-none transition-colors hover:bg-muted/30">
            <CardContent className="flex items-center gap-3 p-3.5">
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        tone === "primary" &&
                            "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
                        tone === "danger" &&
                            "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
                        tone === "success" &&
                            "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium">{label}</p>
                        <p className="text-xl font-bold tracking-tight tabular-nums">
                            {value.toLocaleString()}
                        </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
    return href ? <Link href={href}>{body}</Link> : body;
}

function SettingRow({
    icon: Icon,
    title,
    description,
    checked,
    disabled,
    onCheckedChange,
    highlighted = false,
}: {
    icon: typeof Eye;
    title: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onCheckedChange: (checked: boolean) => void;
    highlighted?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
                highlighted ? "border-primary/20 bg-primary/[0.04]" : "border-border/60",
                disabled && "opacity-60",
            )}
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p>
            </div>
            <Switch
                checked={checked}
                disabled={disabled}
                onCheckedChange={onCheckedChange}
                aria-label={title}
            />
        </div>
    );
}
