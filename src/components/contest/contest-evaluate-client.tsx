"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Cpu, Loader2, Play, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
    getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey,
    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey,
    useEvaluateContestApiV1ContestsContestIdEvaluationPost,
    useGetContestApiV1ContestsContestIdGet,
    useGetContestLeaderboardApiV1ContestsContestIdLeaderboardGet,
    useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet,
} from "@/api/generated/contests/contests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { AsyncStateHandler } from "../shared/async-state-handler";

interface ContestEvaluateClientProps {
    contestId: string;
}

export function ContestEvaluateClient({ contestId }: ContestEvaluateClientProps) {
    const queryClient = useQueryClient();
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
    const {
        data: leaderboardData,
        isLoading: isLeaderboardLoading,
        refetch: refetchLeaderboard,
    } = useGetContestLeaderboardApiV1ContestsContestIdLeaderboardGet(contestId);

    // Invalidate and refetch leaderboard when evaluation finishes successfully
    useEffect(() => {
        if (status === "COMPLETED") {
            void queryClient.invalidateQueries({
                queryKey:
                    getGetContestLeaderboardApiV1ContestsContestIdLeaderboardGetQueryKey(contestId),
            });
        }
    }, [status, contestId, queryClient]);

    // Extract list of questions from standings to build table columns dynamically
    const questionsList = useMemo(() => {
        if (!leaderboardData?.data?.standings?.length) return [];
        return leaderboardData.data.standings[0].question_details || [];
    }, [leaderboardData]);

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
                        <div className="flex flex-row items-center gap-3 shrink-0 self-start md:self-auto">
                            {!evaluationId ? (
                                <Button
                                    onClick={handleStartEvaluation}
                                    disabled={evaluateMutation.isPending}
                                    className="px-5 shadow-sm font-semibold h-9"
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
                                    className="shadow-sm font-semibold h-9"
                                >
                                    {evaluateMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Run New Evaluation
                                </Button>
                            )}
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
                                onClick={() => refetchLeaderboard()}
                                disabled={isLeaderboardLoading}
                                className="h-8 gap-1.5"
                            >
                                <RefreshCw
                                    className={cn(
                                        "h-3.5 w-3.5",
                                        isLeaderboardLoading && "animate-spin",
                                    )}
                                />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/20 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                            <th className="py-3 px-4 text-center w-14">Rank</th>
                                            <th className="py-3 px-4 min-w-[200px]">Team Name</th>
                                            <th className="py-3 px-4 text-center w-20">Solved</th>
                                            <th className="py-3 px-4 text-center w-28">
                                                Penalty (m)
                                            </th>
                                            {questionsList.map((q, idx) => (
                                                <th
                                                    key={q.question_id}
                                                    className="py-3 px-2 text-center min-w-[70px] max-w-[100px]"
                                                    title={q.question_title}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-mono text-sm text-foreground">
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        <span className="text-[9px] font-medium text-muted-foreground truncate max-w-[80px]">
                                                            {q.question_title}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
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
                                                    {row.team_name}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex h-7 px-2.5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                        {row.total_score}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                                                    {Math.floor((row.total_penalty || 0) / 60)}
                                                </td>
                                                {questionsList.map((q) => {
                                                    const detail = row.question_details?.find(
                                                        (qd) => qd.question_id === q.question_id,
                                                    );
                                                    if (!detail) {
                                                        return (
                                                            <td
                                                                key={q.question_id}
                                                                className="py-3 px-2 text-center"
                                                            >
                                                                <div className="flex items-center justify-center rounded border border-dashed border-border/40 h-10 w-12 mx-auto text-muted-foreground/30">
                                                                    <span className="text-xs">
                                                                        -
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    if (detail.is_solved) {
                                                        return (
                                                            <td
                                                                key={q.question_id}
                                                                className="py-3 px-2 text-center"
                                                            >
                                                                <div className="flex flex-col items-center justify-center rounded bg-success/10 border border-success/20 text-success h-10 w-12 mx-auto">
                                                                    <span className="text-xs font-bold">
                                                                        +{detail.attempts || 1}
                                                                    </span>
                                                                    {detail.time_taken_seconds !==
                                                                        null &&
                                                                        detail.time_taken_seconds !==
                                                                            undefined && (
                                                                            <span className="text-[9px] opacity-80 font-mono">
                                                                                {Math.floor(
                                                                                    detail.time_taken_seconds /
                                                                                        60,
                                                                                )}
                                                                                m
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    if (detail.attempts && detail.attempts > 0) {
                                                        return (
                                                            <td
                                                                key={q.question_id}
                                                                className="py-3 px-2 text-center"
                                                            >
                                                                <div className="flex flex-col items-center justify-center rounded bg-destructive/10 border border-destructive/20 text-destructive h-10 w-12 mx-auto">
                                                                    <span className="text-xs font-bold">
                                                                        -{detail.attempts}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    return (
                                                        <td
                                                            key={q.question_id}
                                                            className="py-3 px-2 text-center"
                                                        >
                                                            <div className="flex items-center justify-center rounded border border-dashed border-border/40 h-10 w-12 mx-auto text-muted-foreground/30">
                                                                <span className="text-xs">-</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AsyncStateHandler>
    );
}
