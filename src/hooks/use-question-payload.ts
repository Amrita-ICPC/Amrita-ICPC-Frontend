import { useMemo } from "react";
import type {
    QuestionCreate,
    QuestionUpdate,
    QuestionTemplateCreate,
    QuestionTestCaseCreate,
} from "@/api/generated/model";
import type { useQuestionForm } from "./use-question-form";

export function useQuestionPayload(form: ReturnType<typeof useQuestionForm>) {
    const buildPayload = useMemo(() => {
        const { metadata, content, code, testCases } = form;

        // Prepare Question Architecture (JSON string for question_text)
        const question_text = JSON.stringify({
            description: content.description,
            input: content.inputFormat,
            output: content.outputFormat,
            constraints: content.constraints,
            notes: content.notes,
        });

        // Prepare Testcases
        const formattedTestCases: QuestionTestCaseCreate[] = testCases.testCases.map(
            (tc, index) => ({
                input: tc.input || "",
                output: tc.output || "",
                is_hidden: tc.is_hidden,
                weight: tc.weight || 1,
                order: index + 1,
            }),
        );

        const cleanAllowedLanguages = metadata.allowedLanguages.filter(
            (id) => typeof id === "number" && !isNaN(id),
        );

        // Prepare Templates - Filter by allowedLanguages
        const templates: QuestionTemplateCreate[] = cleanAllowedLanguages.map((langId) => ({
            language_id: langId,
            starter_code: code.starterCodes[langId] || "",
            solution_code: code.solutionCodes[langId] || "",
            driver_code: code.driverCodes[langId] || "",
        }));

        return {
            title: metadata.title,
            difficulty: metadata.difficulty,
            question_text,
            time_limit_ms: metadata.timeLimit,
            memory_limit_mb: metadata.memoryLimit,
            allowed_languages: cleanAllowedLanguages,
            tag_ids: metadata.tags.filter(Boolean),
            testcases: formattedTestCases,
            templates: templates,
            score: metadata.score,
            duration: metadata.duration ? Number(metadata.duration) : null,
        };
    }, [form]);

    return buildPayload;
}
