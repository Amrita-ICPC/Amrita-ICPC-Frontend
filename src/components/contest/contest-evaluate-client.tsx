"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Cpu,
    ExternalLink,
    Loader2,
    Play,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey,
    useEvaluateContestApiV1ContestsContestIdEvaluationPost,
    useGetContestApiV1ContestsContestIdGet,
    useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet,
} from "@/api/generated/contests/contests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

    const handleReset = () => {
        setEvaluationId(null);
        localStorage.removeItem(`contest_evaluation_active_${contestId}`);
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
                {/* Back button */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <Link
                            href={`/contest/${contestId}`}
                            className="flex items-center gap-1.5 text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Contest
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Contest Evaluation
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Re-evaluate all student submissions for{" "}
                        <span className="font-semibold text-foreground">{contest?.name}</span>.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left: Main Control Panel */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border/60 bg-card relative overflow-hidden shadow-sm">
                            {/* Pulse background decoration when active */}
                            {isPollingActive && (
                                <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse pointer-events-none" />
                            )}

                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">
                                        Evaluation Control Center
                                    </CardTitle>
                                    <CardDescription>
                                        Trigger and monitor submission grading
                                    </CardDescription>
                                </div>
                                {/* Status Badge */}
                                <div>
                                    {!evaluationId && (
                                        <Badge
                                            variant="outline"
                                            className="bg-slate-500/10 text-slate-400 border-transparent"
                                        >
                                            Idle
                                        </Badge>
                                    )}
                                    {evaluationId && status === "PENDING" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-500/10 text-amber-500 border-transparent animate-pulse flex items-center gap-1.5"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                            Pending
                                        </Badge>
                                    )}
                                    {evaluationId && status === "RUNNING" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-blue-500/10 text-blue-500 border-transparent flex items-center gap-1.5"
                                        >
                                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                            Running
                                        </Badge>
                                    )}
                                    {evaluationId && status === "COMPLETED" && (
                                        <Badge
                                            variant="outline"
                                            className="bg-emerald-500/10 text-emerald-500 border-transparent flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            Completed
                                        </Badge>
                                    )}
                                    {evaluationId &&
                                        status &&
                                        !["PENDING", "RUNNING", "COMPLETED"].includes(status) && (
                                            <Badge
                                                variant="outline"
                                                className="bg-destructive/10 text-destructive border-transparent flex items-center gap-1.5"
                                            >
                                                <AlertTriangle className="h-3 w-3 text-destructive" />
                                                {status}
                                            </Badge>
                                        )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!evaluationId ? (
                                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-lg border border-dashed border-border/60 bg-muted/10">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                            <Cpu className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">
                                            No active evaluation
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                                            Triggering an evaluation will queue all team submissions
                                            for this contest to be re-run and graded.
                                        </p>
                                        <Button
                                            onClick={handleStartEvaluation}
                                            disabled={evaluateMutation.isPending}
                                            className="px-6 shadow-sm"
                                        >
                                            {evaluateMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Initializing...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Start Evaluation
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Status Message */}
                                        <div className="bg-muted/30 border border-border/40 rounded-lg p-4 flex gap-3.5 items-start">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Cpu className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="text-sm font-semibold text-foreground">
                                                    {status === "PENDING" && "Evaluation Queued"}
                                                    {status === "RUNNING" &&
                                                        "Processing Submissions..."}
                                                    {status === "COMPLETED" &&
                                                        "Grading Finished Successfully"}
                                                    {status &&
                                                        ![
                                                            "PENDING",
                                                            "RUNNING",
                                                            "COMPLETED",
                                                        ].includes(status) &&
                                                        `Status: ${status}`}
                                                </h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {status === "PENDING" &&
                                                        "The evaluation request is in queue and will begin processing shortly."}
                                                    {status === "RUNNING" &&
                                                        "Submissions are being run against the testcases. Live progress updates are displayed below."}
                                                    {status === "COMPLETED" &&
                                                        "All submissions have been rejudged and leaderboard rankings have been updated."}
                                                    {status &&
                                                        ![
                                                            "PENDING",
                                                            "RUNNING",
                                                            "COMPLETED",
                                                        ].includes(status) &&
                                                        "The evaluation completed with an unexpected status."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Metrics */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground font-medium">
                                                    Progress
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {percentVal}% ({processed} / {total})
                                                </span>
                                            </div>
                                            <Progress
                                                value={processed}
                                                max={total || 1}
                                                className="h-2.5"
                                            />
                                        </div>

                                        {/* Metadata Rows */}
                                        <div className="divide-y divide-border/40 border-t border-b border-border/40 py-1 text-sm">
                                            <div className="flex justify-between py-2.5">
                                                <span className="text-muted-foreground">
                                                    Evaluation ID
                                                </span>
                                                <span className="font-mono text-xs text-foreground select-all">
                                                    {evaluationId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2.5">
                                                <span className="text-muted-foreground">
                                                    Current Phase
                                                </span>
                                                <span className="capitalize font-medium text-foreground">
                                                    {status?.toLowerCase() || "fetching..."}
                                                </span>
                                            </div>
                                            {(status === "PENDING" || status === "RUNNING") && (
                                                <div className="flex justify-between py-2.5">
                                                    <span className="text-muted-foreground">
                                                        Time Elapsed
                                                    </span>
                                                    <span className="font-mono text-foreground flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                                                        {formatTime(elapsedSeconds)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <Button
                                                onClick={handleStartEvaluation}
                                                disabled={evaluateMutation.isPending}
                                                variant="outline"
                                                className="shadow-sm"
                                            >
                                                {evaluateMutation.isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                )}
                                                Run New Evaluation
                                            </Button>

                                            {status === "COMPLETED" && (
                                                <Button asChild className="shadow-sm">
                                                    <Link
                                                        href={`/contest/${contestId}/submissions`}
                                                    >
                                                        View Submissions
                                                        <ExternalLink className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}

                                            {/* Dismiss / clear active evaluation view */}
                                            {status === "COMPLETED" && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleReset}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    Clear Screen
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Information / Guidelines Card */}
                    <div className="space-y-6">
                        <Card className="border-border/60 bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">
                                    Important Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground space-y-3.5 leading-relaxed">
                                <p>
                                    <strong className="text-foreground">
                                        What does evaluation do?
                                    </strong>
                                    <br />
                                    Evaluation runs all testcases against the latest submissions
                                    submitted by teams in this contest. This updates scores, run
                                    times, and statuses (AC, WA, TLE, etc.).
                                </p>
                                <p>
                                    <strong className="text-foreground">
                                        When to run evaluation?
                                    </strong>
                                    <br />
                                    Run a manual evaluation if:
                                </p>
                                <ul className="list-disc pl-4 space-y-1.5">
                                    <li>
                                        Testcases or test weights for a question were updated after
                                        submissions were made.
                                    </li>
                                    <li>
                                        Leaderboard scores appear out of sync with actual submission
                                        runs.
                                    </li>
                                    <li>
                                        System failures caused submissions to remain in a
                                        pending/running state.
                                    </li>
                                </ul>
                                <p>
                                    <strong className="text-foreground">System Load Notice</strong>
                                    <br />
                                    Re-evaluating a large contest with many teams and submissions
                                    can consume significant backend computational resources. Try to
                                    run it outside peak contest hours if possible.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AsyncStateHandler>
    );
}
