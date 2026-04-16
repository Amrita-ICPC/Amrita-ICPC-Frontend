/**
 * Judge0 integration service - handles code execution and judging
 */

import { api } from "@/lib/api-client";

export interface ExecutionResult {
    status_id: number;
    status_description: string;
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    time: number;
    memory: number;
    exit_code?: number;
}

export interface JudgeLanguage {
    id: number;
    name: string;
}

/**
 * Execute code and get execution result
 */
export async function executeCode(
    language: string,
    code: string,
    input?: string,
): Promise<ExecutionResult> {
    return api.post("/api/v1/judge0/execute", {
        language,
        code,
        input,
    });
}

/**
 * Get supported judge languages
 */
export async function getJudgeLanguages(): Promise<JudgeLanguage[]> {
    return api.get("/api/v1/judge0/languages");
}

/**
 * Get execution status description
 */
export async function getStatusDescription(statusId: number): Promise<string> {
    return api.get(`/api/v1/judge0/statuses/${statusId}`);
}
