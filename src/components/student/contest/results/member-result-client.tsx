"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
    useGetContestTeamMemberQuestionAnalyticsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdQuestionsGet,
    useGetContestTeamMemberResultsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdGet,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
} from "@/api/generated/students/students";
import { Button } from "@/components/ui/button";

import { MemberQuestionReview } from "./member-question-review";
import { MemberResultHero } from "./member-result-hero";
import { ResultsNotPublishedGate, SubmissionsHiddenGate } from "./results-gate";

interface MemberResultClientProps {
    contestId: string;
    memberId: string;
}

export function MemberResultClient({ contestId, memberId }: MemberResultClientProps) {
    const { data: contestData, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestData?.data;
    const resultsPublished = Boolean(contest?.results_published_at);
    const canViewSubmissions = resultsPublished && Boolean(contest?.show_team_submissions);

    const { data: memberData, isLoading: isMemberLoading } =
        useGetContestTeamMemberResultsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdGet(
            contestId,
            memberId,
            { query: { enabled: canViewSubmissions } },
        );

    const { data: questionsData, isLoading: isQuestionsLoading } =
        useGetContestTeamMemberQuestionAnalyticsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdQuestionsGet(
            contestId,
            memberId,
            { query: { enabled: canViewSubmissions } },
        );
    const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);

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
                    <h1 className="text-xl font-bold tracking-tight">Member Results</h1>
                    <p className="text-sm text-muted-foreground">{contest?.name}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold">
                    <Link href={`/student/contest/${contestId}/results`}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to results
                    </Link>
                </Button>
            </div>

            {!resultsPublished ? (
                <ResultsNotPublishedGate />
            ) : !contest?.show_team_submissions ? (
                <SubmissionsHiddenGate />
            ) : isMemberLoading || isQuestionsLoading || !memberData?.data ? (
                <div className="flex min-h-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    <MemberResultHero member={memberData.data} />
                    <MemberQuestionReview
                        contestId={contestId}
                        contestTeamMemberId={memberId}
                        questions={questionsData?.data ?? []}
                        selectedQuestionId={selectedQuestionId}
                        onSelectQuestion={setSelectedQuestionId}
                    />
                </div>
            )}
        </div>
    );
}
