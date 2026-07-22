/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Editor from "@monaco-editor/react";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Cpu,
    History,
    Loader2,
    Play,
    Save,
    Send,
    Terminal,
    TerminalSquare,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { StudentCodeRunResponse } from "@/api/generated/model";
import { SqlResultTable } from "@/components/shared/sql-result-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContestSessionAppearance } from "@/lib/providers/contest-session-appearance-provider";
import { cn } from "@/lib/utils";

export const LANGUAGES = [
    { id: 71, label: "Python 3", monaco: "python" },
    { id: 54, label: "C++ (GCC)", monaco: "cpp" },
    { id: 50, label: "C (GCC)", monaco: "c" },
    { id: 62, label: "Java", monaco: "java" },
    { id: 82, label: "SQL (SQLite)", monaco: "sql" },
] as const;

const SQL_LANGUAGE_ID = 82;

interface EditorPanelProps {
    selectedLanguageId: number;
    setSelectedLanguageIdState: (langId: number) => void;
    currentTemplates: any[];
    isSaving: boolean;
    handleManualSave: () => void;
    isTeamMode: boolean;
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
    onSubmit?: () => void;
    isRunning: boolean;
    isSubmitting: boolean;
    runResult: StudentCodeRunResponse | null;
    consoleTab: "output" | "submissions";
    setConsoleTab: (tab: "output" | "submissions") => void;
    submissions: any[];
    isSubmissionsLoading: boolean;
    isSubmitDisabled?: boolean;
    maxSubmission?: number | null;
    submissionsCount: number;
}

