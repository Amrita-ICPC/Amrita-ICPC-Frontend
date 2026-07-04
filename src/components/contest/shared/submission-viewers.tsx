"use client";

import Editor from "@monaco-editor/react";
import { CheckCircle2, Code2, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import type { SubmissionTestCaseResultSchema } from "@/api/generated/model/submissionTestCaseResultSchema";
import { useGetSubmissionTestcasesApiV1SubmissionsSubmissionIdTestcasesGet } from "@/api/generated/submissions/submissions";
import {
    formatMemory,
    formatRuntime,
    statusLabel,
    statusTone,
} from "@/components/contest/team-member-analytics/member-detail-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { isDarkTheme } from "@/lib/theme-config";

export function MetricTile({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

export function PreBlock({ title, value }: { title: string; value: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-border/60 bg-muted/30">
            <div className="border-b border-border/60 px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                {title}
            </div>
            <ScrollArea className="h-28">
                <pre className="whitespace-pre-wrap break-words p-3 text-xs leading-relaxed text-foreground">
                    {value}
                </pre>
            </ScrollArea>
        </div>
    );
}

export function TestCaseRow({ testcase }: { testcase: SubmissionTestCaseResultSchema }) {
    const passed = testcase.status === "AC";

    return (
        <div className="rounded-lg border border-border/70 bg-background p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{testcase.name}</p>
                        <Badge className={statusTone(testcase.status)}>
                            {statusLabel(testcase.status)}
                        </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{formatRuntime(testcase.execution_time)}</span>
                        <span>{formatMemory(testcase.memory)}</span>
                    </div>
                </div>
                {passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <PreBlock title="Input" value={testcase.input} />
                <PreBlock title="Expected" value={testcase.expected_output} />
                <PreBlock title="Actual" value={testcase.actual_output ?? "No output recorded"} />
            </div>
        </div>
    );
}

export function TestCaseViewer({ submissionId, open }: { submissionId: string; open: boolean }) {
    const [page, setPage] = React.useState(1);
    const pageSize = 8;
    const { data, isLoading, isError } =
        useGetSubmissionTestcasesApiV1SubmissionsSubmissionIdTestcasesGet(
            submissionId,
            { page, page_size: pageSize },
            { query: { enabled: open } },
        );

    const testcases = data?.data?.items ?? [];
    const total = data?.data?.total ?? data?.pagination?.total ?? testcases.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (!open) return null;

    return (
        <div className="mt-4 rounded-lg border border-border/70 bg-muted/20 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-semibold">Testcase Results</p>
                    <p className="text-sm text-muted-foreground">
                        {total} testcase results for this submission
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isLoading}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || isLoading}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-32 rounded-lg" />
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    Failed to load testcase results.
                </div>
            ) : testcases.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                    No testcase results available.
                </div>
            ) : (
                <div className="space-y-3">
                    {testcases.map((testcase) => (
                        <TestCaseRow key={testcase.id} testcase={testcase} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function SourceCodeViewer({ code, language }: { code: string; language: string }) {
    const { resolvedTheme } = useTheme();
    const normalizedLanguage = language.toLowerCase();
    const monacoLanguage = normalizedLanguage.includes("python")
        ? "python"
        : normalizedLanguage.includes("java") && !normalizedLanguage.includes("script")
          ? "java"
          : normalizedLanguage.includes("javascript")
            ? "javascript"
            : normalizedLanguage.includes("typescript")
              ? "typescript"
              : normalizedLanguage.includes("c++") || normalizedLanguage.includes("cpp")
                ? "cpp"
                : normalizedLanguage.includes("c#")
                  ? "csharp"
                  : normalizedLanguage.includes("go")
                    ? "go"
                    : normalizedLanguage.includes("rust")
                      ? "rust"
                      : "plaintext";

    return (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Code2 className="h-4 w-4 text-primary" />
                        Source Code
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="w-fit border-border/70 bg-background text-foreground"
                >
                    {language}
                </Badge>
            </div>

            <div className="h-80 bg-background">
                <Editor
                    height="100%"
                    language={monacoLanguage}
                    value={code}
                    theme={isDarkTheme(resolvedTheme) ? "vs-dark" : "light"}
                    options={{
                        readOnly: true,
                        domReadOnly: true,
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        minimap: { enabled: false },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        contextmenu: false,
                        folding: true,
                        renderLineHighlight: "none",
                        padding: { top: 12, bottom: 12 },
                    }}
                />
            </div>
        </div>
    );
}
