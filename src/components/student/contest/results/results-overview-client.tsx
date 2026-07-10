"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ContestMode } from "@/api/generated/model";
import {
    useGetMyContestTeamResultsApiV1StudentsContestsContestIdResultsGet,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
} from "@/api/generated/students/students";

import { ResultsNotPublishedGate } from "./results-gate";
import { TeamMembersTable } from "./team-members-table";
import { TeamSummaryCard } from "./team-summary-card";

interface ResultsOverviewClientProps {
    contestId: string;
}

export function ResultsOverviewClient({ contestId }: ResultsOverviewClientProps) {
    const router = useRouter();
    const { data: contestData, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestData?.data;
    const resultsPublished = Boolean(contest?.results_published_at);

    const { data: teamData, isLoading: isTeamLoading } =
        useGetMyContestTeamResultsApiV1StudentsContestsContestIdResultsGet(contestId, {
            query: { enabled: resultsPublished },
        });
    const individualMemberId =
        contest?.contest_mode === ContestMode.individual
            ? teamData?.data?.members?.[0]?.contest_team_member_id
            : undefined;

    useEffect(() => {
        if (!individualMemberId) return;

        router.replace(`/student/contest/${contestId}/results/members/${individualMemberId}`);
    }, [contestId, individualMemberId, router]);

    if (isContestLoading || individualMemberId) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!resultsPublished ? (
                <ResultsNotPublishedGate />
            ) : isTeamLoading || !teamData?.data ? (
                <div className="flex min-h-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <TeamSummaryCard analytics={teamData.data} />

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
