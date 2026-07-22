"use client";

import Editor from "@monaco-editor/react";
import {
    AlertCircle,
    CheckCircle2,
    Database,
    Info,
    Loader2,
    Play,
    TerminalSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { useTestDraftCodeApiV1QuestionsTestDraftPost } from "@/api/generated/questions/questions";
import { SqlResultTable } from "@/components/shared/sql-result-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SQL_LANGUAGE_ID } from "@/constant/question-template";
import { isDarkTheme } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

import { extractExecutionError } from "./question-code-editor";
import { type TestCase } from "./test-case-manager";

const STEP_COPY: Record<string, { label: string; hint: string }> = {
    schema: {
        label: "Schema",
        hint: "CREATE TABLE statements defining the dataset structure.",
    },
    seed: {
        label: "Seed Data",
        hint: "INSERT statements populating the tables for judging.",
    },
    starter: {
        label: "Starter Query",
        hint: "Initial query template shown to participants.",
    },
    solution: {
        label: "Solution Query",
        hint: "Reference query used to generate expected results.",
    },
};

interface SqlCodeEditorProps {
    step: "schema" | "seed" | "starter" | "solution";
    value: string;
    onChange: (value: string) => void;
    showExecution?: boolean;
    testCases?: TestCase[];
    schema?: string;
    seed?: string;
}

export function SqlCodeEditor({
    step,
    value,
    onChange,
    showExecution = false,
    testCases = [],
    schema = "",
    seed = "",
}: SqlCodeEditorProps) {
    const { resolvedTheme } = useTheme();
    const monacoTheme = isDarkTheme(resolvedTheme) ? "vs-dark" : "vs";
    const copy = STEP_COPY[step];
    const { mutateAsync: runDraft, isPending: running } =
        useTestDraftCodeApiV1QuestionsTestDraftPost();
    const [lastResult, setLastResult] = useState<any>(null);
    const [execError, setExecError] = useState<string | null>(null);

    const handleRun = async () => {
        setExecError(null);
        setLastResult(null);

        if (!value.trim()) {
            setExecError("Add a solution query before running the tests.");
            return;
        }
        if (!schema.trim()) {
            setExecError("Add a schema before running the tests.");
            return;
        }
        if (testCases.length === 0) {
            setExecError("Add at least one test case before running.");
            return;
        }
        const incomplete = testCases.filter((tc) => !tc.output?.trim());
        if (incomplete.length > 0) {
            setExecError(
                `${incomplete.length} test case${incomplete.length === 1 ? "" : "s"} need an expected result before running.`,
            );
            return;
        }

        try {
            const result = await runDraft({
                data: {
                    language_id: SQL_LANGUAGE_ID,
                    starter_code: "",
                    solution_code: value,
                    driver_code: "",
                    test_cases: testCases.map((tc) => ({
                        input: `${schema}\n${seed}`,
                        expected_output: tc.output,
                        is_ordered: tc.is_ordered ?? true,
                    })),
                },
            });

            if (result.data) {
                setLastResult(result.data);
            }
        } catch (err: unknown) {
            setExecError(extractExecutionError(err));
        }
    };

    const results = lastResult?.testcases || [];
    const passedCount = lastResult?.passed || 0;
    const totalCount = lastResult?.total || 0;

    return (
        <div
            className={cn(
                "flex flex-col gap-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
                showExecution ? "h-[650px]" : "h-[450px]",
            )}
        >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-muted/15 px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Database className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-bold tracking-tight text-foreground">
                            {copy.label}
                        </span>
                        <p className="mt-0.5 text-[9px] font-semibold leading-none text-muted-foreground">
                            {copy.hint}
                        </p>
                    </div>
                </div>
                {showExecution && (
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 cursor-pointer rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all active:scale-95 hover:bg-primary/90"
                        onClick={handleRun}
                        disabled={running}
                    >
                        {running ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 fill-current" /> Run Against Test Cases
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                <div className="relative min-w-0 flex-1">
                    <Editor
                        height="100%"
                        language="sql"
                        value={value}
                        onChange={(v) => onChange(v ?? "")}
                        theme={monacoTheme}
                        options={{
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            renderLineHighlight: "line",
                            padding: { top: 12, bottom: 12 },
                            tabSize: 4,
                            wordWrap: "on",
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            bracketPairColorization: { enabled: true },
                            guides: { bracketPairs: true },
                            scrollbar: {
                                verticalScrollbarSize: 8,
                                horizontalScrollbarSize: 8,
                            },
                        }}
                    />
                </div>

                {showExecution && (
                    <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto border-l border-border/40 bg-muted/5">
                        <div className="shrink-0 space-y-3 border-b border-border/20 p-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Execution Summary
                                </Label>
                                {totalCount > 0 && (
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[9px] font-bold",
                                            passedCount === totalCount
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-amber-500/10 text-amber-500",
                                        )}
                                    >
                                        {passedCount}/{totalCount} Passed
                                    </span>
                                )}
                            </div>

                            {execError && (
                                <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span className="whitespace-pre-line">{execError}</span>
                                </div>
                            )}

                            {totalCount === 0 && !execError && (
                                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-[10px] text-amber-500/80">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>Run the solution against every test case.</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4 p-4">
                            {results.length > 0
                                ? results.map((res: any, idx: number) => (
                                      <div key={idx} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                                  Test Case #{idx + 1}
                                              </span>
                                              <div
                                                  className={cn(
                                                      "flex items-center gap-1 text-[10px] font-bold uppercase",
                                                      res.passed
                                                          ? "text-emerald-500"
                                                          : "text-amber-500",
                                                  )}
                                              >
                                                  {res.passed ? (
                                                      <CheckCircle2 className="h-3 w-3" />
                                                  ) : (
                                                      <AlertCircle className="h-3 w-3" />
                                                  )}
                                                  {res.status?.description}
                                              </div>
                                          </div>

                                          <div className="grid grid-cols-1 gap-2">
                                              <div className="space-y-1">
                                                  <span className="ml-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                      Your Result
                                                  </span>
                                                  <SqlResultTable text={res.stdout} />
                                              </div>
                                              {!res.passed && (
                                                  <div className="space-y-1">
                                                      <span className="ml-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                                                          Expected Result
                                                      </span>
                                                      <SqlResultTable
                                                          text={
                                                              testCases[idx]?.output ??
                                                              res.expected_output
                                                          }
                                                      />
                                                  </div>
                                              )}
                                              {res.stderr && (
                                                  <div className="space-y-1">
                                                      <span className="ml-0.5 text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-300">
                                                          Error
                                                      </span>
                                                      <pre className="whitespace-pre-wrap break-words rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[10px] leading-tight text-red-950 dark:text-red-100">
                                                          {res.stderr}
                                                      </pre>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  ))
                                : !execError && (
                                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20">
                                              <TerminalSquare className="h-5 w-5" />
                                          </div>
                                          <p className="text-[9px] font-semibold uppercase tracking-widest">
                                              Awaiting execution
                                          </p>
                                      </div>
                                  )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
