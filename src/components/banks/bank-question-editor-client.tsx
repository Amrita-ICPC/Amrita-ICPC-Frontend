"use client";
import { useRouter } from "next/navigation";

import { useQuestionForm } from "@/hooks/use-question-form";
import { useQuestionPayload } from "@/hooks/use-question-payload";
import { bankQuestionsKey, useAddQuestionsToBank, useUpdateBankQuestion } from "@/query/bank-query";
import { questionKey, useCreateQuestion } from "@/query/question-query";

import { QuestionEditorShell } from "../contest/question-editor-shell";

export default function BankQuestionEditorClient({
    bankId,
    questionId,
    isEdit,
}: {
    bankId: string;
    questionId?: string;
    isEdit: boolean;
}) {
    const router = useRouter();
    const form = useQuestionForm();
    const payload = useQuestionPayload(form);

    const createQuestionMutation = useCreateQuestion();
    const addQuestionMutation = useAddQuestionsToBank({
        mutation: {
            meta: {
                successMessage: "Question created and added to bank!",
                invalidateKeys: [bankQuestionsKey(bankId)],
            },
        },
    });

    const updateMutation = useUpdateBankQuestion({
        mutation: {
            meta: {
                successMessage: "Question updated successfully!",
                invalidateKeys: [
                    bankQuestionsKey(bankId),
                    ...(questionId ? [questionKey(questionId)] : []),
                ],
            },
            onSuccess: () => {
                router.push(`/banks/${bankId}`);
            },
        },
    });

    const handleCreate = async () => {
        try {
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

            const newQuestionId = questionResponse.data?.id;
            if (!newQuestionId) return;

            await addQuestionMutation.mutateAsync({
                bankId,
                data: {
                    question_ids: [newQuestionId],
                },
            });

            router.push(`/banks/${bankId}`);
        } catch {
            // Error is handled globally by TanstackQueryProvider
        }
    };

    const onUpdate = async () => {
        if (!questionId) return;
        updateMutation.mutate({
            bankId,
            questionId,
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
    };

    const isSavingCreateQuestion =
        createQuestionMutation.isPending || addQuestionMutation.isPending;
    const isSavingUpdateQuestion = updateMutation.isPending;

    if (!questionId) {
        return (
            <QuestionEditorShell
                mode="create"
                bankId={bankId}
                form={form}
                onSave={handleCreate}
                isSaving={isSavingCreateQuestion}
            />
        );
    }

    return (
        <QuestionEditorShell
            mode="update"
            bankId={bankId}
            questionId={questionId}
            initialPreview={!isEdit}
            form={form}
            onSave={onUpdate}
            isSaving={isSavingUpdateQuestion}
        />
    );
}
