"use client";

import { useState, useEffect } from "react";
import { useGetContestDetailsApiV1StudentsContestsContestIdGet as useContestDetails } from "@/api/generated/students/students";
import { useRunCodeApiV1ExecutionRunPost as useRunCode } from "@/api/generated/execution/execution";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { ContestIDE } from "../ide/contest-ide";
import { useRealtime } from "@/lib/providers/realtime-provider";
import { useClockSync } from "@/lib/hooks/use-clock-sync";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Clock, ChevronRight, BookOpen, Layout, ListTodo, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

interface StudentContestViewProps {
    contestId: string;
}

export function StudentContestView({ contestId }: StudentContestViewProps) {
    const { subscribe, unsubscribe } = useRealtime();
    const { getServerTime } = useClockSync();
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

    const { data: contestData, isLoading, isError, error, refetch } = useContestDetails(contestId);

    const runCodeMutation = useRunCode();

    const contest = contestData;
    const problems = (contest as any)?.problems || [];

    // Derive selected problem based on state or default to first problem
    const activeProblemId = selectedProblemId || problems[0]?.id;
    const selectedProblem = problems.find((p: any) => p.id === activeProblemId);

    useEffect(() => {
        subscribe(contestId);
        return () => unsubscribe();
    }, [contestId, subscribe, unsubscribe]);

    const handleRun = async (code: string, languageId: number, stdin: string) => {
        return runCodeMutation.mutateAsync({
            data: {
                question_id: (selectedProblem as any).id,
                source_code: code,
                language_id: languageId,
            },
        });
    };

    const handleSubmit = async (code: string, languageId: number) => {
        // TODO: Implement official submission
        console.log("Submitting code...", { code, languageId });
        throw new Error("Contest submission is not yet implemented.");
    };

    // Hardcoded languages for now until I fetch them from API
    const ALLOWED_LANGUAGES = [
        { id: 71, name: "Python 3", monaco: "python", starterCode: 'print("Hello, World!")' },
        {
            id: 54,
            name: "C++ (GCC)",
            monaco: "cpp",
            starterCode:
                '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
        },
        {
            id: 62,
            name: "Java",
            monaco: "java",
            starterCode:
                'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        },
    ];

    return (
        <AuthGuard requiredGroups={[UserType.STUDENT, UserType.ADMIN]}>
            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
            >
                <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
                    {/* Left Sidebar: Problem List */}
                    <div className="w-80 border-r border-border bg-card flex flex-col shrink-0">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-4 w-4 text-primary" />
                                <h2 className="font-bold text-sm truncate">
                                    {(contest as any)?.name}
                                </h2>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    02:45:12 Remaining
                                </span>
                                <Badge
                                    variant="outline"
                                    className="text-[9px] h-4 bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                                >
                                    Running
                                </Badge>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Problems ({problems.length})
                                </p>
                                {problems.map((p: any) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProblemId(p.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group",
                                            selectedProblemId === p.id
                                                ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={cn(
                                                    "h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                                                    selectedProblemId === p.id
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted-foreground/10",
                                                )}
                                            >
                                                {String.fromCharCode(65 + problems.indexOf(p))}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate leading-tight">
                                                    {p.title}
                                                </p>
                                                <p className="text-[9px] opacity-60 mt-0.5">
                                                    {p.difficulty} • {p.score} pts
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={cn(
                                                "h-3.5 w-3.5 opacity-0 transition-all",
                                                selectedProblemId === p.id
                                                    ? "opacity-100 translate-x-0"
                                                    : "group-hover:opacity-40 -translate-x-1",
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Center: Problem Statement */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-border">
                        <div className="p-6 border-b border-border bg-card">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge
                                    variant="outline"
                                    className="bg-primary/5 text-primary border-primary/20 h-5 text-[10px] font-bold px-2"
                                >
                                    Problem{" "}
                                    {String.fromCharCode(
                                        65 + problems.indexOf(selectedProblem || problems[0]),
                                    )}
                                </Badge>
                                <h1 className="text-xl font-bold tracking-tight">
                                    {(selectedProblem as any)?.title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-6 text-[11px] text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Layout className="h-3.5 w-3.5 opacity-60" />
                                    {(selectedProblem as any)?.score} Points
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 opacity-60" />
                                    {(selectedProblem as any)?.duration
                                        ? `${(selectedProblem as any).duration}s`
                                        : "No limit"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5 opacity-60" />
                                    {(selectedProblem as any)?.difficulty}
                                </span>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 bg-card/50">
                            <div className="p-8 max-w-4xl mx-auto prose dark:prose-invert prose-sm prose-headings:font-bold prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                                {/* Mock problem text if not available */}
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {(selectedProblem as any)?.question_text ||
                                        "### Loading problem statement..."}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right: IDE */}
                    <div className="w-[50%] shrink-0 flex flex-col bg-muted/20">
                        <div className="flex-1 p-2">
                            {selectedProblem && (
                                <ContestIDE
                                    questionId={selectedProblem.id}
                                    allowedLanguages={ALLOWED_LANGUAGES}
                                    onRun={handleRun}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </AsyncStateHandler>
        </AuthGuard>
    );
}
