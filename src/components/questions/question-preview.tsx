"use client";

import "katex/dist/katex.min.css";

import {
    ChevronLeft,
    Clock,
    Database,
    FileText,
    Hash,
    Info,
    ListChecks,
    Trophy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { Label } from "../ui/label";
import { type TestCase } from "./test-case-manager";

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

    const convertMath = (content: string) => {
        if (!content) return "";
        // Convert Tiptap math spans to Markdown math
        return content.replace(
            /<span data-latex="(.*?)" data-type="(inline-math|display-math)"><\/span>/g,
            (_, latex, type) => (type === "display-math" ? `\n$$\n${latex}\n$$\n` : `$${latex}$`),
        );
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions - Hidden default back button */}
            <div className="flex items-center justify-between mb-8 opacity-0 pointer-events-none h-0 overflow-hidden">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Editor
                </Button>
            </div>

            {/* Preview Card */}
            <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm space-y-8">
                {/* Problem Title & Stats */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                            <Hash className="h-3.5 w-3.5" /> Challenge Preview
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-foreground">
                            {title || "Untitled Problem"}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-xs bg-muted/40 px-3 py-1.5 rounded-full border border-border/40">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-semibold text-muted-foreground">
                                {score} Points
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs bg-muted/40 px-3 py-1.5 rounded-full border border-border/40">
                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold text-muted-foreground">
                                {timeLimit}ms
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs bg-muted/40 px-3 py-1.5 rounded-full border border-border/40">
                            <Database className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="font-semibold text-muted-foreground">
                                {memoryLimit}MB
                            </span>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border",
                                difficulty === "EASY"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/20"
                                    : difficulty === "MEDIUM"
                                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/20"
                                      : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:bg-red-500/20",
                            )}
                        >
                            {difficulty}
                        </Badge>
                    </div>
                </div>

                <Separator className="bg-border/60" />

                {/* Main Content */}
                <div className="space-y-10">
                    {/* Description */}
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="flex items-center gap-2 mb-4 group">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h2 className="text-xl font-bold tracking-tight m-0 text-foreground">
                                Problem Statement
                            </h2>
                        </div>
                        <div className="text-foreground/90 leading-relaxed text-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath] as any}
                                rehypePlugins={[rehypeKatex] as any}
                                components={markdownComponents as any}
                            >
                                {convertMath(description) || "_No description provided yet._"}
                            </ReactMarkdown>
                        </div>
                    </section>

                    <Separator className="bg-border/40" />

                    {/* Input/Output Format */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                                    <Info className="h-4 w-4" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight m-0 text-foreground">
                                    Input Format
                                </h2>
                            </div>
                            <div className="text-foreground/90 leading-relaxed text-sm">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath] as any}
                                    rehypePlugins={[rehypeKatex] as any}
                                    components={markdownComponents as any}
                                >
                                    {convertMath(inputFormat) || "_No input format specified._"}
                                </ReactMarkdown>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <ListChecks className="h-4 w-4" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight m-0 text-foreground">
                                    Output Format
                                </h2>
                            </div>
                            <div className="text-foreground/90 leading-relaxed text-sm">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath] as any}
                                    rehypePlugins={[rehypeKatex] as any}
                                    components={markdownComponents as any}
                                >
                                    {convertMath(outputFormat) || "_No output format specified._"}
                                </ReactMarkdown>
                            </div>
                        </section>
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Constraints */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                <ListChecks className="h-4 w-4" />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight m-0 text-foreground">
                                Constraints
                            </h2>
                        </div>
                        <div className="bg-muted/30 border border-border/40 rounded-xl p-5 text-sm text-foreground/90 leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath] as any}
                                rehypePlugins={[rehypeKatex] as any}
                                components={markdownComponents as any}
                            >
                                {convertMath(constraints) || "_No specific constraints defined._"}
                            </ReactMarkdown>
                        </div>
                    </section>

                    {/* Notes */}
                    {notes && (
                        <>
                            <Separator className="bg-border/40" />
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight m-0 text-foreground">
                                        Notes
                                    </h2>
                                </div>
                                <div className="bg-primary/5 border border-primary/15 text-muted-foreground rounded-xl p-5 text-sm italic">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath] as any}
                                        rehypePlugins={[rehypeKatex] as any}
                                        components={markdownComponents as any}
                                    >
                                        {convertMath(notes)}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Example Test Cases */}
                    {testCases.filter((tc) => !tc.is_hidden).length > 0 && (
                        <>
                            <Separator className="bg-border/40" />
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <ListChecks className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-lg font-bold tracking-tight m-0 text-foreground">
                                        Examples
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {testCases
                                        .filter((tc) => !tc.is_hidden)
                                        .map((tc, idx) => (
                                            <div key={tc.id} className="space-y-3">
                                                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1 flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    Example #{idx + 1}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">
                                                            Input
                                                        </Label>
                                                        <pre className="bg-muted/40 p-4 rounded-xl border border-border/40 font-mono text-xs min-h-[60px] whitespace-pre-wrap text-foreground/90">
                                                            {tc.input || "No input"}
                                                        </pre>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">
                                                            Expected Output
                                                        </Label>
                                                        <pre className="bg-primary/5 p-4 rounded-xl border border-primary/10 font-mono text-xs min-h-[60px] whitespace-pre-wrap text-foreground/90">
                                                            {tc.output || "No output"}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
