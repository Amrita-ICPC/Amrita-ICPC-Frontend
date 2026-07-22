"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Info,
    Loader2,
    Play,
    TerminalSquare,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { useTestDraftCodeApiV1QuestionsTestDraftPost } from "@/api/generated/questions/questions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isDarkTheme } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

import { Label } from "../ui/label";
import { type TestCase } from "./test-case-manager";

const LANGUAGES = [
    { id: 71, label: "Python 3", monaco: "python" },
    { id: 54, label: "C++ (GCC)", monaco: "cpp" },
    { id: 50, label: "C (GCC)", monaco: "c" },
    { id: 62, label: "Java", monaco: "java" },
    { id: 82, label: "SQL (SQLite)", monaco: "sql" },
] as const;

export type MonacoLanguage = (typeof LANGUAGES)[number];

export function extractExecutionError(err: unknown): string {
    if (!err || typeof err !== "object") {
        return "Execution failed. Check your code and test cases, then try again.";
    }

    const responseData = (err as { response?: { data?: unknown } }).response?.data;
    if (!responseData || typeof responseData !== "object") {
        return "Execution failed. Check your code and test cases, then try again.";
    }

    const data = responseData as {
        message?: unknown;
        detail?: unknown;
        errors?: unknown;
    };

    if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
    }

    const detail = data.detail ?? data.errors;
    if (Array.isArray(detail)) {
        const messages = detail
            .map((item) => {
                if (!item || typeof item !== "object") return null;
                const error = item as { loc?: unknown; msg?: unknown; message?: unknown };
                const field = Array.isArray(error.loc)
                    ? error.loc.filter((part) => part !== "body").join(" -> ")
                    : null;
                const message =
                    typeof error.msg === "string"
                        ? error.msg
                        : typeof error.message === "string"
                          ? error.message
                          : null;
                return message ? [field, message].filter(Boolean).join(": ") : null;
            })
            .filter(Boolean);

        if (messages.length > 0) {
            return messages.join("\n");
        }
    }

    if (typeof detail === "string" && detail.trim()) {
        return detail;
    }

    return "Execution failed. Check your code and test cases, then try again.";
}

interface QuestionCodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: MonacoLanguage;
    onLanguageChange: (lang: MonacoLanguage) => void;
    title: string;
    showExecution?: boolean;
    testCases?: TestCase[];
    starterCode?: string;
    solutionCode?: string;
    driverCode?: string;
    allowedLanguages?: number[];
}

