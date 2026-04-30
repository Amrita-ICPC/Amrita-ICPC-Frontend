"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    FileText,
    Info,
    ListChecks,
    Hash,
    Clock,
    Database,
    Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { type TestCase } from "./test-case-manager";
import { Label } from "../ui/label";

interface ProblemPreviewProps {
    title: string;
    difficulty: string;
    timeLimit: number;
    memoryLimit: number;
    score: number;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    notes: string;
    testCases?: TestCase[];
    onBack: () => void;
}

export function ProblemPreview({
    title,
    difficulty,
    timeLimit,
    memoryLimit,
    score,
    description,
    inputFormat,
    outputFormat,
    constraints,
    notes,
    testCases = [],
    onBack,
}: ProblemPreviewProps) {
    const markdownComponents = {
        h1: ({ ...props }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />
        ),
        h2: ({ ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
        h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
        p: ({ ...props }) => <p className="leading-relaxed mb-4 text-foreground/90" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
        ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
        li: ({ ...props }) => <li className="pl-1" {...props} />,
        code: ({ ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
        ),
        pre: ({ ...props }) => (
            <pre
                className="bg-muted/50 p-4 rounded-xl border mb-6 overflow-x-auto font-mono text-sm"
                {...props}
            />
        ),
        blockquote: ({ ...props }) => (
            <blockquote
                className="border-l-4 border-primary/30 pl-4 italic my-6 text-muted-foreground"
                {...props}
            />
        ),
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Editor
                </Button>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20"
                    >
                        Preview Mode
                    </Badge>
                </div>
            </div>

            {/* Problem Title & Stats */}
            <div className="space-y-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                        <Hash className="h-3 w-3" /> Challenge
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        {title || "Untitled Problem"}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2 text-sm bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-foreground/70">{score} Points</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-foreground/70">{timeLimit}ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                        <Database className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-foreground/70">{memoryLimit}MB</span>
                    </div>
                    <Badge
                        className={cn(
                            "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider",
                            difficulty === "EASY"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : difficulty === "MEDIUM"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-destructive/10 text-destructive border-destructive/20",
                        )}
                    >
                        {difficulty}
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
                {/* Description */}
                <section className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="flex items-center gap-2 mb-6 group">
                        <div className="h-8 w-1 bg-primary rounded-full" />
                        <h2 className="text-2xl font-bold tracking-tight m-0">Problem Statement</h2>
                    </div>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath] as any}
                        rehypePlugins={[rehypeKatex] as any}
                        components={markdownComponents as any}
                    >
                        {description || "_No description provided yet._"}
                    </ReactMarkdown>
                </section>

                <Separator className="bg-border/40" />

                {/* Input/Output Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Info className="h-4 w-4" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight m-0">Input Format</h2>
                        </div>
                        <div className="text-foreground/90 leading-relaxed text-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath] as any}
                                rehypePlugins={[rehypeKatex] as any}
                                components={markdownComponents as any}
                            >
                                {inputFormat || "_No input format specified._"}
                            </ReactMarkdown>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <ListChecks className="h-4 w-4" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight m-0">Output Format</h2>
                        </div>
                        <div className="text-foreground/90 leading-relaxed text-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath] as any}
                                rehypePlugins={[rehypeKatex] as any}
                                components={markdownComponents as any}
                            >
                                {outputFormat || "_No output format specified._"}
                            </ReactMarkdown>
                        </div>
                    </section>
                </div>

                {/* Constraints */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <ListChecks className="h-4 w-4" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight m-0">Constraints</h2>
                    </div>
                    <div className="bg-muted/30 border border-border/40 rounded-2xl p-6 prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath] as any}
                            rehypePlugins={[rehypeKatex] as any}
                            components={markdownComponents as any}
                        >
                            {constraints || "_No specific constraints defined._"}
                        </ReactMarkdown>
                    </div>
                </section>

                {/* Notes */}
                {notes && (
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="h-4 w-4" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight m-0">Notes</h2>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 prose prose-sm dark:prose-invert max-w-none italic text-muted-foreground">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath] as any}
                                rehypePlugins={[rehypeKatex] as any}
                                components={markdownComponents as any}
                            >
                                {notes}
                            </ReactMarkdown>
                        </div>
                    </section>
                )}

                {/* Example Test Cases */}
                {testCases.filter((tc) => !tc.is_hidden).length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <ListChecks className="h-4 w-4" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight m-0">Examples</h2>
                        </div>

                        <div className="space-y-12">
                            {testCases
                                .filter((tc) => !tc.is_hidden)
                                .map((tc, idx) => (
                                    <div key={tc.id} className="space-y-4">
                                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 px-2 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            Example #{idx + 1}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">
                                                    Input
                                                </Label>
                                                <pre className="bg-muted/50 p-4 rounded-2xl border border-border/40 font-mono text-sm min-h-[80px]">
                                                    {tc.input || "No input"}
                                                </pre>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">
                                                    Expected Output
                                                </Label>
                                                <pre className="bg-primary/5 p-4 rounded-2xl border border-primary/10 font-mono text-sm min-h-[80px]">
                                                    {tc.output || "No output"}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
