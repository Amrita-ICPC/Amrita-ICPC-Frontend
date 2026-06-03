/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Loader2,
    Save,
    Lock,
    TerminalSquare,
    Play,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentCodeRunResponse } from "@/api/generated/model";

export const LANGUAGES = [
    { id: 71, label: "Python 3", monaco: "python" },
    { id: 54, label: "C++ (GCC)", monaco: "cpp" },
    { id: 50, label: "C (GCC)", monaco: "c" },
    { id: 62, label: "Java", monaco: "java" },
] as const;

interface EditorPanelProps {
    selectedLanguageId: number;
    setSelectedLanguageIdState: (langId: number) => void;
    currentTemplates: any[];
    isSaving: boolean;
    handleManualSave: () => void;
    isTeamMode: boolean;
    isCurrentEditor: boolean;
    editorCode: string;
    setEditorCode: (code: string) => void;
    consoleHeight: number;
    handleConsoleMouseDown: (e: React.MouseEvent) => void;
    // Panel collapse/expand props
    leftWidth: number;
    setLeftWidth: (w: number) => void;
    prevLeftWidth: number;
    isConsoleCollapsed: boolean;
    setIsConsoleCollapsed: (v: boolean) => void;
    prevConsoleHeight: number;
    setConsoleHeight: (h: number) => void;
    setPrevConsoleHeight: (h: number) => void;
    onRun: () => void;
    isRunning: boolean;
    runResult: StudentCodeRunResponse | null;
}

