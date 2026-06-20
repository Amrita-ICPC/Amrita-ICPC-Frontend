"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { useGetStudentContestByIdApiV1StudentsContestsContestIdGet } from "@/api/generated/students/students";
import { Button } from "@/components/ui/button";

import { LeaderboardHiddenGate, ResultsNotPublishedGate } from "./results-gate";
import { ResultsLeaderboardTable } from "./results-leaderboard-table";

interface LeaderboardClientProps {
    contestId: string;
}

export function LeaderboardClient({ contestId }: LeaderboardClientProps) {
    const { data: contestData, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestData?.data;
    const resultsPublished = Boolean(contest?.results_published_at);
    const leaderboardVisible = resultsPublished && Boolean(contest?.show_leaderboard);

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
                    <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
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
            ) : !contest?.show_leaderboard ? (
                <LeaderboardHiddenGate />
            ) : leaderboardVisible ? (
                <ResultsLeaderboardTable contestId={contestId} />
            ) : null}
        </div>
    );
}
