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
    Unlock,
    Lock,
    TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}: EditorPanelProps) {
    const activeLang = LANGUAGES.find((l) => l.id === selectedLanguageId);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

                    {isTeamMode && (
                        <div className="flex items-center gap-2">
                            {isCurrentEditor ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[9px] uppercase font-bold tracking-widest">
                                    <Unlock className="h-2.5 w-2.5 mr-1" />
                                    Editor Lock Active
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent text-[9px] uppercase font-bold tracking-widest">
                                    <Lock className="h-2.5 w-2.5 mr-1" />
                                    Read Only Workspace
                                </Badge>
                            )}
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
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="h-6 text-[10px] uppercase font-bold border border-border bg-muted/40 text-muted-foreground"
                            >
                                Run
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="h-6 text-[10px] uppercase font-bold border border-border bg-muted/40 text-muted-foreground"
                            >
                                Submit
                            </Button>
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

                    <div className="flex-1 p-4 font-mono text-xs text-slate-600 dark:text-slate-400 overflow-y-auto leading-normal">
                        <div className="flex items-center gap-2 text-slate-450 dark:text-slate-600">
                            <TerminalSquare className="h-4 w-4" />
                            <span>Code execution is currently unavailable in preview mode.</span>
                        </div>
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
