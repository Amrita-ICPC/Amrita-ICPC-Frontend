"use client";

import { useState } from "react";
import { useUserSubmissions, useDeleteSubmission } from "@/query/use-submissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Eye, Trash2 } from "lucide-react";

interface SubmissionsListProps {
    contestId: string;
    questionId: string;
    onSelectSubmission?: (submissionId: string) => void;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    runtime_error: "bg-orange-100 text-orange-800",
    time_limit_exceeded: "bg-orange-100 text-orange-800",
    compilation_error: "bg-red-100 text-red-800",
};

export function SubmissionsList({
    contestId,
    questionId,
    onSelectSubmission,
}: SubmissionsListProps) {
    const [page, setPage] = useState(1);
    const [deleteSubmissionId, setDeleteSubmissionId] = useState<string | null>(null);

    const { data, isLoading } = useUserSubmissions(contestId, questionId, page);
    const { mutate: deleteSubmission, isPending: isDeleting } = useDeleteSubmission(
        contestId,
        questionId,
    );

    const submissions = data?.items || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / (data?.per_page || 10));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>
                        View your submission history for this question
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : submissions.length > 0 ? (
                        <div className="space-y-4">
                            {submissions.map((submission) => (
                                <div
                                    key={submission.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge
                                                    className={
                                                        statusColors[submission.status] ||
                                                        "bg-gray-100 text-gray-800"
                                                    }
                                                >
                                                    {submission.status.replace(/_/g, " ")}
                                                </Badge>
                                                <span className="text-sm text-gray-600">
                                                    {submission.language}
                                                </span>
                                                {submission.score !== undefined && (
                                                    <span className="text-sm font-semibold">
                                                        Score: {submission.score}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Submitted on{" "}
                                                {submission.created_at
                                                    ? new Date(
                                                          submission.created_at,
                                                      ).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                            {submission.error_message && (
                                                <p className="text-xs text-red-600 mt-2">
                                                    Error: {submission.error_message}
                                                </p>
                                            )}
                                            {submission.execution_time && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Time: {submission.execution_time}ms | Memory:{" "}
                                                    {submission.memory_used}MB
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSelectSubmission?.(submission.id)}
                                                className="gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteSubmissionId(submission.id)}
                                                className="gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div className="flex gap-2 justify-center mt-6">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            No submissions yet. Submit your first solution!
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={!!deleteSubmissionId}
                onOpenChange={() => setDeleteSubmissionId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this submission? This action cannot be
                        undone.
                    </AlertDialogDescription>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteSubmissionId) {
                                    deleteSubmission(deleteSubmissionId, {
                                        onSuccess: () => setDeleteSubmissionId(null),
                                    });
                                }
                            }}
                            disabled={isDeleting}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
