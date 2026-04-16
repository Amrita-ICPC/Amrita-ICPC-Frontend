"use client";

import { useSubmission, useRejudgeSubmission } from "@/query/use-submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

interface SubmissionDetailProps {
    contestId: string;
    questionId: string;
    submissionId: string | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    runtime_error: "bg-orange-100 text-orange-800",
    time_limit_exceeded: "bg-orange-100 text-orange-800",
    compilation_error: "bg-red-100 text-red-800",
};

export function SubmissionDetail({ contestId, questionId, submissionId }: SubmissionDetailProps) {
    const { data: submission, isLoading } = useSubmission(contestId, questionId, submissionId);
    const { mutate: rejudge, isPending: isRejudging } = useRejudgeSubmission(contestId, questionId);

    if (!submissionId) {
        return null;
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!submission) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-red-600">
                    Submission not found
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle>Submission Details</CardTitle>
                        <CardDescription>
                            Submitted on{" "}
                            {submission.created_at
                                ? new Date(submission.created_at).toLocaleString()
                                : "N/A"}
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => submissionId && rejudge(submissionId)}
                        disabled={isRejudging}
                        className="gap-2"
                    >
                        {isRejudging && <Loader2 className="h-4 w-4 animate-spin" />}
                        <RefreshCw className="h-4 w-4" />
                        Rejudge
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge
                                className={
                                    statusColors[submission.status] || "bg-gray-100 text-gray-800"
                                }
                            >
                                {submission.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Language</p>
                            <p className="font-medium">{submission.language}</p>
                        </div>
                        {submission.score !== undefined && (
                            <div>
                                <p className="text-sm text-gray-600">Score</p>
                                <p className="font-medium">{submission.score}</p>
                            </div>
                        )}
                        {submission.execution_time && (
                            <div>
                                <p className="text-sm text-gray-600">Execution Time</p>
                                <p className="font-medium">{submission.execution_time}ms</p>
                            </div>
                        )}
                        {submission.memory_used && (
                            <div>
                                <p className="text-sm text-gray-600">Memory Used</p>
                                <p className="font-medium">{submission.memory_used}MB</p>
                            </div>
                        )}
                        {submission.user_name && (
                            <div>
                                <p className="text-sm text-gray-600">Submitted By</p>
                                <p className="font-medium">{submission.user_name}</p>
                            </div>
                        )}
                    </div>

                    {submission.error_message && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-900 mb-2">Error</p>
                            <p className="text-sm text-red-800 font-mono whitespace-pre-wrap wrap-break-word">
                                {submission.error_message}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Code</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 border rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap wrap-break-word">
                            {submission.code}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