export function QuestionCodeEditor({
    value,
    onChange,
    language,
    onLanguageChange,
    title,
    showExecution = false,
    testCases = [],
    starterCode = "",
    solutionCode = "",
    driverCode = "",
    allowedLanguages = [],
}: QuestionCodeEditorProps) {
    const { resolvedTheme } = useTheme();
    const monacoTheme = isDarkTheme(resolvedTheme) ? "vs-dark" : "vs";
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const { mutateAsync: runDraft, isPending: running } =
        useTestDraftCodeApiV1QuestionsTestDraftPost();
    const [lastResult, setLastResult] = useState<any>(null);
    const [execError, setExecError] = useState<string | null>(null);

    // Filter available languages - Default to Python 3 if none selected
    const availableLanguages =
        allowedLanguages.length === 0
            ? LANGUAGES.filter((l) => l.id === 71)
            : LANGUAGES.filter((l) => allowedLanguages.includes(l.id));

    // Sync selected language if it's no longer allowed
    useEffect(() => {
        // Case 1: allowedLanguages is empty, must be Python
        if (allowedLanguages.length === 0 && language.id !== 71) {
            const python = LANGUAGES.find((l) => l.id === 71);
            if (python) onLanguageChange(python);
        }
        // Case 2: current language is not in the allowed list
        else if (allowedLanguages.length > 0 && !allowedLanguages.includes(language.id)) {
            const nextBest = availableLanguages[0] || LANGUAGES[0];
            onLanguageChange(nextBest);
        }
    }, [allowedLanguages, language.id, onLanguageChange, availableLanguages]);

    const handleRun = async () => {
        const currentContent = editorRef.current?.getValue() ?? value;

        setExecError(null);
        setLastResult(null);

        const activeSolutionCode = title === "solution" ? currentContent : solutionCode;
        const activeDriverCode = title === "driver" ? currentContent : driverCode;
        const runnableTestCases = testCases.map((tc, index) => ({
            index: index + 1,
            input: tc.input ?? "",
            expected_output: tc.output ?? "",
        }));
        const incompleteExpectedOutputs = runnableTestCases.filter(
            (tc) => !tc.expected_output.trim(),
        );

        if (!currentContent.trim()) {
            setExecError(
                title === "driver"
                    ? "Add driver code before running the tests."
                    : title === "solution"
                      ? "Add solution code before running the tests."
                      : "Add code before running the tests.",
            );
            return;
        }

        if (!activeSolutionCode.trim()) {
            setExecError("Add solution code before running the driver tests.");
            return;
        }

        if (!activeDriverCode.trim()) {
            setExecError("Add driver code before running the tests.");
            return;
        }

        if (runnableTestCases.length === 0) {
            setExecError("Add at least one test case before running the driver.");
            return;
        }

        if (incompleteExpectedOutputs.length > 0) {
            const labels = incompleteExpectedOutputs
                .slice(0, 3)
                .map((tc) => `Test Case ${tc.index}`)
                .join(", ");
            setExecError(
                `${labels} ${incompleteExpectedOutputs.length === 1 ? "needs" : "need"} expected output before running.`,
            );
            return;
        }

        try {
            const result = await runDraft({
                data: {
                    language_id: language.id,
                    starter_code: title === "starter" ? currentContent : starterCode,
                    solution_code: activeSolutionCode,
                    driver_code: activeDriverCode,
                    test_cases: runnableTestCases.map((tc) => ({
                        input: tc.input,
                        expected_output: tc.expected_output,
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

    // For the UI, we'll show the results of all testcases
    const results = lastResult?.testcases || [];
    const passedCount = lastResult?.passed || 0;
    const totalCount = lastResult?.total || 0;

    return (
        <div
            className={cn(
                "flex flex-col gap-0 rounded-xl overflow-hidden shadow-sm border border-border/60 bg-card",
                showExecution ? "h-[650px]" : "h-[450px]",
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 bg-muted/15 px-6 py-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TerminalSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-bold tracking-tight text-foreground capitalize">
                            {title === "solution"
                                ? "Solution"
                                : title === "starter"
                                  ? "Starter Code"
                                  : "Driver Code"}
                        </span>
                        <p className="text-[9px] text-muted-foreground font-semibold leading-none mt-0.5">
                            {title === "solution"
                                ? "Configure solution code for validation."
                                : title === "starter"
                                  ? "Configure starter template code for participants."
                                  : "Configure driver execution code to run tests."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-border/40 bg-background/50 hover:bg-background/80 transition-colors rounded-lg text-xs font-semibold px-2.5 cursor-pointer"
                            >
                                <span>{language.label}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 p-1 border-border/40 backdrop-blur-xl bg-background/95 shadow-lg"
                        >
                            {availableLanguages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.id}
                                    onClick={() => onLanguageChange(lang)}
                                    className={cn(
                                        "flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer transition-colors",
                                        language.id === lang.id
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted-foreground hover:bg-muted/50",
                                    )}
                                >
                                    {lang.label}
                                    {language.id === lang.id && (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {showExecution && (
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                            onClick={handleRun}
                            disabled={running}
                        >
                            {running ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…
                                </>
                            ) : (
                                <>
                                    <Play className="h-3.5 w-3.5 fill-current" /> Run Driver
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 min-h-0">
                {/* Monaco editor */}
                <div className="flex-1 min-w-0 relative">
                    <Editor
                        height="100%"
                        language={language.monaco}
                        value={value}
                        onChange={(v) => onChange(v ?? "")}
                        onMount={(editor) => {
                            editorRef.current = editor;
                        }}
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
                            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                        }}
                    />
                </div>

                {showExecution && (
                    <div className="flex w-[360px] shrink-0 flex-col border-l border-border/40 bg-muted/5 overflow-y-auto">
                        {/* Results Summary */}
                        <div className="p-4 border-b border-border/20 space-y-3 shrink-0">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Execution Summary
                                </Label>
                                {totalCount > 0 && (
                                    <span
                                        className={cn(
                                            "text-[9px] font-bold px-2 py-0.5 rounded-full",
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
                                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span className="whitespace-pre-line">{execError}</span>
                                </div>
                            )}

                            {totalCount === 0 && !execError && (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-amber-500/80 text-[10px] flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>Add test cases to verify your code.</span>
                                </div>
                            )}
                        </div>

                        {/* Result Section */}
                        <div className="p-4 flex-1 space-y-4">
                            {results.length > 0
                                ? results.map((res: any, idx: number) => (
                                      <div key={idx} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
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
                                                      Input
                                                  </span>
                                                  <pre className="whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/70 px-3 py-2 font-mono text-[10px] leading-tight text-foreground shadow-inner dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                                                      {testCases[idx]?.input?.trim() || "No input"}
                                                  </pre>
                                              </div>
                                              <div className="space-y-1">
                                                  <span className="ml-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                      Output
                                                  </span>
                                                  <pre className="whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/70 px-3 py-2 font-mono text-[10px] leading-tight text-foreground shadow-inner dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                                                      {res.stdout?.trim() || "No output"}
                                                  </pre>
                                              </div>
                                              {!res.passed && (
                                                  <div className="space-y-1">
                                                      <span className="ml-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                                                          Expected
                                                      </span>
                                                      <pre className="whitespace-pre-wrap break-words rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-[10px] leading-tight text-amber-950 dark:text-amber-100">
                                                          {res.expected_output?.trim() || "None"}
                                                      </pre>
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
                                          <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center mb-3">
                                              <Play className="h-5 w-5" />
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

export { LANGUAGES };
