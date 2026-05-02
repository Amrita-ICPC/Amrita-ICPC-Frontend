"use client";
import { QuestionEditorShell } from "./question-editor-shell";
import { useQuestionForm } from "@/hooks/use-question-form";
import { useQuestionPayload } from "@/hooks/use-question-payload";
import {
    contestQuestionKey,
    contestQuestionsKey,
    useAddQuestionToContest,
    useCreateQuestion,
    useUpdateContestQuestion,
} from "@/query/contest-query";
import { useRouter } from "next/navigation";

export default function ContestQuestionEditorPage({
    contestId,
    questionId,
    isEdit,
}: {
    contestId: string;
    questionId: string;
    isEdit: boolean;
}) {
    const router = useRouter();
    const form = useQuestionForm();
    const payload = useQuestionPayload(form);

    const createQuestionMutation = useCreateQuestion();
    const addQuestionMutation = useAddQuestionToContest({
        mutation: {
            meta: {
                successMessage: "Question created and added to contest successfully!",
                invalidateKeys: [contestQuestionsKey(contestId)],
            },
        },
    });

    const handleCreate = async () => {
        const questionResponse = await createQuestionMutation.mutateAsync({
            data: {
                title: payload.title,
                difficulty: payload.difficulty,
                question_text: payload.question_text,
                time_limit_ms: payload.time_limit_ms,
                memory_limit_mb: payload.memory_limit_mb,
                allowed_languages: payload.allowed_languages,
                tag_ids: payload.tag_ids,
                testcases: payload.testcases,
                templates: payload.templates,
            },
        });

        const questionId = questionResponse.data?.id;
        if (!questionId) return;

        await addQuestionMutation.mutateAsync({
            contestId,
            data: {
                questions: [
                    {
                        question_id: questionId,
                        score: payload.score,
                    },
                ],
            },
        });

        router.push(`/contest/${contestId}/questions`);
    };
    const updateMutation = useUpdateContestQuestion({
        mutation: {
            meta: {
                successMessage: "Question updated successfully!",
                invalidateKeys: [
                    contestQuestionKey(contestId, questionId!),
                    contestQuestionsKey(contestId),
                ],
            },
        },
    });

    const onUpdate = async () => {
        await updateMutation.mutateAsync({
            contestId,
            questionId: questionId!,
            data: payload,
        });
        router.push(`/contest/${contestId}/questions`);
        router.refresh();
    };

    const isSavingCreateQuestion =
        createQuestionMutation.isPending || addQuestionMutation.isPending;
    const isSavingUpdateQuestion = updateMutation.isPending;

    if (!isEdit) {
        return (
            <QuestionEditorShell
                mode="create"
                contestId={contestId}
                form={form}
                onSave={handleCreate}
                isSaving={isSavingCreateQuestion}
            />
        );
    }
    return (
        <QuestionEditorShell
            mode="update"
            contestId={contestId}
            questionId={questionId}
            form={form}
            onSave={onUpdate}
            isSaving={isSavingUpdateQuestion}
        />
    );
}
