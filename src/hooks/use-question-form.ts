import { useState } from "react";
import { INITIAL_CODES } from "@/constant/question-template";
import type { TestCase } from "@/components/questions/test-case-manager";
import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";

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

    return {
        metadata: {
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
        },

        content: {
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
        },

        code: {
            starterCodes,
            setStarterCodes,
            solutionCodes,
            setSolutionCodes,
            driverCodes,
            setDriverCodes,
        },

        testCases: {
            testCases,
            setTestCases,
        },
    };
}
