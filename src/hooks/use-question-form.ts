import { useCallback, useMemo, useState } from "react";

import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";
import { QuestionResponse } from "@/api/generated/model/questionResponse";
import { QuestionType } from "@/api/generated/model/questionType";
import type { TestCase } from "@/components/questions/test-case-manager";
import {
    DEFAULT_SQL_SCHEMA,
    DEFAULT_SQL_SEED,
    DEFAULT_SQL_SOLUTION,
    DEFAULT_SQL_STARTER,
    INITIAL_CODES,
    SQL_LANGUAGE_ID,
} from "@/constant/question-template";

export function useQuestionForm() {
    // Metadata
    const [title, setTitle] = useState("");
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.STANDARD);
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>(QuestionDifficulty.MEDIUM);
    const [timeLimit, setTimeLimit] = useState(1000);
    const [memoryLimit, setMemoryLimit] = useState(256);
    const [score, setScore] = useState(100);
    const [duration, setDuration] = useState("");
    const [maxSubmission, setMaxSubmission] = useState("");
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

    // SQL question fields (single-language: SQLite). Schema + seed are shared
    // across the whole question and compiled into every testcase input at
    // save time; the solution query drives expected-output generation.
    const [sqlSchema, setSqlSchema] = useState(DEFAULT_SQL_SCHEMA);
    const [sqlSeed, setSqlSeed] = useState(DEFAULT_SQL_SEED);
    const [sqlSolution, setSqlSolution] = useState(DEFAULT_SQL_SOLUTION);
    const [sqlStarter, setSqlStarter] = useState(DEFAULT_SQL_STARTER);

    // Test cases
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    const initializeForm = useCallback((data: QuestionResponse, platformLanguages: any[] = []) => {
        if (!data) return;
        setTitle(data.title ?? "");
        setQuestionType(data.question_type ?? QuestionType.STANDARD);
        setDifficulty(data.difficulty ?? QuestionDifficulty.MEDIUM);
        setTimeLimit(data.time_limit_ms ?? 1000);
        setMemoryLimit(data.memory_limit_mb ?? 256);
        setScore((data as any).score ?? 100);
        setDuration((data as any).duration?.toString() ?? "");
        setMaxSubmission((data as any).max_submission?.toString() ?? "");

        // Parse question_text
        try {
            const parsedText = JSON.parse(data.question_text);
            setDescription(parsedText.description ?? "");
            setInputFormat(parsedText.input ?? "");
            setOutputFormat(parsedText.output ?? "");
            setConstraints(parsedText.constraints ?? "");
            setNotes(parsedText.notes ?? "");
            // Shared SQL schema/seed live in a namespaced sub-object; the
            // compiled testcase.input is a derived artifact and ignored here.
            if (parsedText.sql) {
                setSqlSchema(parsedText.sql.schema ?? "");
                setSqlSeed(parsedText.sql.seed ?? "");
            }
        } catch {
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

            // SQL questions carry a single template keyed by the SQLite id:
            // starter = student's initial query, solution = reference query.
            const sqlTemplate = data.templates.find(
                (t) => Number(t.language_id) === SQL_LANGUAGE_ID,
            );
            if (sqlTemplate) {
                setSqlStarter(sqlTemplate.starter_code || DEFAULT_SQL_STARTER);
                setSqlSolution(sqlTemplate.solution_code || DEFAULT_SQL_SOLUTION);
            }
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
                    is_ordered: tc.is_ordered ?? true,
                })),
            );
        }
    }, []);

    const metadataObj = useMemo(
        () => ({
            title,
            setTitle,
            questionType,
            setQuestionType,
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
            maxSubmission,
            setMaxSubmission,
            allowedLanguages,
            setAllowedLanguages,
            tags,
            setTags,
        }),
        [
            title,
            questionType,
            difficulty,
            timeLimit,
            memoryLimit,
            score,
            duration,
            maxSubmission,
            allowedLanguages,
            tags,
        ],
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
            // SQL single-language fields
            sqlSchema,
            setSqlSchema,
            sqlSeed,
            setSqlSeed,
            sqlSolution,
            setSqlSolution,
            sqlStarter,
            setSqlStarter,
        }),
        [starterCodes, solutionCodes, driverCodes, sqlSchema, sqlSeed, sqlSolution, sqlStarter],
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
