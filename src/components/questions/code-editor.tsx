"use client";

import { useState, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Play, Loader2, ChevronDown, TerminalSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { id: 71,  label: "Python 3",   monaco: "python",  placeholder: 'print("Hello, World!")' },
    { id: 54,  label: "C++ (GCC)",  monaco: "cpp",     placeholder: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { id: 50,  label: "C (GCC)",    monaco: "c",       placeholder: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
    { id: 62,  label: "Java",       monaco: "java",    placeholder: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
] as const;

type Language = typeof LANGUAGES[number];

interface ExecutionResult {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    status?: { id: number; description: string };
    time?: string | null;
    memory?: number | null;
}

const STATUS_COLORS: Record<number, string> = {
    3: "text-emerald-400",   // Accepted
    4: "text-red-400",       // Wrong Answer
    5: "text-amber-400",     // Time Limit Exceeded
    6: "text-red-400",       // Compilation Error
    11: "text-red-400",      // Runtime Error
    13: "text-red-400",      // Internal Error
};

function statusColor(id?: number) {
    if (!id) return "text-slate-400";
    return STATUS_COLORS[id] ?? (id === 3 ? "text-emerald-400" : "text-red-400");
}

function OutputPanel({ result, error }: { result: ExecutionResult | null; error: string | null }) {
    if (error) {
        return (
            <div className="flex items-start gap-3 p-4 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex items-center gap-2 p-4 text-slate-600 text-sm">
                <TerminalSquare className="h-4 w-4" />
                <span>Run your code to see output here.</span>
            </div>
        );
    }

    const statusId = result.status?.id;
    const isAccepted = statusId === 3;
    const output = result.stdout || result.stderr || result.compile_output || result.message || "";

    return (
        <div className="flex flex-col gap-3 p-4">
            {/* Status bar */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-sm font-medium ${statusColor(statusId)}`}>
                    {isAccepted
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <AlertCircle className="h-4 w-4" />}
                    {result.status?.description ?? "Unknown"}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    {result.time && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {result.time}s
                        </span>
                    )}
                    {result.memory && (
                        <span>{(result.memory / 1024).toFixed(1)} MB</span>
                    )}
                </div>
            </div>

            {/* Output content */}
            {output ? (
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-[#070d1a] px-4 py-3 font-mono text-xs text-slate-300 leading-relaxed border border-white/5 max-h-[260px] overflow-y-auto">
                    {output}
                </pre>
            ) : (
                <p className="text-xs text-slate-600 italic">No output.</p>
            )}
        </div>
    );
}

export function CodeEditor() {
    const [lang, setLang] = useState<Language>(LANGUAGES[0]);
    const [code, setCode] = useState<string>(lang.placeholder);
    const [stdin, setStdin] = useState("");
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [execError, setExecError] = useState<string | null>(null);
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

    const handleLangChange = (l: Language) => {
        setLang(l);
        setCode(l.placeholder);
        setResult(null);
        setExecError(null);
    };

    const handleRun = async () => {
        const source = editorRef.current?.getValue() ?? code;
        if (!source.trim()) return;

        setRunning(true);
        setResult(null);
        setExecError(null);

        try {
            const res = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_code: source, language_id: lang.id, stdin }),
            });
            const data = await res.json();
            if (!res.ok) {
                setExecError(data.error ?? "Execution failed.");
            } else {
                setResult(data);
            }
        } catch {
            setExecError("Could not reach execution server.");
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-0 rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 bg-[#0a1628] px-4 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <TerminalSquare className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-semibold text-slate-200">Code Editor</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Language picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-2 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                            >
                                <span className="text-xs font-medium">{lang.label}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-[#0f1e35] border-white/10">
                            {LANGUAGES.map((l) => (
                                <DropdownMenuItem
                                    key={l.id}
                                    onClick={() => handleLangChange(l)}
                                    className={`cursor-pointer text-sm ${l.id === lang.id ? "text-sky-400 bg-sky-500/10" : "text-slate-300 hover:text-white"}`}
                                >
                                    {l.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Run button */}
                    <Button
                        size="sm"
                        className="h-8 gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4"
                        onClick={handleRun}
                        disabled={running}
                    >
                        {running
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…</>
                            : <><Play className="h-3.5 w-3.5 fill-white" /> Run</>}
                    </Button>
                </div>
            </div>

            {/* Editor + right panel */}
            <div className="flex flex-1 min-h-0">
                {/* Monaco editor */}
                <div className="flex-1 min-w-0">
                    <Editor
                        height="100%"
                        language={lang.monaco}
                        value={code}
                        onChange={(v) => setCode(v ?? "")}
                        onMount={(editor) => { editorRef.current = editor; }}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            renderLineHighlight: "line",
                            padding: { top: 16, bottom: 16 },
                            tabSize: 4,
                            wordWrap: "on",
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            bracketPairColorization: { enabled: true },
                            guides: { bracketPairs: true },
                            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                        }}
                    />
                </div>

                {/* Right panel: stdin + output */}
                <div className="flex w-[360px] shrink-0 flex-col border-l border-white/5 bg-[#080f1c]">
                    {/* Stdin */}
                    <div className="flex flex-col gap-1.5 border-b border-white/5 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Standard Input
                        </p>
                        <Textarea
                            className="h-28 resize-none font-mono text-xs bg-[#070d1a] border-white/5 text-slate-300 placeholder:text-slate-600 focus-visible:ring-sky-500/40"
                            placeholder="Enter input for your program…"
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                        />
                    </div>

                    {/* Output */}
                    <div className="flex flex-1 flex-col min-h-0">
                        <p className="shrink-0 px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Output
                        </p>
                        <div className="flex-1 overflow-y-auto">
                            <OutputPanel result={result} error={execError} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
