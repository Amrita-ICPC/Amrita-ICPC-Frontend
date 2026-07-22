import { useMemo } from "react";

import type { QuestionTemplateCreate, QuestionTestCaseCreate } from "@/api/generated/model";
import { QuestionType } from "@/api/generated/model/questionType";
import { SQL_LANGUAGE_ID } from "@/constant/question-template";

import type { useQuestionForm } from "./use-question-form";

export function useQuestionPayload(form: ReturnType<typeof useQuestionForm>) {
    const buildPayload = useMemo(() => {
        const { metadata, content, code, testCases } = form;
        const isSql = metadata.questionType === QuestionType.SQL;

        // Prepare Question Architecture (JSON string for question_text). For SQL,
        // the shared schema/seed are persisted here (frontend-owned blob) so they
        // round-trip; the backend never parses this field.
        const question_text = JSON.stringify({
            description: content.description,
            input: content.inputFormat,
            output: content.outputFormat,
            constraints: content.constraints,
            notes: content.notes,
            ...(isSql ? { sql: { schema: code.sqlSchema, seed: code.sqlSeed } } : {}),
        });

        // Prepare Testcases. For SQL, every case shares the compiled fixture
        // (schema + seed) as its input; the case only differs by expected result.
        const sqlFixture = `${code.sqlSchema}\n${code.sqlSeed}`;
        const formattedTestCases: QuestionTestCaseCreate[] = testCases.testCases.map(
            (tc, index) => ({
                input: isSql ? sqlFixture : tc.input || "",
                output: tc.output || "",
                is_hidden: tc.is_hidden,
                weight: tc.weight || 1,
                order: index + 1,
                ...(isSql ? { is_ordered: tc.is_ordered ?? true } : {}),
            }),
        );

        if (isSql) {
            // SQL is single-language (SQLite): one implicit language, one template.
            const templates: QuestionTemplateCreate[] = [
                {
                    language_id: SQL_LANGUAGE_ID,
                    starter_code: code.sqlStarter || "",
                    solution_code: code.sqlSolution || "",
                    driver_code: "",
                },
            ];
            return {
                title: metadata.title,
                question_type: QuestionType.SQL,
                difficulty: metadata.difficulty,
                question_text,
                time_limit_ms: metadata.timeLimit,
                memory_limit_mb: metadata.memoryLimit,
                allowed_languages: [SQL_LANGUAGE_ID],
                tag_ids: metadata.tags.filter(Boolean),
                testcases: formattedTestCases,
                templates,
                score: metadata.score,
                duration: metadata.duration ? Number(metadata.duration) : null,
                max_submission: metadata.maxSubmission ? Number(metadata.maxSubmission) : null,
            };
        }

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
            question_type: QuestionType.STANDARD,
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
            max_submission: metadata.maxSubmission ? Number(metadata.maxSubmission) : null,
        };
    }, [form]);

    return buildPayload;
}