export function EditorPanel({
    selectedLanguageId,
    setSelectedLanguageIdState,
    currentTemplates,
    isSaving,
    handleManualSave,
    isTeamMode,
    isCurrentEditor,
    editorCode,
    setEditorCode,
    consoleHeight,
    handleConsoleMouseDown,
    leftWidth,
    setLeftWidth,
    prevLeftWidth,
    isConsoleCollapsed,
    setIsConsoleCollapsed,
    prevConsoleHeight,
    setConsoleHeight,
    setPrevConsoleHeight,
    onRun,
    isRunning,
    runResult,
}: EditorPanelProps) {
    const activeLang = LANGUAGES.find((l) => l.id === selectedLanguageId);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (runResult) {
            setActiveTestCaseIdx(0);
        }
    }, [runResult]);

    const currentTheme = mounted && resolvedTheme === "light" ? "light" : "vs-dark";

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#090d16] overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card dark:bg-[#0b0f19] px-6">
                <div className="flex items-center gap-3">
                    {/* Expand Problem Panel Button — shown only when problem view is collapsed */}
                    {leftWidth === 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setLeftWidth(prevLeftWidth > 0 ? prevLeftWidth : 40)}
                            title="Expand Problem Description"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                    {/* Monaco Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                            >
                                <span className="text-xs font-semibold">
                                    {activeLang?.label || "Select Language"}
                                </span>
                                <ChevronDown className="h-3 w-3 text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1322] text-slate-800 dark:text-slate-200"
                        >
                            {currentTemplates.map((t) => {
                                const langDef = LANGUAGES.find((l) => l.id === t.language_id);
                                if (!langDef) return null;
                                return (
                                    <DropdownMenuItem
                                        key={t.language_id}
                                        onClick={() => setSelectedLanguageIdState(t.language_id)}
                                        className={cn(
                                            "cursor-pointer text-xs transition-colors",
                                            selectedLanguageId === t.language_id
                                                ? "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 font-bold"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                                        )}
                                    >
                                        {langDef.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Autosave Spinner */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-500 font-semibold tracking-wider uppercase">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin text-indigo-500 dark:text-indigo-400" />
                                <span>Saving code...</span>
                            </>
                        ) : (
                            <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Autosaved</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold px-2.5"
                        onClick={handleManualSave}
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onRun}
                        disabled={isRunning || !isCurrentEditor}
                        className={cn(
                            "h-7 gap-1 border text-xs font-semibold px-2.5 transition-all",
                            isRunning
                                ? "bg-muted/40 border-border text-muted-foreground"
                                : "bg-emerald-500/10 border-emerald-500/25 dark:border-emerald-500/20 hover:border-emerald-500/40 text-emerald-650 dark:text-emerald-450 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/15",
                        )}
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                Running
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5" />
                                Run
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        disabled
                        className="h-7 gap-1 border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-450 dark:text-slate-500 text-xs font-semibold px-2.5 cursor-not-allowed"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Submit
                    </Button>

                    {isTeamMode && !isCurrentEditor && (
                        <div className="flex items-center gap-2">
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent text-[9px] uppercase font-bold tracking-widest">
                                <Lock className="h-2.5 w-2.5 mr-1" />
                                Read Only Workspace
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 min-h-0 relative bg-white dark:bg-[#090d16]">
                <Editor
                    height="100%"
                    language={activeLang?.monaco || "python"}
                    value={editorCode}
                    onChange={(v) => setEditorCode(v || "")}
                    theme={currentTheme}
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
                        readOnly: isTeamMode && !isCurrentEditor,
                        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    }}
                />
            </div>

            {/* Resize Handle for Console */}
            <div
                onMouseDown={handleConsoleMouseDown}
                className="h-1 shrink-0 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 dark:hover:bg-indigo-400 cursor-row-resize transition-colors w-full"
            />

            {/* Console Adjustable Panel */}
            {!isConsoleCollapsed && (
                <div
                    style={{ height: `${consoleHeight}px` }}
                    className="shrink-0 bg-slate-50 dark:bg-[#070b13] flex flex-col overflow-hidden"
                >
                    <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/40 dark:bg-[#090d16] px-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Console Output
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Collapse console button */}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                onClick={() => {
                                    setPrevConsoleHeight(consoleHeight);
                                    setIsConsoleCollapsed(true);
                                }}
                                title="Collapse Console"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-normal">
                        {isRunning ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">
                                    Executing code against test cases...
                                </span>
                            </div>
                        ) : runResult ? (
                            <div className="flex flex-col h-full gap-4 text-slate-800 dark:text-slate-200">
                                {/* Overall Summary Bar */}
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Result:
                                        </span>
                                        {runResult.passed ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                All Test Cases Passed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20 shadow-sm shadow-rose-500/5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                Some Test Cases Failed
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-450 dark:text-slate-500 font-medium">
                                        {runResult.message}
                                    </span>
                                </div>

                                {/* Main split console content: Left is cases list, Right is case details */}
                                <div className="flex-1 flex min-h-0 gap-4">
                                    {/* Left: Test case tabs list */}
                                    <div className="w-32 shrink-0 flex flex-col gap-1.5 border-r border-slate-200/60 dark:border-slate-800/60 pr-3 overflow-y-auto">
                                        {runResult.results?.map((tc, idx) => {
                                            const isActive = activeTestCaseIdx === idx;
                                            return (
                                                <button
                                                    key={tc.testcase_id}
                                                    onClick={() => setActiveTestCaseIdx(idx)}
                                                    className={cn(
                                                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all border outline-none text-left",
                                                        isActive
                                                            ? "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-805/60 text-indigo-650 dark:text-white"
                                                            : "bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
                                                    )}
                                                >
                                                    <span>Case {idx + 1}</span>
                                                    <span
                                                        className={cn(
                                                            "h-1.5 w-1.5 rounded-full shrink-0",
                                                            tc.passed
                                                                ? "bg-emerald-500 shadow-sm shadow-emerald-500"
                                                                : "bg-rose-500 shadow-sm shadow-rose-500",
                                                        )}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Right: Selected Case Details */}
                                    {runResult.results?.[activeTestCaseIdx] && (
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                            {/* Case Info Status (Accepted, Wrong Answer, etc) */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        Status:
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-xs font-bold",
                                                            runResult.results[activeTestCaseIdx]
                                                                .passed
                                                                ? "text-emerald-500"
                                                                : "text-rose-500",
                                                        )}
                                                    >
                                                        {
                                                            runResult.results[activeTestCaseIdx]
                                                                .status_description
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-450 font-medium">
                                                    <span>Time:</span>
                                                    <span className="text-slate-700 dark:text-slate-350">
                                                        {(
                                                            runResult.results[activeTestCaseIdx]
                                                                .time * 1000
                                                        ).toFixed(0)}{" "}
                                                        ms
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-450 font-medium">
                                                    <span>Memory:</span>
                                                    <span className="text-slate-700 dark:text-slate-350">
                                                        {runResult.results[
                                                            activeTestCaseIdx
                                                        ].memory.toFixed(2)}{" "}
                                                        MB
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Compile output if any */}
                                            {runResult.results[activeTestCaseIdx]
                                                .compile_output && (
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-455">
                                                        Compilation Error
                                                    </div>
                                                    <pre className="p-3 rounded-lg bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[11px] whitespace-pre-wrap select-text leading-relaxed">
                                                        {
                                                            runResult.results[activeTestCaseIdx]
                                                                .compile_output
                                                        }
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Runtime Error (stderr) if any */}
                                            {runResult.results[activeTestCaseIdx].stderr && (
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-455">
                                                        Runtime Error (stderr)
                                                    </div>
                                                    <pre className="p-3 rounded-lg bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[11px] whitespace-pre-wrap select-text leading-relaxed">
                                                        {
                                                            runResult.results[activeTestCaseIdx]
                                                                .stderr
                                                        }
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Input */}
                                            {runResult.results[activeTestCaseIdx].input !==
                                                undefined &&
                                                runResult.results[activeTestCaseIdx].input !==
                                                    null && (
                                                    <div className="space-y-1.5">
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                            Input
                                                        </div>
                                                        <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[40px] whitespace-pre-wrap select-text leading-relaxed">
                                                            {runResult.results[activeTestCaseIdx]
                                                                .input || (
                                                                <span className="text-slate-450 dark:text-slate-500 italic">
                                                                    Empty input
                                                                </span>
                                                            )}
                                                        </pre>
                                                    </div>
                                                )}

                                            {/* Program Output (stdout) vs Expected Output side by side if both exist */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Your Output */}
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        Your Output
                                                    </div>
                                                    <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[50px] whitespace-pre-wrap select-text leading-relaxed">
                                                        {runResult.results[activeTestCaseIdx]
                                                            .stdout !== undefined &&
                                                        runResult.results[activeTestCaseIdx]
                                                            .stdout !== null ? (
                                                            runResult.results[activeTestCaseIdx]
                                                                .stdout
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-500 italic">
                                                                No output
                                                            </span>
                                                        )}
                                                    </pre>
                                                </div>

                                                {/* Expected Output */}
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        Expected Output
                                                    </div>
                                                    <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[50px] whitespace-pre-wrap select-text leading-relaxed">
                                                        {runResult.results[activeTestCaseIdx]
                                                            .expected_output !== undefined &&
                                                        runResult.results[activeTestCaseIdx]
                                                            .expected_output !== null ? (
                                                            runResult.results[activeTestCaseIdx]
                                                                .expected_output
                                                        ) : (
                                                            <span className="text-slate-400 dark:text-slate-500 italic">
                                                                No expected output
                                                            </span>
                                                        )}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-450 dark:text-slate-500">
                                <TerminalSquare className="h-4 w-4" />
                                <span>
                                    Click &quot;Run&quot; to execute your code against public test
                                    cases.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Collapsed Console Bar */}
            {isConsoleCollapsed && (
                <div className="h-9 shrink-0 flex items-center justify-between border-t border-border bg-muted/40 dark:bg-[#090d16] px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Console Output
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        onClick={() => {
                            setIsConsoleCollapsed(false);
                            setConsoleHeight(prevConsoleHeight > 50 ? prevConsoleHeight : 176);
                        }}
                        title="Expand Console"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
