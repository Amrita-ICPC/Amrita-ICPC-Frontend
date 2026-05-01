"use client";

import { useRouter } from "next/navigation";
import { useQuestionForm } from "@/hooks/use-question-form";
import { useQuestionPayload } from "@/hooks/use-question-payload";
import { QuestionEditorShell } from "./question-editor-shell";
import {
    useUpdateContestQuestion,
    contestQuestionKey,
    contestQuestionsKey,
} from "@/query/contest-query";

interface ContestQuestionsUpdateClientProps {
    contestId: string;
    questionId: string;
}

export function ContestQuestionsUpdateClient({
    contestId,
    questionId,
}: ContestQuestionsUpdateClientProps) {
    const router = useRouter();
    const form = useQuestionForm();
    const payload = useQuestionPayload(form);

    const updateMutation = useUpdateContestQuestion({
        mutation: {
            meta: {
                successMessage: "Question updated successfully!",
                invalidateKeys: [
                    contestQuestionKey(contestId, questionId),
                    contestQuestionsKey(contestId),
                ],
            },
        },
    });

    const onUpdate = async () => {
        await updateMutation.mutateAsync({
            contestId,
            questionId,
            data: payload,
        });
        router.push(`/contest/${contestId}/questions`);
    };

    return (
        <QuestionEditorShell
            mode="update"
            contestId={contestId}
            questionId={questionId}
            form={form}
            onSave={onUpdate}
            isSaving={updateMutation.isPending}
        />
    );
}
