"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import type { ContestTeamMemberDetail } from "@/api/generated/model/contestTeamMemberDetail";
import {
    useGetContestTeamMemberQuestionAnalyticsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdQuestionsGet,
    useGetContestTeamMemberResultsApiV1StudentsContestsContestIdResultsMembersContestTeamMemberIdGet,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
} from "@/api/generated/students/students";
import { MemberVerdictAnalytics } from "@/components/contest/team-member-analytics/member-detail-hero";
import { Badge } from "@/components/ui/badge";

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

                    <MemberVerdictAnalytics
                        member={memberData.data as unknown as ContestTeamMemberDetail}
                    />

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="font-semibold text-foreground">Responses</h2>
                                <p className="text-sm text-muted-foreground">
                                    Navigate questions, expand submissions, and inspect testcase
                                    evidence.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="border-transparent bg-background text-foreground">
                                    {questionsData?.data?.length ?? 0} questions
                                </Badge>
                            </div>
                        </div>
                    </div>

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
