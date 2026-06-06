"use client";

import "katex/dist/katex.min.css";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProblemViewProps {
    questionDetails: any;
    isLoading: boolean;
}

const convertMath = (content: string) => {
    if (!content) return "";
    // Convert Tiptap math spans to Markdown math
    return content.replace(
        /<span data-latex="(.*?)" data-type="(inline-math|display-math)"><\/span>/g,
        (_, latex, type) => (type === "display-math" ? `\n$$\n${latex}\n$$\n` : `$${latex}$`),
    );
};

const markdownComponents = {
    h1: ({ ...props }) => (
        <h1
            className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1"
            {...props}
        />
    ),
    h2: ({ ...props }) => (
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-2" {...props} />
    ),
    h3: ({ ...props }) => (
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-3 mb-1" {...props} />
    ),
    p: ({ ...props }) => (
        <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed text-xs" {...props} />
    ),
    ul: ({ ...props }) => (
        <ul
            className="list-disc pl-5 mb-3 text-xs text-slate-700 dark:text-slate-300 space-y-1"
            {...props}
        />
    ),
    ol: ({ ...props }) => (
        <ol
            className="list-decimal pl-5 mb-3 text-xs text-slate-700 dark:text-slate-300 space-y-1"
            {...props}
        />
    ),
    li: ({ ...props }) => <li className="pl-0.5" {...props} />,
    pre: ({ ...props }) => (
        <pre
            className="bg-slate-100 dark:bg-[#070b13] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 my-3.5 overflow-x-auto leading-normal"
            {...props}
        />
    ),
    code: ({ ...props }) => (
        <code
            className="bg-slate-100 dark:bg-[#070b13] px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono text-xs"
            {...props}
        />
    ),
    table: ({ ...props }) => (
        <table
            className="w-full text-left border-collapse my-3 border border-slate-200 dark:border-slate-800 text-xs"
            {...props}
        />
    ),
    th: ({ ...props }) => (
        <th
            className="border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
            {...props}
        />
    ),
    td: ({ ...props }) => (
        <td
            className="border border-slate-200 dark:border-slate-800 p-2 text-xs text-slate-750 dark:text-slate-300"
            {...props}
        />
    ),
    blockquote: ({ ...props }) => (
        <blockquote
            className="border-l-4 border-indigo-550/30 pl-4 italic my-3.5 text-xs text-slate-500 dark:text-slate-400"
            {...props}
        />
    ),
};

export function ProblemView({ questionDetails, isLoading }: ProblemViewProps) {
    let parsedQuestion: {
        description?: string;
        input?: string;
        output?: string;
        constraints?: string;
        notes?: string;
    } | null = null;

    try {
        if (questionDetails?.question_text) {
            parsedQuestion = JSON.parse(questionDetails.question_text);
        }
    } catch {
        // Fallback to treating it as raw text
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-[#0c101d] overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800/50">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800" />
                        <Skeleton className="h-36 w-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                ) : (
                    <>
                        {/* Title and Difficulty */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                {questionDetails?.title || "Problem Description"}
                            </h2>
                            {questionDetails?.difficulty && (
                                <Badge
                                    className={cn(
                                        "text-[10px] font-extrabold uppercase tracking-widest border border-transparent px-2.5 py-0.5",
                                        questionDetails.difficulty === "EASY"
                                            ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
                                            : questionDetails.difficulty === "MEDIUM"
                                              ? "bg-amber-500/10 text-amber-650 dark:text-amber-400"
                                              : "bg-rose-500/10 text-rose-650 dark:text-rose-400",
                                    )}
                                >
                                    {questionDetails.difficulty}
                                </Badge>
                            )}
                        </div>

                        {/* Markdown / JSON rendering */}
                        {parsedQuestion ? (
                            <div className="space-y-5">
                                {parsedQuestion.description && (
                                    <div className="space-y-1.5">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath] as any}
                                            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                            components={markdownComponents as any}
                                        >
                                            {convertMath(parsedQuestion.description)}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {parsedQuestion.input && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            Input Format
                                        </h3>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath] as any}
                                            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                            components={markdownComponents as any}
                                        >
                                            {convertMath(parsedQuestion.input)}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {parsedQuestion.output && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            Output Format
                                        </h3>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath] as any}
                                            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                            components={markdownComponents as any}
                                        >
                                            {convertMath(parsedQuestion.output)}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {parsedQuestion.constraints && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            Constraints
                                        </h3>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath] as any}
                                            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                            components={markdownComponents as any}
                                        >
                                            {convertMath(parsedQuestion.constraints)}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {parsedQuestion.notes && (
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            Notes
                                        </h3>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkMath] as any}
                                            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                            components={markdownComponents as any}
                                        >
                                            {convertMath(parsedQuestion.notes)}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questionDetails?.question_text ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath] as any}
                                        rehypePlugins={[rehypeRaw, rehypeKatex] as any}
                                        components={markdownComponents as any}
                                    >
                                        {convertMath(questionDetails.question_text)}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="h-40 flex items-center justify-center text-slate-500 dark:text-slate-600 text-xs italic">
                                        No description details available.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags Section */}
                        {questionDetails?.tags && questionDetails.tags.length > 0 && (
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Tags
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {questionDetails.tags.map((t: any) => (
                                        <Badge
                                            key={t.id}
                                            variant="outline"
                                            className="border-slate-200 dark:border-slate-800 text-[10px] text-slate-650 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/40"
                                        >
                                            {t.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Limits and Environment at the bottom */}
                        {questionDetails && (
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Limits & Environment
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Time Limit
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-white bg-slate-200/50 dark:bg-slate-950/80 border border-slate-350 dark:border-slate-850 px-2.5 py-1 rounded-lg">
                                            {questionDetails.time_limit_ms} ms
                                        </span>
                                    </div>
                                    <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Memory Limit
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-white bg-slate-200/50 dark:bg-slate-950/80 border border-slate-350 dark:border-slate-850 px-2.5 py-1 rounded-lg">
                                            {questionDetails.memory_limit_mb} MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
