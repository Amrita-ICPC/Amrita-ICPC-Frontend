"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { QuestionForm } from "@/components/questions/question-form";
import { useQuestion, useUpdateQuestion } from "@/query/question-query";
import { useToast } from "@/lib/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function EditQuestionClient() {
    const router = useRouter();
    const params = useParams();
    const bankId = params.bankId as string;
    const questionId = params.questionId as string;
    const { toast } = useToast();

    const { data: question, isLoading: isQuestionLoading } = useQuestion(questionId);
    const updateQuestionMutation = useUpdateQuestion();

    const handleSubmit = async (values: any) => {
        try {
            await updateQuestionMutation.mutateAsync({
                questionId,
                payload: values,
            });

            toast("Question updated", {
                description: "The question has been updated successfully.",
            });

            router.push(`/banks/${bankId}`);
        } catch (error: any) {
            toast("Failed to update question", {
                description: error.message || "An unexpected error occurred.",
            });
        }
    };

    if (isQuestionLoading) {
        return (
            <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-xl font-semibold">Question not found</h2>
                <Button variant="outline" asChild className="mt-4">
                    <Link href={`/banks/${bankId}`}>Back to Bank</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/banks/${bankId}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Question</h1>
                    <p className="text-muted-foreground">Modify this coding problem.</p>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <QuestionForm 
                    initialValues={question as any}
                    onSubmit={handleSubmit} 
                    isLoading={updateQuestionMutation.isPending}
                />
            </div>
        </div>
    );
}
