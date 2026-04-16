/**
 * React Query hooks for Judge0 integration
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { executeCode, getJudgeLanguages } from "@/services/judge0";

export const JUDGE0_QUERY_KEY = ["judge0"] as const;

/**
 * Get supported judge languages
 */
export function useJudgeLanguages() {
    return useQuery({
        queryKey: [...JUDGE0_QUERY_KEY, "languages"],
        queryFn: getJudgeLanguages,
        staleTime: 60 * 60 * 1000, // Cache for 1 hour
    });
}

/**
 * Execute code
 */
export function useExecuteCode() {
    return useMutation({
        mutationFn: ({
            language,
            code,
            input,
        }: {
            language: string;
            code: string;
            input?: string;
        }) => executeCode(language, code, input),
    });
}
