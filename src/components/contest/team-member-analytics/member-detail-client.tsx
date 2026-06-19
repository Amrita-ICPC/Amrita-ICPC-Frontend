"use client";

import { AlertCircle, CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import * as React from "react";

import {
    useGetContestTeamMemberDetailApiV1ContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdGet,
    useGetContestTeamMemberQuestionsApiV1ContestsTeamContestTeamIdMembersContestTeamMemberIdQuestionsGet,
} from "@/api/generated/teams/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { MemberDetailHero } from "./member-detail-hero";
import { numberValue } from "./member-detail-utils";
import { MemberQuestionReview } from "./member-question-review";

interface MemberDetailClientProps {
    contestId: string;
    contestTeamId: string;
    contestTeamMemberId: string;
}

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone = "neutral",
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: React.ElementType;
    tone?: "neutral" | "emerald" | "red" | "amber" | "blue";
}) {
    const toneClass = {
        neutral: "border-border/70 bg-card text-foreground",
        emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        red: "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400",
        amber: "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400",
        blue: "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",
    };

    return (
        <Card className={cn("border shadow-sm", toneClass[tone])}>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background/70">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-current">
                        {value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                </div>
            </CardContent>
        </Card>
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
    const {
        data: memberData,
        isLoading: isMemberLoading,
        isError: isMemberError,
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
        refetch: refetchQuestions,
    } = useGetContestTeamMemberQuestionsApiV1ContestsTeamContestTeamIdMembersContestTeamMemberIdQuestionsGet(
        contestTeamId,
        contestTeamMemberId,
    );

    const member = memberData?.data;
    const questions = questionsData?.data ?? [];
    const effectiveSelectedQuestionId = questions.some(
        (question) => question.question_id === selectedQuestionId,
    )
        ? selectedQuestionId
        : (questions[0]?.question_id ?? null);

    if (isMemberLoading || isQuestionsLoading) {
        return <LoadingState />;
    }

    if (isMemberError || isQuestionsError || !member) {
        return (
            <ErrorState
                onRetry={() => {
                    void refetchMember();
                    void refetchQuestions();
                }}
            />
        );
    }

    const submissionStats = member.submission_statistics;
    const questionStats = member.question_statistics;

    return (
        <div className="space-y-6">
            <MemberDetailHero member={member} />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Submissions"
                    value={numberValue(submissionStats?.total)}
                    hint="Across all contest questions"
                    icon={FileText}
                    tone="blue"
                />
                <StatCard
                    label="Accepted"
                    value={numberValue(submissionStats?.accepted)}
                    hint="Accepted submissions"
                    icon={CheckCircle2}
                    tone="emerald"
                />
                <StatCard
                    label="Incorrect"
                    value={numberValue(submissionStats?.wrong_answer)}
                    hint="Wrong answer verdicts"
                    icon={XCircle}
                    tone="red"
                />
                <StatCard
                    label="Pending"
                    value={numberValue(submissionStats?.pending)}
                    hint={`${numberValue(questionStats?.unsolved)} unsolved questions`}
                    icon={Clock3}
                    tone="amber"
                />
            </div>

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
                selectedQuestionId={effectiveSelectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
            />
        </div>
    );
}
