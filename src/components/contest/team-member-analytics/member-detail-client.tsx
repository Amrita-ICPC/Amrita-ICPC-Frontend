"use client";

import { AlertCircle } from "lucide-react";
import * as React from "react";

import {
    useGetContestApiV1ContestsContestIdGet,
    useGetContestQuestionsApiV1ContestsContestIdQuestionsGet,
} from "@/api/generated/contests/contests";
import type { ContestTeamMemberDetail } from "@/api/generated/model/contestTeamMemberDetail";
import {
    useGetContestTeamMemberDetailApiV1ContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdGet,
    useGetContestTeamMemberQuestionsApiV1ContestsTeamContestTeamIdMembersContestTeamMemberIdQuestionsGet,
    useGetTeamMembersApiV1ContestsContestIdTeamsContestTeamIdMembersGet,
} from "@/api/generated/teams/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { MemberDetailHero, MemberVerdictAnalytics } from "./member-detail-hero";
import { numberValue } from "./member-detail-utils";
import { MemberQuestionReview } from "./member-question-review";

interface MemberDetailClientProps {
    contestId: string;
    contestTeamId: string;
    contestTeamMemberId: string;
}

function errorStatus(error: unknown) {
    if (typeof error !== "object" || error === null) return undefined;
    return (
        (error as { response?: { status?: number }; status?: number }).response?.status ??
        (error as { status?: number }).status
    );
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-80 rounded-xl" />
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-28 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-[520px] rounded-xl" />
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-semibold text-destructive">Failed to load member detail</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Refresh the analytics page or try again in a moment.
                    </p>
                </div>
                <Button variant="outline" onClick={onRetry}>
                    Retry
                </Button>
            </CardContent>
        </Card>
    );
}

export function MemberDetailClient({
    contestId,
    contestTeamId,
    contestTeamMemberId,
}: MemberDetailClientProps) {
    const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);
    const contestQuery = useGetContestApiV1ContestsContestIdGet(contestId);
    const marksQuery = useGetContestQuestionsApiV1ContestsContestIdQuestionsGet(contestId, {
        contest_team_member_id: contestTeamMemberId,
        page: 1,
        page_size: 100,
    });
    const {
        data: memberData,
        isLoading: isMemberLoading,
        isError: isMemberError,
        error: memberError,
        refetch: refetchMember,
    } = useGetContestTeamMemberDetailApiV1ContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdGet(
        contestId,
        contestTeamId,
        contestTeamMemberId,
    );
    const {
        data: questionsData,
        isLoading: isQuestionsLoading,
        isError: isQuestionsError,
        error: questionsError,
        refetch: refetchQuestions,
    } = useGetContestTeamMemberQuestionsApiV1ContestsTeamContestTeamIdMembersContestTeamMemberIdQuestionsGet(
        contestTeamId,
        contestTeamMemberId,
    );
    const teamMembersQuery = useGetTeamMembersApiV1ContestsContestIdTeamsContestTeamIdMembersGet(
        contestId,
        contestTeamId,
        { page: 1, page_size: 100 },
    );

    const memberProgressNotFound = isMemberError && errorStatus(memberError) === 404;
    const questionProgressNotFound = isQuestionsError && errorStatus(questionsError) === 404;
    const hasNoProgress = memberProgressNotFound || questionProgressNotFound;
    const fallbackIdentity = teamMembersQuery.data?.data?.find(
        (item) => item.id === contestTeamMemberId || item.user_id === contestTeamMemberId,
    );
    const fallbackMember: ContestTeamMemberDetail | undefined = fallbackIdentity
        ? {
              contest_team_member_id: contestTeamMemberId,
              user_id: fallbackIdentity.user_id,
              name: fallbackIdentity.name,
              email: fallbackIdentity.email,
              is_leader: fallbackIdentity.is_leader,
              is_participated: false,
              score: 0,
              submission_statistics: {},
              question_statistics: {},
          }
        : undefined;
    const member = memberData?.data
        ? questionProgressNotFound
            ? { ...memberData.data, is_participated: false }
            : memberData.data
        : memberProgressNotFound
          ? fallbackMember
          : undefined;
    const questions = hasNoProgress ? [] : (questionsData?.data ?? []);
    const questionMarks = Object.fromEntries(
        (marksQuery.data?.data?.questions ?? []).map((question) => [
            question.id,
            {
                obtainedScore: numberValue(question.obtained_score),
                maxScore: numberValue(question.max_score),
            },
        ]),
    );
    const effectiveSelectedQuestionId = questions.some(
        (question) => question.question_id === selectedQuestionId,
    )
        ? selectedQuestionId
        : (questions[0]?.question_id ?? null);

    if (
        isMemberLoading ||
        isQuestionsLoading ||
        marksQuery.isLoading ||
        (hasNoProgress && teamMembersQuery.isLoading)
    ) {
        return <LoadingState />;
    }

    if (
        (isMemberError && !memberProgressNotFound) ||
        (isQuestionsError && !questionProgressNotFound) ||
        marksQuery.isError ||
        !member
    ) {
        return (
            <ErrorState
                onRetry={() => {
                    void refetchMember();
                    void refetchQuestions();
                    void marksQuery.refetch();
                }}
            />
        );
    }

    const questionStats = member.question_statistics;

    return (
        <div className="space-y-6">
            <MemberDetailHero
                member={member}
                contestId={contestId}
                contestMode={contestQuery.data?.data?.contest_mode}
            />

            {hasNoProgress && (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    This member has not started participating yet. Analytics and responses will
                    appear after their first contest activity.
                </div>
            )}

            <MemberVerdictAnalytics member={member} />

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-semibold text-foreground">Responses</h2>
                        <p className="text-sm text-muted-foreground">
                            Navigate questions, expand submissions, and inspect testcase evidence.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge className="border-transparent bg-background text-foreground">
                            {questions.length} questions
                        </Badge>
                        <Badge className="border-transparent bg-background text-foreground">
                            {numberValue(questionStats?.attempted)} attempted
                        </Badge>
                    </div>
                </div>
            </div>

            <MemberQuestionReview
                contestId={contestId}
                contestTeamId={contestTeamId}
                contestTeamMemberId={contestTeamMemberId}
                questions={questions}
                questionMarks={questionMarks}
                selectedQuestionId={effectiveSelectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
            />
        </div>
    );
}
