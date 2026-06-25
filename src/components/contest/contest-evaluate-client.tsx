"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    BarChart3,
    Calculator,
    CheckCircle2,
    Cpu,
    Loader2,
    Play,
    RefreshCw,
    Search,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    getGetContestApiV1ContestsContestIdGetQueryKey,
    getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey,
    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey,
    useComputeTeamScoresApiV1ContestsContestIdScoresPost,
    useEvaluateContestApiV1ContestsContestIdEvaluationPost,
    useGetContestApiV1ContestsContestIdGet,
    useGetContestLeaderboardApiV1ContestsContestIdLeaderboardGet,
    useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet,
    usePublishResultsApiV1ContestsContestIdPublishResultsPost,
    useUpdateContestApiV1ContestsContestIdPatch,
} from "@/api/generated/contests/contests";
import { AppPagination } from "@/components/shared/app-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { AsyncStateHandler } from "../shared/async-state-handler";

interface ContestEvaluateClientProps {
    contestId: string;
}

export function ContestEvaluateClient({ contestId }: ContestEvaluateClientProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const searchParam = searchParams.get("search") || "";
    const sortParam = searchParams.get("sort") || "desc";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = 50;

    const [searchTerm, setSearchTerm] = useState(searchParam);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Sync search input with URL search params when debounced search changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const currentSearch = searchParams.get("search") || "";

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        if (currentSearch !== debouncedSearch) {
            params.set("page", "1");
        }

        const newQueryString = params.toString();
        if (newQueryString !== searchParams.toString()) {
            router.replace(`${pathname}?${newQueryString}`);
        }
    }, [debouncedSearch, pathname, router, searchParams]);

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(newPage));
        router.replace(`${pathname}?${params.toString()}`);
    };

    const [evaluationId, setEvaluationId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(`contest_evaluation_active_${contestId}`);
        }
        return null;
    });
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Fetch contest detail for name and basic context
    const {
        data: contestData,
        isLoading: isContestLoading,
        isError: isContestError,
        error: contestError,
        refetch: refetchContest,
    } = useGetContestApiV1ContestsContestIdGet(contestId);
    const contest = contestData?.data;

    // Query active evaluation status
    const { data: statusData, refetch: refetchStatus } =
        useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet(contestId);

    const status = statusData?.data?.status; // PENDING, RUNNING, COMPLETED
    const processed = statusData?.data?.processed_submissions ?? 0;
    const total = statusData?.data?.total_submissions ?? 0;

    const isPollingActive =
        !!evaluationId && (!statusData || status === "PENDING" || status === "RUNNING");

    // Fetch contest leaderboard standings
    const { data: leaderboardData, isLoading: isLeaderboardLoading } =
        useGetContestLeaderboardApiV1ContestsContestIdLeaderboardGet(contestId, {
            search: searchParam || undefined,
            sort_order: sortParam,
            page: pageParam,
            page_size: pageSizeParam,
        });

    const pagination = leaderboardData?.pagination;
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    // Invalidate and refetch leaderboard when evaluation finishes successfully
    useEffect(() => {
        if (status === "COMPLETED") {
            void queryClient.invalidateQueries({
                queryKey:
                    getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey(contestId),
            });
        }
    }, [status, contestId, queryClient]);

    // Poll status using standard React useEffect with interval if active
    useEffect(() => {
        if (!isPollingActive) return;

        const interval = setInterval(() => {
            refetchStatus();
        }, 2000);

        return () => clearInterval(interval);
    }, [isPollingActive, refetchStatus]);

    // Timer for elapsed seconds
    useEffect(() => {
        if (status !== "PENDING" && status !== "RUNNING") {
            return;
        }

        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    // POST Mutation to trigger evaluation
    const evaluateMutation = useEvaluateContestApiV1ContestsContestIdEvaluationPost({
        mutation: {
            onSuccess: (res) => {
                const evalResponse = res.data;
                if (evalResponse?.id) {
                    setEvaluationId(evalResponse.id);
                    localStorage.setItem(`contest_evaluation_active_${contestId}`, evalResponse.id);
                    toast.success("Evaluation process started!");

                    // Immediately update local query state to pending to trigger polling and loader UI
                    queryClient.setQueryData(
                        getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey(
                            contestId,
                        ),
                        {
                            data: {
                                id: evalResponse.id,
                                contest_id: contestId,
                                status: "PENDING",
                                total_submissions: 0,
                                processed_submissions: 0,
                            },
                        },
                    );

                    // Force invalidation of the evaluation status query to poll the backend
                    void queryClient.invalidateQueries({
                        queryKey:
                            getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey(
                                contestId,
                            ),
                    });

                    // Force invalidation of the leaderboard standings query
                    void queryClient.invalidateQueries({
                        queryKey:
                            getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey(
                                contestId,
                            ),
                    });
                } else {
                    toast.error("Failed to start evaluation: Invalid API response");
                }
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message || err?.message || "Failed to start evaluation";
                toast.error(msg);
            },
        },
    });

    const handleStartEvaluation = () => {
        setElapsedSeconds(0);
        evaluateMutation.mutate({ contestId });
    };

    const computeScoresMutation = useComputeTeamScoresApiV1ContestsContestIdScoresPost({
        mutation: {
            onSuccess: () => {
                toast.success("Team scores computed successfully!");
                void queryClient.invalidateQueries({
                    queryKey:
                        getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey(
                            contestId,
                        ),
                });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message || err?.message || "Failed to compute scores";
                toast.error(msg);
            },
        },
    });

    const handleComputeScores = () => {
        computeScoresMutation.mutate({ contestId });
    };

    const publishResultsMutation = usePublishResultsApiV1ContestsContestIdPublishResultsPost({
        mutation: {
            onSuccess: (res, variables) => {
                const isPublished = variables.params.publish;
                toast.success(
                    isPublished
                        ? "Results published successfully!"
                        : "Results unpublished successfully!",
                );
                void queryClient.invalidateQueries({
                    queryKey: getGetContestApiV1ContestsContestIdGetQueryKey(contestId),
                });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update publication status";
                toast.error(msg);
            },
        },
    });

    const updateContestMutation = useUpdateContestApiV1ContestsContestIdPatch({
        mutation: {
            onSuccess: () => {
                toast.success("Contest settings updated successfully!");
                void queryClient.invalidateQueries({
                    queryKey: getGetContestApiV1ContestsContestIdGetQueryKey(contestId),
                });
            },
            onError: (err: any) => {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update contest settings";
                toast.error(msg);
            },
        },
    });

    const handlePublishResultsToggle = (publish: boolean) => {
        publishResultsMutation.mutate({
            contestId,
            params: { publish },
        });
    };

    const handleSettingChange = (
        field: "show_leaderboard" | "show_team_submissions",
        value: boolean,
    ) => {
        updateContestMutation.mutate({
            contestId,
            data: {
                [field]: value,
            },
        });
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const percentVal = total > 0 ? Math.round((processed / total) * 100) : 0;

    return (
        <AsyncStateHandler
            isLoading={isContestLoading}
            isError={isContestError || (!isContestLoading && !contest)}
            error={contestError}
            onRetry={refetchContest}
            errorTitle="Contest Not Found"
        >
            <div className="space-y-6">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-6 md:p-8 shadow-sm">
                    {/* Pulsing overlay when evaluation is active */}
                    {isPollingActive && (
                        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse pointer-events-none" />
                    )}

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
                        {/* Left side: Status and Info */}
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    {isPollingActive ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    ) : (
                                        <Cpu className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                                        {contest?.name || "Contest Evaluation"}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Contest Evaluation Dashboard
                                    </p>
                                </div>
                            </div>

                            {/* Status and Progress Description */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Status:
                                    </span>
                                    {!evaluationId && (
                                        <Badge
                                            variant="outline"
                                            className="bg-muted/10 text-muted-foreground border-transparent font-bold text-[10px]"
                                        >
                                            IDLE
                                        </Badge>
                                    )}
                                    {evaluationId && status === "PENDING" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-warning/10 text-warning border-transparent animate-pulse flex items-center gap-1 font-bold text-[10px]"
                                        >
                                            <span className="h-1 w-1 rounded-full bg-warning animate-ping" />
                                            QUEUED
                                        </Badge>
                                    )}
                                    {evaluationId && status === "RUNNING" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-info/10 text-info border-transparent flex items-center gap-1 font-bold text-[10px]"
                                        >
                                            <Loader2 className="h-2.5 w-2.5 animate-spin text-info" />
                                            RUNNING
                                        </Badge>
                                    )}
                                    {evaluationId && status === "COMPLETED" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-success/10 text-success border-transparent flex items-center gap-1 font-bold text-[10px]"
                                        >
                                            <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                                            COMPLETED
                                        </Badge>
                                    )}
                                    {evaluationId &&
                                        status &&
                                        !["PENDING", "RUNNING", "COMPLETED"].includes(status) && (
                                            <Badge
                                                variant="outline"
                                                className="bg-destructive/10 text-destructive border-transparent flex items-center gap-1 font-bold text-[10px]"
                                            >
                                                <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                                                ERROR: {status}
                                            </Badge>
                                        )}

                                    {/* Elapsed Time if active */}
                                    {isPollingActive && (
                                        <span className="text-xs font-mono text-muted-foreground ml-2 flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                                            Elapsed: {formatTime(elapsedSeconds)}
                                        </span>
                                    )}
                                </div>

                                {/* Dynamic Text Info */}
                                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                                    {!evaluationId &&
                                        "Ready to start a contest evaluation run. This will queue all team submissions to be evaluated against the current testcases."}
                                    {evaluationId &&
                                        status === "PENDING" &&
                                        "The evaluation request is in queue. Submissions will start grading shortly."}
                                    {evaluationId &&
                                        status === "RUNNING" &&
                                        "Grading submissions in real-time. View evaluation metrics and live standings update below."}
                                    {evaluationId &&
                                        status === "COMPLETED" &&
                                        "All student submissions have been successfully graded. Leaderboard standings and analytics are updated."}
                                    {evaluationId &&
                                        status &&
                                        !["PENDING", "RUNNING", "COMPLETED"].includes(status) &&
                                        "The evaluation failed or finished with an unexpected result."}
                                </p>
                            </div>

                            {/* Live Progress Bar if active/completed */}
                            {evaluationId && (
                                <div className="space-y-1.5 max-w-md pt-1">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">
                                            Evaluation Progress
                                        </span>
                                        <span className="text-foreground font-bold">
                                            {percentVal}% ({processed} / {total})
                                        </span>
                                    </div>
                                    <Progress value={processed} max={total || 1} className="h-2" />
                                </div>
                            )}
                        </div>

                        {/* Right side: Action Controls */}
                        <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 self-start md:self-auto min-w-[200px]">
                            {!evaluationId ? (
                                <Button
                                    onClick={handleStartEvaluation}
                                    disabled={evaluateMutation.isPending}
                                    className="px-5 shadow-sm font-semibold h-9 w-full sm:w-auto justify-center"
                                >
                                    {evaluateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4 fill-current" />
                                            Start Evaluation
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStartEvaluation}
                                    disabled={evaluateMutation.isPending}
                                    variant="outline"
                                    className="shadow-sm font-semibold h-9 w-full sm:w-auto justify-center"
                                >
                                    {evaluateMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Run New Evaluation
                                </Button>
                            )}

                            <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-card p-4 w-full sm:w-[220px]">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                        Results Publication
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold">Status:</span>
                                        {contest?.results_published_at ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-emerald-500/10 text-emerald-500 border-transparent font-bold text-[9px] px-1.5 py-0"
                                            >
                                                PUBLISHED
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="bg-amber-500/10 text-amber-500 border-transparent font-bold text-[9px] px-1.5 py-0"
                                            >
                                                DRAFT
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {contest?.results_published_at ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePublishResultsToggle(false)}
                                        disabled={
                                            publishResultsMutation.isPending || isContestLoading
                                        }
                                        className="w-full justify-center h-8 font-semibold text-xs border-destructive/25 text-destructive hover:bg-destructive/10"
                                    >
                                        {publishResultsMutation.isPending && (
                                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                        )}
                                        Unpublish Results
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handlePublishResultsToggle(true)}
                                        disabled={
                                            publishResultsMutation.isPending || isContestLoading
                                        }
                                        className="w-full justify-center h-8 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {publishResultsMutation.isPending && (
                                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                        )}
                                        Publish Results
                                    </Button>
                                )}

                                <div className="border-t border-border/40 pt-2.5 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <label
                                            htmlFor="show-leaderboard"
                                            className="text-[11px] font-semibold text-muted-foreground cursor-pointer select-none"
                                        >
                                            Show Leaderboard
                                        </label>
                                        <Switch
                                            id="show-leaderboard"
                                            checked={!!contest?.show_leaderboard}
                                            onCheckedChange={(checked) =>
                                                handleSettingChange("show_leaderboard", checked)
                                            }
                                            disabled={
                                                updateContestMutation.isPending || isContestLoading
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <label
                                            htmlFor="show-submissions"
                                            className="text-[11px] font-semibold text-muted-foreground cursor-pointer select-none"
                                        >
                                            Show Submissions
                                        </label>
                                        <Switch
                                            id="show-submissions"
                                            checked={!!contest?.show_team_submissions}
                                            onCheckedChange={(checked) =>
                                                handleSettingChange(
                                                    "show_team_submissions",
                                                    checked,
                                                )
                                            }
                                            disabled={
                                                updateContestMutation.isPending || isContestLoading
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <Card className="border-border/60 bg-card shadow-sm overflow-hidden mt-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Standings & Leaderboard
                            </CardTitle>
                            <CardDescription>
                                Live standings ordered by rank, score, and penalty
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {leaderboardData?.data?.last_updated_at && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    Last calculated:{" "}
                                    {new Date(
                                        leaderboardData.data.last_updated_at,
                                    ).toLocaleTimeString()}
                                </span>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleComputeScores}
                                disabled={computeScoresMutation.isPending || isLeaderboardLoading}
                                className="h-8 gap-1.5"
                            >
                                {computeScoresMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Calculator className="h-3.5 w-3.5" />
                                )}
                                Compute Scores
                            </Button>
                        </div>
                    </CardHeader>
                    <div className="flex flex-col gap-3 px-6 py-3 border-b border-border/40 sm:flex-row sm:items-center sm:justify-between bg-muted/5">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search teams..."
                                className="pl-8 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={sortParam} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Sort Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Highest Score</SelectItem>
                                    <SelectItem value="asc">Lowest Score</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {isLeaderboardLoading && !leaderboardData ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
                                    Loading Standings...
                                </span>
                            </div>
                        ) : !leaderboardData?.data?.standings?.length ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground text-center">
                                <Trophy className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <span className="font-semibold text-sm">
                                    No standings available yet
                                </span>
                                <p className="text-xs text-muted-foreground/85 max-w-sm">
                                    Participating teams and their submissions will appear here once
                                    the contest begins.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/20 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                                <th className="py-3 px-4 text-center w-14">Rank</th>
                                                <th className="py-3 px-4 min-w-[200px]">
                                                    Team Name
                                                </th>
                                                <th className="py-3 px-4 text-center w-20">
                                                    Solved
                                                </th>
                                                <th className="py-3 px-4 text-center w-28">
                                                    Penalty (m)
                                                </th>
                                                {contest?.results_published_at !== null &&
                                                    contest?.results_published_at !== undefined && (
                                                        <th className="py-3 px-4 text-center w-28">
                                                            Result
                                                        </th>
                                                    )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {leaderboardData.data.standings.map((row) => (
                                                <tr
                                                    key={row.team_id}
                                                    className="group hover:bg-muted/30 transition-colors align-middle"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div
                                                            className={cn(
                                                                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto border",
                                                                row.rank === 1 &&
                                                                    "border-amber-400 bg-amber-500/10 text-amber-500 dark:text-amber-450 shadow-sm",
                                                                row.rank === 2 &&
                                                                    "border-slate-350 bg-slate-350/10 text-slate-500 dark:text-slate-400 shadow-sm",
                                                                row.rank === 3 &&
                                                                    "border-orange-400 bg-orange-500/10 text-orange-500 dark:text-orange-450 shadow-sm",
                                                                row.rank > 3 &&
                                                                    "border-border bg-muted/40 text-muted-foreground",
                                                            )}
                                                        >
                                                            {row.rank}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-sm text-foreground">
                                                        <Link
                                                            href={`/contest/${contestId}/evaluate/${row.team_id}`}
                                                            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                                                        >
                                                            <BarChart3 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                                                            {row.team_name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex h-7 px-2.5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {row.total_score}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                                                        {Math.floor((row.total_penalty || 0) / 60)}
                                                    </td>
                                                    {contest?.results_published_at !== null &&
                                                        contest?.results_published_at !==
                                                            undefined && (
                                                            <td className="py-3 px-4 text-center">
                                                                <Button
                                                                    asChild
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 shadow-sm font-semibold"
                                                                >
                                                                    <Link
                                                                        href={`/contest/${contestId}/evaluate/${row.team_id}`}
                                                                    >
                                                                        Result
                                                                    </Link>
                                                                </Button>
                                                            </td>
                                                        )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {pagination && pagination.total_pages > 1 && (
                                    <div className="border-t border-border/40 p-4 flex justify-end">
                                        <AppPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            hasPrevious={pagination.has_previous ?? false}
                                            hasNext={pagination.has_next ?? false}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AsyncStateHandler>
    );
}
