"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
    TerminalSquare,
    ChevronDown,
    Play,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { useTestDraftCodeApiV1QuestionsTestDraftPost } from "@/api/generated/questions/questions";
import { type TestCase } from "./test-case-manager";

const LANGUAGES = [
    { id: 71, label: "Python 3", monaco: "python" },
    { id: 54, label: "C++ (GCC)", monaco: "cpp" },
    { id: 50, label: "C (GCC)", monaco: "c" },
    { id: 62, label: "Java", monaco: "java" },
] as const;

export type MonacoLanguage = (typeof LANGUAGES)[number];

interface ExecutionResult {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    status?: { id: number; description: string };
    time?: string | null;
    memory?: number | null;
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
        if (!currentContent.trim()) return;

        setExecError(null);

        try {
            const result = await runDraft({
                data: {
                    language_id: language.id,
                    starter_code: title === "starter" ? currentContent : starterCode,
                    solution_code: title === "solution" ? currentContent : solutionCode,
                    driver_code: title === "driver" ? currentContent : driverCode,
                    test_cases: testCases.map((tc) => ({
                        input: tc.input,
                        expected_output: tc.output,
                    })),
                },
            });

            if (result.data) {
                setLastResult(result.data);
            }
        } catch (err: any) {
            setExecError(
                err.response?.data?.message || "Execution failed. Check your code for errors.",
            );
        }
    };

    // For the UI, we'll show the results of all testcases
    const results = lastResult?.testcases || [];
    const passedCount = lastResult?.passed || 0;
    const totalCount = lastResult?.total || 0;

    return (
        <div
            className={cn(
                "flex flex-col gap-0 rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card/30 backdrop-blur-md",
                showExecution ? "h-[700px]" : "h-[500px]",
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 bg-muted/30 px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TerminalSquare className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-sm font-bold tracking-tight text-foreground uppercase">
                            {title}
                        </span>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none mt-0.5">
                            Editor Instance
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 border-border/40 bg-background/50 hover:bg-background/80 transition-colors"
                            >
                                <span className="text-xs font-bold">{language.label}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 p-1 border-border/40 backdrop-blur-xl bg-background/95 shadow-2xl"
                        >
                            {availableLanguages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.id}
                                    onClick={() => onLanguageChange(lang)}
                                    className={cn(
                                        "flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer transition-colors",
                                        language.id === lang.id
                                            ? "bg-primary/10 text-primary font-bold"
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
                            className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
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
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            renderLineHighlight: "line",
                            padding: { top: 20, bottom: 20 },
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
                    <div className="flex w-[400px] shrink-0 flex-col border-l border-border/40 bg-muted/10 backdrop-blur-sm overflow-y-auto">
                        {/* Results Summary */}
                        <div className="p-6 border-b border-border/20 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Test Execution Summary
                                </Label>
                                {totalCount > 0 && (
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
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
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{execError}</span>
                                </div>
                            )}

                            {totalCount === 0 && !execError && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-500/80 text-[10px] flex items-center gap-2">
                                    <Info className="h-3.5 w-3.5" />
                                    <span>Add test cases to verify your code.</span>
                                </div>
                            )}
                        </div>

                        {/* Result Section */}
                        <div className="p-6 flex-1 space-y-6">
                            {results.length > 0
                                ? results.map((res: any, idx: number) => (
                                      <div key={idx} className="space-y-3">
                                          <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                                  Test Case #{idx + 1}
                                              </span>
                                              <div
                                                  className={cn(
                                                      "flex items-center gap-1.5 text-[10px] font-bold uppercase",
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
                                                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">
                                                      Input
                                                  </span>
                                                  <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-slate-300 leading-tight border border-border/10">
                                                      {testCases[idx]?.input?.trim() || "No input"}
                                                  </pre>
                                              </div>
                                              <div className="space-y-1">
                                                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">
                                                      Output
                                                  </span>
                                                  <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-slate-300 leading-tight border border-border/10">
                                                      {res.stdout?.trim() || "No output"}
                                                  </pre>
                                              </div>
                                              {!res.passed && (
                                                  <div className="space-y-1">
                                                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/40 ml-1">
                                                          Expected
                                                      </span>
                                                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-amber-500/5 px-3 py-2 font-mono text-[11px] text-amber-200/60 leading-tight border border-amber-500/10">
                                                          {res.expected_output?.trim() || "None"}
                                                      </pre>
                                                  </div>
                                              )}
                                              {res.stderr && (
                                                  <div className="space-y-1">
                                                      <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/40 ml-1">
                                                          Error
                                                      </span>
                                                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-red-500/5 px-3 py-2 font-mono text-[11px] text-red-400/80 leading-tight border border-red-500/10">
                                                          {res.stderr}
                                                      </pre>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  ))
                                : !execError && (
                                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                          <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
                                              <Play className="h-6 w-6" />
                                          </div>
                                          <p className="text-[10px] font-medium uppercase tracking-widest">
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
