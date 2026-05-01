import { useState, useCallback, useMemo } from "react";
import { INITIAL_CODES } from "@/constant/question-template";
import type { TestCase } from "@/components/questions/test-case-manager";
import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";
import { QuestionResponse } from "@/api/generated/model/questionResponse";

export function useQuestionForm() {
    // Metadata
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>(QuestionDifficulty.MEDIUM);
    const [timeLimit, setTimeLimit] = useState(1000);
    const [memoryLimit, setMemoryLimit] = useState(256);
    const [score, setScore] = useState(100);
    const [duration, setDuration] = useState("");
    const [allowedLanguages, setAllowedLanguages] = useState<number[]>([]); // Initialize empty to avoid invalid IDs
    const [tags, setTags] = useState<string[]>([]);

    // Problem content
    const [description, setDescription] = useState("");
    const [inputFormat, setInputFormat] = useState("");
    const [outputFormat, setOutputFormat] = useState("");
    const [constraints, setConstraints] = useState("");
    const [notes, setNotes] = useState("");

    // Code
    const [starterCodes, setStarterCodes] = useState<Record<number, string>>(INITIAL_CODES.starter);
    const [solutionCodes, setSolutionCodes] = useState<Record<number, string>>(
        INITIAL_CODES.solution,
    );
    const [driverCodes, setDriverCodes] = useState<Record<number, string>>(INITIAL_CODES.driver);

    // Test cases
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    const initializeForm = useCallback((data: QuestionResponse, platformLanguages: any[] = []) => {
        if (!data) return;
        setTitle(data.title ?? "");
        setDifficulty(data.difficulty ?? QuestionDifficulty.MEDIUM);
        setTimeLimit(data.time_limit_ms ?? 1000);
        setMemoryLimit(data.memory_limit_mb ?? 256);
        setScore((data as any).score ?? 100);
        setDuration((data as any).duration?.toString() ?? "");

        // Parse question_text
        try {
            const parsedText = JSON.parse(data.question_text);
            setDescription(parsedText.description ?? "");
            setInputFormat(parsedText.input ?? "");
            setOutputFormat(parsedText.output ?? "");
            setConstraints(parsedText.constraints ?? "");
            setNotes(parsedText.notes ?? "");
        } catch (e) {
            setDescription(data.question_text ?? "");
        }

        const fromAllowed =
            data.allowed_languages
                ?.map((l: any) => {
                    // If it's an object with id
                    if (typeof l === "object" && l !== null) return Number(l.id);

                    // If it's already a number or numeric string
                    const num = Number(l);
                    if (!isNaN(num)) return num;

                    // If it's a slug, find ID from platformLanguages
                    const lang = platformLanguages.find((pl) => pl.slug === l);
                    return lang ? Number(lang.id) : NaN;
                })
                .filter((l) => !isNaN(l) && l !== null) ?? [];

        const fromTemplates = data.templates?.map((t) => Number(t.language_id)) ?? [];

        // Combine all possible sources for language IDs
        const uniqueIds = Array.from(new Set([...fromAllowed, ...fromTemplates])).filter(
            (id) => id > 0,
        );

        setAllowedLanguages(uniqueIds);
        setTags(data.tags?.map((t) => t.id) ?? []);

        if (data.templates) {
            const starters: Record<number, string> = {};
            const solutions: Record<number, string> = {};
            const drivers: Record<number, string> = {};
            data.templates.forEach((t) => {
                starters[t.language_id] = t.starter_code;
                solutions[t.language_id] = t.solution_code ?? "";
                drivers[t.language_id] = t.driver_code ?? "";
            });
            setStarterCodes({ ...INITIAL_CODES.starter, ...starters });
            setSolutionCodes({ ...INITIAL_CODES.solution, ...solutions });
            setDriverCodes({ ...INITIAL_CODES.driver, ...drivers });
        }

        if (data.testcases) {
            setTestCases(
                data.testcases.map((tc) => ({
                    id: tc.id ?? Math.random().toString(36).substr(2, 9),
                    input: tc.input,
                    output: tc.output,
                    is_hidden: tc.is_hidden,
                    weight: tc.weight,
                    order: tc.order ?? 0,
                })),
            );
        }
    }, []);

    const metadataObj = useMemo(
        () => ({
            title,
            setTitle,
            difficulty,
            setDifficulty,
            timeLimit,
            setTimeLimit,
            memoryLimit,
            setMemoryLimit,
            score,
            setScore,
            duration,
            setDuration,
            allowedLanguages,
            setAllowedLanguages,
            tags,
            setTags,
        }),
        [title, difficulty, timeLimit, memoryLimit, score, duration, allowedLanguages, tags],
    );

    const contentObj = useMemo(
        () => ({
            description,
            setDescription,
            inputFormat,
            setInputFormat,
            outputFormat,
            setOutputFormat,
            constraints,
            setConstraints,
            notes,
            setNotes,
        }),
        [description, inputFormat, outputFormat, constraints, notes],
    );

    const codeObj = useMemo(
        () => ({
            starterCodes,
            setStarterCodes,
            solutionCodes,
            setSolutionCodes,
            driverCodes,
            setDriverCodes,
        }),
        [starterCodes, solutionCodes, driverCodes],
    );

    const testCasesObj = useMemo(
        () => ({
            testCases,
            setTestCases,
        }),
        [testCases],
    );

    return {
        metadata: metadataObj,
        content: contentObj,
        code: codeObj,
        testCases: testCasesObj,
        initializeForm,
    };
}
