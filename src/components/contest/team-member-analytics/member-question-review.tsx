"use client";

import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import * as React from "react";

import type { ContestTeamMemberQuestionAnalytics } from "@/api/generated/model/contestTeamMemberQuestionAnalytics";
import type { ContestTeamMemberQuestionSubmissionItem } from "@/api/generated/model/contestTeamMemberQuestionSubmissionItem";
import { useGetSubmissionDetailApiV1SubmissionsSubmissionIdGet } from "@/api/generated/submissions/submissions";
import { useGetContestTeamMemberQuestionSubmissionsApiV1ContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdQuestionsQuestionIdSubmissionsGet } from "@/api/generated/teams/teams";
import {
    MetricTile,
    SourceCodeViewer,
    TestCaseViewer,
} from "@/components/contest/shared/submission-viewers";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
    difficultyTone,
    formatDateTime,
    formatMemory,
    formatRuntime,
    numberValue,
    statusLabel,
    statusTone,
} from "./member-detail-utils";

interface MemberQuestionReviewProps {
    contestId: string;
    contestTeamId: string;
    contestTeamMemberId: string;
    questions: ContestTeamMemberQuestionAnalytics[];
    selectedQuestionId: string | null;
    onSelectQuestion: (questionId: string) => void;
}

function questionStatus(question: ContestTeamMemberQuestionAnalytics) {
    if (numberValue(question.accepted_submission) > 0) return "Solved";
    if (numberValue(question.total_submission) > 0) return "Attempted";
    return "Unattempted";
}

