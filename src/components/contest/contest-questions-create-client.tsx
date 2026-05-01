"use client";

import { useRouter } from "next/navigation";
import { useQuestionForm } from "@/hooks/use-question-form";
import { useQuestionPayload } from "@/hooks/use-question-payload";
import { QuestionEditorShell } from "./question-editor-shell";
import {
    useCreateQuestion,
    useAddQuestionToContest,
    contestQuestionsKey,
} from "@/query/contest-query";

interface ContestQuestionsCreateClientProps {
    contestId: string;
}

export function ContestQuestionsCreateClient({ contestId }: ContestQuestionsCreateClientProps) {
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

    const isSaving = createQuestionMutation.isPending || addQuestionMutation.isPending;

    return (
        <QuestionEditorShell
            mode="create"
            contestId={contestId}
            form={form}
            onSave={handleCreate}
            isSaving={isSaving}
        />
    );
}
