"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
    Play,
    Send,
    Loader2,
    ChevronDown,
    TerminalSquare,
    AlertCircle,
    CheckCircle2,
    Clock,
    Settings,
    Maximize2,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ContestIDEProps {
    questionId: string;
    allowedLanguages: { id: number; name: string; monaco: string; starterCode: string }[];
    onRun: (code: string, languageId: number, stdin: string) => Promise<any>;
    onSubmit: (code: string, languageId: number) => Promise<any>;
    initialCode?: string;
    initialLanguageId?: number;
}

export function ContestIDE({
    questionId,
    allowedLanguages,
    onRun,
    onSubmit,
    initialCode,
    initialLanguageId,
}: ContestIDEProps) {
    const [selectedLang, setSelectedLang] = useState(
        allowedLanguages.find((l) => l.id === initialLanguageId) || allowedLanguages[0],
    );
    const [code, setCode] = useState(initialCode || selectedLang?.starterCode || "");
    const [stdin, setStdin] = useState("");
    const [activeTab, setActiveTab] = useState("output");
    const [isRunning, setRunning] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = useRef<any>(null);

    const handleLangChange = (lang: typeof selectedLang) => {
        setSelectedLang(lang);
        // Reset code to starter template when language changes
        setCode(lang.starterCode);
    };

    const handleRun = async () => {
        setRunning(true);
        setError(null);
        setActiveTab("output");
        try {
            const res = await onRun(code, selectedLang.id, stdin);
            setResult(res);
        } catch (e: any) {
            setError(e.message || "Failed to run code");
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit(code, selectedLang.id);
        } catch (e: any) {
            setError(e.message || "Failed to submit code");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset the code to the starter template?")) {
            setCode(selectedLang.starterCode);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-slate-300 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#21262d] border-white/10 hover:bg-[#30363d] text-xs h-8 gap-2"
                            >
                                {selectedLang.name}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#161b22] border-white/10">
                            {allowedLanguages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.id}
                                    onClick={() => handleLangChange(lang)}
                                    className="text-xs focus:bg-primary/10 focus:text-primary cursor-pointer"
                                >
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-white/10" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-200"
                        onClick={handleReset}
                        title="Reset Code"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-2 text-xs font-semibold px-4"
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                    >
                        {isRunning ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Play className="h-3.5 w-3.5" />
                        )}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 gap-2 text-xs font-bold px-5 bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        Submit
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={selectedLang.monaco}
                        theme="vs-dark"
                        value={code}
                        onChange={(v) => setCode(v || "")}
                        onMount={(editor) => {
                            editorRef.current = editor;
                        }}
                        options={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20 },
                            lineNumbers: "on",
                            folding: true,
                            bracketPairColorization: { enabled: true },
                            formatOnPaste: true,
                            formatOnType: true,
                        }}
                    />
                </div>

                {/* Bottom Panel (Tabs) */}
                <div className="h-1/3 min-h-[200px] border-t border-white/5 bg-[#0d1117] flex flex-col">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1 flex flex-col"
                    >
                        <div className="px-4 border-b border-white/5 bg-[#161b22]/50 flex items-center justify-between shrink-0">
                            <TabsList className="bg-transparent h-10 gap-4">
                                <TabsTrigger
                                    value="output"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs font-semibold h-10 px-0"
                                >
                                    Test Results
                                </TabsTrigger>
                                <TabsTrigger
                                    value="stdin"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs font-semibold h-10 px-0"
                                >
                                    Custom Input
                                </TabsTrigger>
                            </TabsList>

                            {isRunning && (
                                <Badge
                                    variant="outline"
                                    className="h-5 gap-1.5 border-primary/20 text-primary animate-pulse bg-primary/5"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                    Executing...
                                </Badge>
                            )}
                        </div>

                        <div className="flex-1 min-h-0">
                            <TabsContent value="output" className="h-full m-0 p-0 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="p-4 space-y-4">
                                        {error ? (
                                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3 text-destructive">
                                                <AlertCircle className="h-5 w-5 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold">
                                                        Execution Error
                                                    </p>
                                                    <p className="text-xs font-mono opacity-80 whitespace-pre-wrap">
                                                        {error}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : result ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "h-8 w-8 rounded-lg flex items-center justify-center",
                                                                result.passed
                                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                                    : "bg-red-500/10 text-red-500",
                                                            )}
                                                        >
                                                            {result.passed ? (
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            ) : (
                                                                <AlertCircle className="h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {result.passed
                                                                    ? "Accepted"
                                                                    : "Wrong Answer"}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                Passed {result.passed_count}/
                                                                {result.total_count} test cases
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                                Time
                                                            </p>
                                                            <p className="text-xs font-mono font-bold">
                                                                {result.time || "0.00"}s
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                                Memory
                                                            </p>
                                                            <p className="text-xs font-mono font-bold">
                                                                {result.memory || "0.0"}MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {result.testcases?.map((tc: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="rounded-lg bg-white/5 border border-white/5 overflow-hidden"
                                                    >
                                                        <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                                                                Case #{i + 1}
                                                            </span>
                                                            <Badge
                                                                variant={
                                                                    tc.passed
                                                                        ? "default"
                                                                        : "destructive"
                                                                }
                                                                className={cn(
                                                                    "text-[9px] h-4",
                                                                    tc.passed &&
                                                                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
                                                                )}
                                                            >
                                                                {tc.status}
                                                            </Badge>
                                                        </div>
                                                        {(tc.stdout ||
                                                            tc.stderr ||
                                                            tc.compile_output) && (
                                                            <pre className="p-3 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                                                {tc.stdout ||
                                                                    tc.stderr ||
                                                                    tc.compile_output}
                                                            </pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-3">
                                                <TerminalSquare className="h-10 w-10 opacity-20" />
                                                <p className="text-xs italic">
                                                    Run code against sample tests to see output
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="stdin" className="h-full m-0 p-0">
                                <textarea
                                    className="w-full h-full bg-transparent p-4 font-mono text-xs outline-none resize-none placeholder:opacity-30"
                                    placeholder="Enter custom input to test your program..."
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