function QuestionNavigator({
    questions,
    selectedQuestionId,
    onSelectQuestion,
}: {
    questions: ContestTeamMemberQuestionAnalytics[];
    selectedQuestionId: string | null;
    onSelectQuestion: (questionId: string) => void;
}) {
    return (
        <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Questions</CardTitle>
                <CardDescription>Select a question to inspect responses.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3">
                <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-3 lg:grid lg:max-h-[680px] lg:grid-cols-1 lg:pb-0">
                        {questions.map((question, index) => {
                            const active = question.question_id === selectedQuestionId;
                            const status = questionStatus(question);

                            return (
                                <Button
                                    key={question.question_id}
                                    variant="ghost"
                                    className={cn(
                                        "h-auto min-w-56 justify-start rounded-lg border border-border/60 p-3 text-left lg:min-w-0",
                                        active && "border-primary/30 bg-primary/10 text-primary",
                                    )}
                                    onClick={() => onSelectQuestion(question.question_id)}
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-bold",
                                                active
                                                    ? "border-primary/30 bg-background text-primary"
                                                    : "border-border bg-muted/40 text-muted-foreground",
                                            )}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {question.title}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{status}</span>
                                                <span>
                                                    {numberValue(question.total_submission)}{" "}
                                                    submissions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function QuestionSummary({
    question,
    total,
    accepted,
}: {
    question: ContestTeamMemberQuestionAnalytics;
    total: number;
    accepted: number;
}) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={difficultyTone(question.difficulty)}>
                            {question.difficulty}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="border-transparent bg-muted text-muted-foreground"
                        >
                            {question.time_limit_ms} ms
                        </Badge>
                        <Badge
                            variant="outline"
                            className="border-transparent bg-muted text-muted-foreground"
                        >
                            {question.memory_limit_mb} MB
                        </Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight">{question.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review submissions, source code, and testcase results for this question.
                    </p>
                </div>
                <div className="grid min-w-64 grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/70 bg-background p-3">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                            Submissions
                        </p>
                        <p className="mt-1 text-2xl font-bold tabular-nums">{total}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                            Accepted
                        </p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                            {accepted}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmissionCard({
    submission,
    expanded,
    onToggle,
}: {
    submission: ContestTeamMemberQuestionSubmissionItem;
    expanded: boolean;
    onToggle: () => void;
}) {
    const [testcasesOpen, setTestcasesOpen] = React.useState(false);
    const { data, isLoading, isError } = useGetSubmissionDetailApiV1SubmissionsSubmissionIdGet(
        submission.submission_id,
        { query: { enabled: expanded } },
    );
    const detail = data?.data;

    return (
        <div className="rounded-xl border border-border/70 bg-card shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">Submission</p>
                            <Badge className={statusTone(submission.status)}>
                                {statusLabel(submission.status)}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border-transparent bg-muted text-muted-foreground"
                            >
                                {submission.language}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {formatDateTime(submission.created_at)}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm sm:min-w-72">
                    <div>
                        <p className="text-[11px] uppercase text-muted-foreground">Score</p>
                        <p className="font-bold tabular-nums">{numberValue(submission.score)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase text-muted-foreground">Runtime</p>
                        <p className="font-medium">{formatRuntime(submission.execution_time)}</p>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase text-muted-foreground">Memory</p>
                        <p className="font-medium">{formatMemory(submission.memory)}</p>
                    </div>
                </div>
            </button>

            {expanded ? (
                <div className="border-t border-border/70 p-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : isError || !detail ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            Failed to load submission detail.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-4">
                                <MetricTile
                                    label="Passed"
                                    value={`${numberValue(detail.passed_testcases)} / ${numberValue(detail.total_testcases)}`}
                                />
                                <MetricTile label="Language" value={detail.language.name} />
                                <MetricTile
                                    label="Runtime"
                                    value={formatRuntime(detail.execution_time_ms)}
                                />
                                <MetricTile label="Memory" value={formatMemory(detail.memory_kb)} />
                            </div>

                            <SourceCodeViewer
                                code={detail.source_code}
                                language={detail.language.name}
                            />

                            <Separator />

                            <Button
                                variant="outline"
                                onClick={() => setTestcasesOpen((current) => !current)}
                                className="w-full justify-between"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {testcasesOpen
                                        ? "Hide testcase results"
                                        : "View testcase results"}
                                </span>
                                {testcasesOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            <TestCaseViewer
                                submissionId={submission.submission_id}
                                open={testcasesOpen}
                            />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export function MemberQuestionReview({
    contestId,
    contestTeamId,
    contestTeamMemberId,
    questions,
    selectedQuestionId,
    onSelectQuestion,
}: MemberQuestionReviewProps) {
    const selectedQuestion =
        questions.find((question) => question.question_id === selectedQuestionId) ?? questions[0];
    const [expandedSubmission, setExpandedSubmission] = React.useState<{
        questionId: string;
        submissionId: string;
    } | null>(null);

    const { data, isLoading, isError } =
        useGetContestTeamMemberQuestionSubmissionsApiV1ContestsContestIdTeamsContestTeamIdMembersContestTeamMemberIdQuestionsQuestionIdSubmissionsGet(
            contestId,
            contestTeamId,
            contestTeamMemberId,
            selectedQuestion?.question_id ?? "",
            { query: { enabled: !!selectedQuestion } },
        );

    if (!questions.length) {
        return (
            <Card className="border-border/70">
                <CardContent className="p-0">
                    <EmptyState
                        icon={FileText}
                        title="No question analytics available"
                        description="Question-level activity will appear here after evaluation."
                    />
                </CardContent>
            </Card>
        );
    }

    const questionSubmissionData = data?.data;
    const submissions = questionSubmissionData?.submissions ?? [];
    const total = numberValue(
        questionSubmissionData?.statistics?.total ?? selectedQuestion.total_submission,
    );
    const accepted = numberValue(
        questionSubmissionData?.statistics?.accepted ?? selectedQuestion.accepted_submission,
    );

    return (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <QuestionNavigator
                questions={questions}
                selectedQuestionId={selectedQuestion.question_id}
                onSelectQuestion={onSelectQuestion}
            />

            <Card className="border-border/70 bg-card shadow-sm">
                <CardHeader className="border-b border-border/70">
                    <CardTitle>Responses</CardTitle>
                    <CardDescription>
                        Question response viewer with submissions and testcase evidence.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    <QuestionSummary
                        question={selectedQuestion}
                        total={total}
                        accepted={accepted}
                    />

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-28 rounded-xl" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            Failed to load submissions for this question.
                        </div>
                    ) : submissions.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No submissions for this question"
                            description="Once this member submits a response, it will appear here."
                            compact
                        />
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((submission) => (
                                <SubmissionCard
                                    key={submission.submission_id}
                                    submission={submission}
                                    expanded={
                                        expandedSubmission?.questionId ===
                                            selectedQuestion.question_id &&
                                        expandedSubmission.submissionId === submission.submission_id
                                    }
                                    onToggle={() => {
                                        setExpandedSubmission((current) =>
                                            current?.questionId === selectedQuestion.question_id &&
                                            current.submissionId === submission.submission_id
                                                ? null
                                                : {
                                                      questionId: selectedQuestion.question_id,
                                                      submissionId: submission.submission_id,
                                                  },
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
