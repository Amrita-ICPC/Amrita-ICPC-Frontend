"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import {
    useGetMyContestTeamResultsApiV1StudentsContestsContestIdResultsGet,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
} from "@/api/generated/students/students";
import { Button } from "@/components/ui/button";

import { ResultsNotPublishedGate } from "./results-gate";
import { SubmissionBreakdownChart } from "./submission-breakdown-chart";
import { TeamMembersTable } from "./team-members-table";
import { TeamSummaryCard } from "./team-summary-card";

interface ResultsOverviewClientProps {
    contestId: string;
}

export function ResultsOverviewClient({ contestId }: ResultsOverviewClientProps) {
    const { data: contestData, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestData?.data;
    const resultsPublished = Boolean(contest?.results_published_at);

    const { data: teamData, isLoading: isTeamLoading } =
        useGetMyContestTeamResultsApiV1StudentsContestsContestIdResultsGet(contestId, {
            query: { enabled: resultsPublished },
        });

    if (isContestLoading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Results</h1>
                    <p className="text-sm text-muted-foreground">{contest?.name}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold">
                    <Link href={`/student/contest/${contestId}`}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to contest
                    </Link>
                </Button>
            </div>

            {!resultsPublished ? (
                <ResultsNotPublishedGate />
            ) : isTeamLoading || !teamData?.data ? (
                <div className="flex min-h-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <TeamSummaryCard analytics={teamData.data} />
                        <SubmissionBreakdownChart analytics={teamData.data} />
                    </div>

                    <TeamMembersTable
                        contestId={contestId}
                        members={teamData.data.members ?? []}
                        canViewSubmissions={Boolean(contest?.show_team_submissions)}
                    />
                </div>
            )}
        </div>
    );
}
