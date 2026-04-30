import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateQuestionApiV1QuestionsPost } from "@/api/generated/questions/questions";
import { useAddQuestionToContestApiV1ContestsContestIdQuestionsPost } from "@/api/generated/contests/contests";
import { toast } from "sonner";
import { z } from "zod";
import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";
import type { QuestionTemplateCreate } from "@/api/generated/model/questionTemplateCreate";
import type { QuestionTestCaseCreate } from "@/api/generated/model/questionTestCaseCreate";

const questionSubmitSchema = z.object({
    contestId: z.string().min(1, "Contest ID is required"),
    title: z.string().min(1, "Question title is required"),
    difficulty: z.enum(QuestionDifficulty),
    timeLimit: z.number().min(1, "Time limit must be at least 1ms"),
    memoryLimit: z.number().min(1, "Memory limit must be at least 1MB"),
    score: z.number().min(0, "Score cannot be negative"),
    tags: z.array(z.string()),
    description: z.string().min(1, "Problem description is required"),
    inputFormat: z.string(),
    outputFormat: z.string(),
    constraints: z.string(),
    notes: z.string(),
    starterCodes: z.record(z.number(), z.string()),
    solutionCodes: z.record(z.number(), z.string()),
    driverCodes: z.record(z.number(), z.string()),
    testCases: z
        .array(
            z.object({
                input: z.string(),
                output: z.string(),
                is_hidden: z.boolean().optional(),
                weight: z.number().optional(),
            }),
        )
        .min(1, "At least one test case is required"),
    allowedLanguages: z.array(z.number()).min(1, "At least one allowed language is required"),
});

export type SubmitQuestionParams = z.infer<typeof questionSubmitSchema>;

export function useContestQuestionSubmit() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const createQuestionMutation = useCreateQuestionApiV1QuestionsPost();
    const addQuestionMutation = useAddQuestionToContestApiV1ContestsContestIdQuestionsPost();

    const handleSubmit = async (params: SubmitQuestionParams) => {
        try {
            // 1. Validate with Zod
            const validatedData = questionSubmitSchema.parse(params);

            const {
                contestId,
                title,
                difficulty,
                timeLimit,
                memoryLimit,
                score,
                tags,
                description,
                inputFormat,
                outputFormat,
                constraints,
                notes,
                starterCodes,
                solutionCodes,
                driverCodes,
                testCases,
                allowedLanguages,
            } = validatedData;

            // 2. Prepare Question Architecture
            const question_text = JSON.stringify({
                description,
                input: inputFormat,
                output: outputFormat,
                constraints,
                notes,
            });

            // 3. Prepare Testcases
            const formattedTestCases: QuestionTestCaseCreate[] = testCases.map((tc, index) => ({
                input: tc.input || "",
                output: tc.output || "",
                is_hidden: tc.is_hidden,
                weight: tc.weight || 1,
                order: index + 1,
            }));

            // 4. Prepare Templates - Filter by allowedLanguages
            const templates: QuestionTemplateCreate[] = allowedLanguages.map((langId) => ({
                language_id: langId,
                starter_code: starterCodes[langId] || "",
                solution_code: solutionCodes[langId] || "",
                driver_code: driverCodes[langId] || "",
            }));

            // 5. Create the Question
            const questionResponse = await createQuestionMutation.mutateAsync({
                data: {
                    title,
                    difficulty,
                    question_text,
                    time_limit_ms: timeLimit,
                    memory_limit_mb: memoryLimit,
                    allowed_languages: allowedLanguages,
                    tag_ids: tags,
                    testcases: formattedTestCases,
                    templates: templates,
                },
            });

            const questionId = questionResponse.data?.id;
            if (!questionId) {
                throw new Error("Question response missing ID");
            }

            // 6. Add to Contest
            await addQuestionMutation.mutateAsync({
                contestId,
                data: {
                    questions: [
                        {
                            question_id: questionId,
                            score: score,
                        },
                    ],
                },
            });

            // 7. Finalize
            queryClient.invalidateQueries({
                queryKey: ["getContestApiV1ContestsContestIdQuestionsGet", contestId],
            });
            toast.success("Question created and added to contest successfully!");
            router.push(`/contest/${contestId}/questions`);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const firstError = error.issues[0]?.message || "Validation failed";
                toast.error(firstError);
            } else {
                console.error("Failed to create question:", error);
                toast.error("Failed to create question. Please check all fields.");
            }
        }
    };

    return {
        handleSubmit,
        isSaving: createQuestionMutation.isPending || addQuestionMutation.isPending,
    };
}
