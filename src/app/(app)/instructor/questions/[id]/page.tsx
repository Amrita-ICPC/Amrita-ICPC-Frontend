"use client";

/**
 * Question View Page
 * Displays full details of a question
 * Instructor-only access required
 */

import { useRouter, useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useQuestion, useDeleteQuestion } from "@/query/use-questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Code2, Edit, Trash2, Clock, HardDrive } from "lucide-react";
import { format } from "date-fns";

function QuestionViewContent() {
    const router = useRouter();
    const params = useParams();
    const questionId = params?.id as string;

    const { data: question, isLoading, error } = useQuestion(questionId);
    const deleteQuestion = useDeleteQuestion();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                </Card>
            </div>
        );
    }

    if (error || !question) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load question. Please try again.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/instructor/questions/${questionId}/edit`)}
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this question?")) {
                                deleteQuestion.mutate(questionId, {
                                    onSuccess: () => {
                                        router.back();
                                    },
                                });
                            }
                        }}
                        disabled={deleteQuestion.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Question Header */}
            <Card className="p-6 border-l-4 border-l-blue-600">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{question.title}</h1>
                        <div className="flex gap-2 flex-wrap">
                            {question.difficulty && (
                                <Badge
                                    className={`
                                        ${
                                            question.difficulty === "easy"
                                                ? "bg-green-100 text-green-800"
                                                : question.difficulty === "medium"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                        }
                                    `}
                                >
                                    {question.difficulty.charAt(0).toUpperCase() +
                                        question.difficulty.slice(1)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Question Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {question.language && (
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Language</span>
                        </div>
                        <p className="text-lg font-semibold">{question.language}</p>
                    </Card>
                )}

                {question.time_limit && (
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-600">Time Limit</span>
                        </div>
                        <p className="text-lg font-semibold">{question.time_limit}s</p>
                    </Card>
                )}

                {question.memory_limit && (
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <HardDrive className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">Memory Limit</span>
                        </div>
                        <p className="text-lg font-semibold">{question.memory_limit}MB</p>
                    </Card>
                )}

                {question.created_at && (
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Created</span>
                        </div>
                        <p className="text-lg font-semibold">
                            {format(new Date(question.created_at), "MMM dd, yyyy")}
                        </p>
                    </Card>
                )}
            </div>

            {/* Problem Statement */}
            {question.statement && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Problem Statement</h2>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {question.statement}
                    </div>
                </Card>
            )}

            {/* Question Details */}
            <Card className="p-6 bg-gray-50">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="space-y-3 text-sm">
                    {question.author && (
                        <div className="flex gap-4">
                            <span className="text-gray-600 font-medium min-w-32">Author:</span>
                            <span>{question.author}</span>
                        </div>
                    )}
                    {question.created_at && (
                        <div className="flex gap-4">
                            <span className="text-gray-600 font-medium min-w-32">Created:</span>
                            <span>
                                {format(new Date(question.created_at), "MMM dd, yyyy 'at' HH:mm")}
                            </span>
                        </div>
                    )}
                    {question.updated_at && (
                        <div className="flex gap-4">
                            <span className="text-gray-600 font-medium min-w-32">Updated:</span>
                            <span>
                                {format(new Date(question.updated_at), "MMM dd, yyyy 'at' HH:mm")}
                            </span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default function QuestionViewPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <QuestionViewContent />
        </AuthGuard>
    );
}
