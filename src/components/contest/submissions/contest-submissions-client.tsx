"use client";

import { AlertCircle, Send } from "lucide-react";

import { useGetContestDashboardApiV1ContestsContestIdDashboardGet } from "@/api/generated/contests/contests";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ContestAnalyticsChart } from "./contest-analytics-chart";
import { ProblemHealthCard } from "./problem-health-card";
import { RecentSubmissionsCard } from "./recent-submissions-card";
import { TeamPerformanceCard } from "./team-performance-card";

interface ContestSubmissionsClientProps {
    contestId: string;
}

function SubmissionsDashboardSkeleton() {
    return (
        <div className="flex flex-col space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[400px] bg-muted/50 rounded-xl" />
                <div className="lg:col-span-1 h-[400px] bg-muted/50 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[400px] bg-muted/50 rounded-xl" />
                <div className="h-[400px] bg-muted/50 rounded-xl" />
            </div>
        </div>
    );
}

export function ContestSubmissionsClient({ contestId }: ContestSubmissionsClientProps) {
    const { data, isLoading, isError, error, refetch } =
        useGetContestDashboardApiV1ContestsContestIdDashboardGet(contestId);

    if (isLoading) {
        return <SubmissionsDashboardSkeleton />;
    }

    if (isError || !data?.data) {
        return (
            <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/5 text-destructive"
            >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Dashboard</AlertTitle>
                <AlertDescription className="mt-2 flex items-center justify-between">
                    <span>
                        {error instanceof Error
                            ? error.message
                            : "Failed to load contest dashboard metrics."}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    >
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    const dashboard = data.data;

    return (
        <div className="flex flex-col space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Contest Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Monitor real-time analytics, team performances, and problem health.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentSubmissionsCard
                        submissions={dashboard.recent_submissions}
                        contestId={contestId}
                    />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <ContestAnalyticsChart analytics={dashboard.contest_analytics} />

                    <Card className="border-border/60 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Submissions
                            </CardTitle>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Send className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {dashboard.contest_analytics.total_submissions.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all active problems and teams
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <TeamPerformanceCard
                        teamPerformance={dashboard.team_performance}
                        contestId={contestId}
                    />
                </div>
                <div>
                    <ProblemHealthCard problems={dashboard.problem_health} contestId={contestId} />
                </div>
            </div>
        </div>
    );
}