export function EditorPanel({
    selectedLanguageId,
    setSelectedLanguageIdState,
    currentTemplates,
    isSaving,
    handleManualSave,
    isTeamMode: _isTeamMode,
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
    onSubmit,
    isRunning,
    isSubmitting,
    runResult,
    consoleTab,
    setConsoleTab,
    submissions,
    isSubmissionsLoading,
    isSubmitDisabled = false,
    maxSubmission,
    submissionsCount,
}: EditorPanelProps) {
    const activeLang = LANGUAGES.find((l) => l.id === selectedLanguageId);
    const isSql = selectedLanguageId === SQL_LANGUAGE_ID;
    const { editorTheme } = useContestSessionAppearance();
    const [mounted, setMounted] = useState(false);
    const [activeTestCaseIdx, setActiveTestCaseIdx] = useState<number>(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getLanguageLabel = (langId: number) => {
        return LANGUAGES.find((l) => l.id === langId)?.label || `Lang #${langId}`;
    };

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch {
            return isoString;
        }
    };

    const renderStatusBadge = (status: string | null | undefined) => {
        if (!status) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    Evaluating
                </span>
            );
        }
        switch (status) {
            case "AC":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3" />
                        Accepted
                    </span>
                );
            case "WA":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/25">
                        <XCircle className="h-3 w-3" />
                        Wrong Answer
                    </span>
                );
            case "TLE":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/25">
                        <Clock className="h-3 w-3" />
                        Time Limit Exceeded
                    </span>
                );
            case "MLE":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/25">
                        <Cpu className="h-3 w-3" />
                        Memory Limit Exceeded
                    </span>
                );
            case "RE":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-450 border border-orange-500/25">
                        <AlertTriangle className="h-3 w-3" />
                        Runtime Error
                    </span>
                );
            case "CE":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-655 dark:text-slate-400 border border-slate-500/25">
                        <Terminal className="h-3 w-3" />
                        Compile Error
                    </span>
                );
            case "SYSTEM_ERROR":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/25">
                        <AlertTriangle className="h-3 w-3" />
                        System Error
                    </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        Pending
                    </span>
                );
            case "QUEUED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                        Queued
                    </span>
                );
            case "RUNNING":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        Running
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/25">
                        <AlertTriangle className="h-3 w-3" />
                        System Error
                    </span>
                );
        }
    };

    useEffect(() => {
        if (runResult) {
            setActiveTestCaseIdx(0);
        }
    }, [runResult]);

    const currentTheme = mounted ? editorTheme : "light";

    const hasRunningSubmission = submissions.some((s) => {
        const statusStr = (s.status as string) || "";
        return (
            statusStr === "QUEUED" ||
            statusStr === "RUNNING" ||
            statusStr === "PENDING" ||
            !s.status
        );
    });

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
                        disabled={isRunning || isSubmitting}
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
                        onClick={onSubmit}
                        disabled={isSubmitting || isRunning || isSubmitDisabled}
                        className={cn(
                            "h-7 gap-1 border text-xs font-semibold px-2.5 transition-all",
                            isSubmitting || isSubmitDisabled
                                ? "bg-muted/40 border-border text-muted-foreground"
                                : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                Submitting
                            </>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                {maxSubmission && maxSubmission > 0 ? (
                                    <>
                                        Submit ({submissionsCount}/{maxSubmission})
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </>
                        )}
                    </Button>
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
                        readOnly: false,
                        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    }}
                />
            </div>{" "}
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
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setConsoleTab("output")}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider border-b-2 py-1.5 transition-colors outline-none",
                                    consoleTab === "output"
                                        ? "text-indigo-650 dark:text-indigo-400 border-indigo-500 font-extrabold"
                                        : "text-slate-500 border-transparent hover:text-slate-850 dark:hover:text-slate-200 font-bold",
                                )}
                            >
                                Console Output
                            </button>
                            <button
                                onClick={() => setConsoleTab("submissions")}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider border-b-2 py-1.5 transition-colors outline-none flex items-center gap-1.5",
                                    consoleTab === "submissions"
                                        ? "text-indigo-650 dark:text-indigo-400 border-indigo-500 font-extrabold"
                                        : "text-slate-500 border-transparent hover:text-slate-850 dark:hover:text-slate-200 font-bold",
                                )}
                            >
                                Submissions
                                {hasRunningSubmission && (
                                    <Loader2 className="h-3 w-3 animate-spin text-indigo-500 dark:text-indigo-400" />
                                )}
                            </button>
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

                    <div className="flex-1 p-4 overflow-y-auto leading-normal">
                        {consoleTab === "output" ? (
                            <div className="font-mono text-xs h-full">
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
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20 shadow-sm shadow-rose-500/5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                        Some Test Cases Failed
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-455 dark:text-slate-500 font-medium">
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
                                                            onClick={() =>
                                                                setActiveTestCaseIdx(idx)
                                                            }
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
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].passed
                                                                        ? "text-emerald-500"
                                                                        : "text-rose-500",
                                                                )}
                                                            >
                                                                {
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].status_description
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-455 font-medium">
                                                            <span>Time:</span>
                                                            <span className="text-slate-700 dark:text-slate-350">
                                                                {(
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].time * 1000
                                                                ).toFixed(0)}{" "}
                                                                ms
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-455 font-medium">
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
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].compile_output
                                                                }
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {/* Runtime Error (stderr) if any */}
                                                    {runResult.results[activeTestCaseIdx]
                                                        .stderr && (
                                                        <div className="space-y-1.5">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-455">
                                                                Runtime Error (stderr)
                                                            </div>
                                                            <pre className="p-3 rounded-lg bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[11px] whitespace-pre-wrap select-text leading-relaxed">
                                                                {
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].stderr
                                                                }
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {/* Input */}
                                                    {runResult.results[activeTestCaseIdx].input !==
                                                        undefined &&
                                                        runResult.results[activeTestCaseIdx]
                                                            .input !== null && (
                                                            <div className="space-y-1.5">
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                    {isSql
                                                                        ? "Schema & Seed Data"
                                                                        : "Input"}
                                                                </div>
                                                                <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[40px] whitespace-pre-wrap select-text leading-relaxed">
                                                                    {runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].input || (
                                                                        <span className="text-slate-455 dark:text-slate-500 italic">
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
                                                                {isSql
                                                                    ? "Your Result"
                                                                    : "Your Output"}
                                                            </div>
                                                            {isSql ? (
                                                                <SqlResultTable
                                                                    text={
                                                                        runResult.results[
                                                                            activeTestCaseIdx
                                                                        ].stdout
                                                                    }
                                                                    emptyLabel="No output"
                                                                />
                                                            ) : (
                                                                <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[50px] whitespace-pre-wrap select-text leading-relaxed">
                                                                    {runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].stdout !== undefined &&
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].stdout !== null ? (
                                                                        runResult.results[
                                                                            activeTestCaseIdx
                                                                        ].stdout
                                                                    ) : (
                                                                        <span className="text-slate-400 dark:text-slate-500 italic">
                                                                            No output
                                                                        </span>
                                                                    )}
                                                                </pre>
                                                            )}
                                                        </div>

                                                        {/* Expected Output */}
                                                        <div className="space-y-1.5">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                                {isSql
                                                                    ? "Expected Result"
                                                                    : "Expected Output"}
                                                            </div>
                                                            {isSql ? (
                                                                <SqlResultTable
                                                                    text={
                                                                        runResult.results[
                                                                            activeTestCaseIdx
                                                                        ].expected_output
                                                                    }
                                                                    emptyLabel="No expected result"
                                                                />
                                                            ) : (
                                                                <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/85 text-slate-800 dark:text-slate-300 font-mono text-[11px] min-h-[50px] whitespace-pre-wrap select-text leading-relaxed">
                                                                    {runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].expected_output !==
                                                                        undefined &&
                                                                    runResult.results[
                                                                        activeTestCaseIdx
                                                                    ].expected_output !== null ? (
                                                                        runResult.results[
                                                                            activeTestCaseIdx
                                                                        ].expected_output
                                                                    ) : (
                                                                        <span className="text-slate-400 dark:text-slate-500 italic">
                                                                            No expected output
                                                                        </span>
                                                                    )}
                                                                </pre>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-455 dark:text-slate-500 h-full">
                                        <TerminalSquare className="h-4 w-4" />
                                        <span>
                                            Click &quot;Run&quot; to execute your code against
                                            public test cases.
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col text-slate-850 dark:text-slate-200">
                                {isSubmissionsLoading && submissions.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                        <span className="text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse">
                                            Loading submissions...
                                        </span>
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-455 dark:text-slate-500 py-8 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg">
                                        <History className="h-6 w-6 text-slate-400" />
                                        <span className="text-xs font-semibold">
                                            No submissions yet for this question.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0">
                                        {hasRunningSubmission && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 text-indigo-650 dark:text-indigo-400 mb-4 animate-pulse shrink-0">
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                                <span className="text-xs font-semibold">
                                                    Evaluating submission in real-time. Please
                                                    wait...
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-455 dark:text-slate-500">
                                                        <th className="pb-2 pl-2">Status</th>
                                                        <th className="pb-2">Score</th>
                                                        <th className="pb-2">Testcases</th>
                                                        <th className="pb-2">Language</th>
                                                        <th className="pb-2 pr-2 text-right">
                                                            Submitted At
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                                    {submissions.map((sub) => (
                                                        <tr
                                                            key={sub.id}
                                                            className="text-xs hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors"
                                                        >
                                                            <td className="py-2.5 pl-2">
                                                                {renderStatusBadge(sub.status)}
                                                            </td>
                                                            <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                                                                {sub.score} pts
                                                            </td>
                                                            <td className="py-2.5 text-slate-655 dark:text-slate-400">
                                                                {sub.passed_testcases} /{" "}
                                                                {sub.total_testcases}
                                                            </td>
                                                            <td className="py-2.5 text-slate-500 dark:text-slate-450">
                                                                {getLanguageLabel(sub.language_id)}
                                                            </td>
                                                            <td className="py-2.5 pr-2 text-right text-slate-450 dark:text-slate-500">
                                                                {formatTime(sub.created_at)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Collapsed Console Bar */}
            {isConsoleCollapsed && (
                <div className="h-9 shrink-0 flex items-center justify-between border-t border-border bg-muted/40 dark:bg-[#090d16] px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {consoleTab === "output" ? "Console Output" : "Submissions"}
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
