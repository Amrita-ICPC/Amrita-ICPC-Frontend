"use client";

import { ChevronDown, ChevronUp, Database, Info, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TestCase {
    id: string;
    name?: string;
    input: string;
    output: string;
    is_hidden: boolean;
    weight: number;
    order: number;
}

interface TestCaseManagerProps {
    testCases: TestCase[];
    setTestCases: (testCases: TestCase[]) => void;
}

export function TestCaseManager({ testCases, setTestCases }: TestCaseManagerProps) {
    // Sort test cases by order value
    const sortedTestCases = useMemo(() => {
        return [...testCases].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [testCases]);

    // Active test case ID
    const [activeId, setActiveId] = useState<string | null>(() => {
        const initial = sortedTestCases.find((tc) => !tc.is_hidden);
        return initial ? initial.id : null;
    });

    const addTestCase = () => {
        const newTestCase: TestCase = {
            id: Math.random().toString(36).substr(2, 9),
            input: "",
            output: "",
            is_hidden: false,
            weight: 1,
            order: testCases.length,
        };
        setTestCases([...testCases, newTestCase]);
        setActiveId(newTestCase.id);
    };

    const updateTestCase = (id: string, updates: Partial<TestCase>) => {
        setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)));
    };

    const deleteTestCase = (id: string) => {
        const newTestCases = testCases
            .filter((tc) => tc.id !== id)
            .map((tc, idx) => ({ ...tc, order: idx }));
        setTestCases(newTestCases);
        if (activeId === id) {
            setActiveId(newTestCases.length > 0 ? newTestCases[0].id : null);
        }
    };

    const moveTestCase = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= sortedTestCases.length) return;

        // Find corresponding items in the main testCases list
        const item1 = sortedTestCases[index];
        const item2 = sortedTestCases[newIndex];

        const updated = testCases.map((tc) => {
            if (tc.id === item1.id) {
                return { ...tc, order: item2.order };
            }
            if (tc.id === item2.id) {
                return { ...tc, order: item1.order };
            }
            return tc;
        });

        setTestCases(updated);
    };

    const activeTestCase =
        sortedTestCases.find((tc) => tc.id === activeId) ?? sortedTestCases[0] ?? null;
    const activeDisplayId = activeTestCase?.id ?? null;

    return (
        <div className="w-full flex flex-col h-full">
            {/* Single White Card Wrapping the whole Test Case manager */}
            <div className="flex flex-col border border-border/60 rounded-xl bg-card overflow-hidden shadow-sm flex-1 min-h-[550px]">
                {/* 1. Header Inside the Card */}
                <div className="flex items-center justify-between border-b border-border/40 px-6 py-5 shrink-0 bg-card">
                    <div>
                        <h2 className="text-base font-bold text-foreground">Test Cases</h2>
                        <p className="text-[10px] text-muted-foreground">
                            Create input and expected output pairs to test solutions.
                        </p>
                    </div>
                    <Button
                        type="button"
                        onClick={addTestCase}
                        size="sm"
                        className="h-8 text-xs font-semibold px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Test Case
                    </Button>
                </div>

                {/* 2. Inner Split Layout */}
                <div className="flex flex-1 overflow-hidden min-h-0 bg-card">
                    {/* Left Sidebar List */}
                    <div className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-muted/5">
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {sortedTestCases.map((tc, index) => {
                                const isActive = activeDisplayId === tc.id;
                                return (
                                    <div
                                        key={tc.id}
                                        onClick={() => setActiveId(tc.id)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "hover:bg-muted/50 text-foreground font-medium",
                                        )}
                                    >
                                        <span className="min-w-0 flex-1 truncate text-xs">
                                            {tc.name || `Test Case ${index + 1}`}
                                        </span>
                                        {tc.is_hidden ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "ml-2 border-amber-300/70 bg-amber-50 px-2 py-0 text-[10px] font-semibold text-amber-700",
                                                    "dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
                                                    isActive &&
                                                        "border-primary/30 bg-primary/15 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary",
                                                )}
                                            >
                                                Hidden
                                            </Badge>
                                        ) : null}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={index === 0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveTestCase(index, "up");
                                                }}
                                                className="h-5 w-5 hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={index === sortedTestCases.length - 1}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveTestCase(index, "down");
                                                }}
                                                className="h-5 w-5 hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 border-t border-border/40 bg-muted/10">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-8 text-[11px] gap-1.5 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary border-dashed font-semibold rounded-lg cursor-pointer"
                                onClick={addTestCase}
                            >
                                <Plus className="h-3 w-3" /> Add Test Case
                            </Button>
                        </div>
                    </div>

                    {/* Right Content Editor */}
                    <div className="flex-1 flex flex-col p-6 bg-card overflow-y-auto">
                        {activeTestCase ? (
                            <div className="flex-1 flex flex-col h-full space-y-6 max-w-4xl min-h-0">
                                {/* Top Row: Weight/Points & Hidden Switch */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                Weight / Points
                                            </Label>
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            aria-label="About test case weight"
                                                            className="text-muted-foreground/60 hover:text-foreground transition-colors"
                                                        >
                                                            <Info className="h-3.5 w-3.5" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-72">
                                                        Sets how much this test case contributes to
                                                        the question&apos;s total score relative to
                                                        the other test cases.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={activeTestCase.weight ?? 1}
                                            placeholder="1"
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    weight: Number(e.target.value),
                                                })
                                            }
                                            className="bg-background border-border/60 h-9 font-medium text-xs focus-visible:ring-primary/50 rounded-lg"
                                        />
                                        <p className="text-[10px] leading-relaxed text-muted-foreground">
                                            This test case&apos;s share of the question score.
                                            Higher weight means it contributes more points.
                                        </p>
                                    </div>

                                    <div className="flex justify-start md:pt-0.5">
                                        <div className="max-w-sm space-y-1.5 text-left">
                                            <div className="flex items-center justify-start gap-3">
                                                <Switch
                                                    checked={activeTestCase.is_hidden}
                                                    onCheckedChange={(val) =>
                                                        updateTestCase(activeTestCase.id, {
                                                            is_hidden: val,
                                                        })
                                                    }
                                                    className="scale-90"
                                                />
                                                <Label className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                                                    Hidden Test Case
                                                </Label>
                                            </div>
                                            <p className="text-[10px] leading-relaxed text-muted-foreground">
                                                Turn on to use this case only for judging. Turn off
                                                to show it to participants as a visible example.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Textareas inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[280px]">
                                    <div className="flex flex-col space-y-1.5 h-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                                                Input
                                            </Label>
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            aria-label="About test case input"
                                                            className="text-muted-foreground/60 hover:text-foreground transition-colors"
                                                        >
                                                            <Info className="h-3.5 w-3.5" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-72">
                                                        The exact stdin passed to the submitted
                                                        program for this test case.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Textarea
                                            value={activeTestCase.input}
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    input: e.target.value,
                                                })
                                            }
                                            className="flex-1 resize-none font-mono text-xs bg-background border-border/60 focus-visible:ring-primary/50 rounded-lg p-3 shadow-inner min-h-[150px]"
                                            placeholder="Enter input here..."
                                        />
                                    </div>

                                    <div className="flex flex-col space-y-1.5 h-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground">
                                                Expected Output
                                            </Label>
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            aria-label="About expected output"
                                                            className="text-muted-foreground/60 hover:text-foreground transition-colors"
                                                        >
                                                            <Info className="h-3.5 w-3.5" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-72">
                                                        The output the solution must produce for the
                                                        matching input. Whitespace should match the
                                                        judge expectation.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Textarea
                                            value={activeTestCase.output}
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    output: e.target.value,
                                                })
                                            }
                                            className="flex-1 resize-none font-mono text-xs bg-background border-border/60 focus-visible:ring-primary/50 rounded-lg p-3 shadow-inner min-h-[150px]"
                                            placeholder="Enter expected output here..."
                                        />
                                    </div>
                                </div>

                                {/* Bottom Row Buttons */}
                                <div className="flex items-center justify-between pt-4 mt-auto shrink-0 border-t border-border/40">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 gap-1.5 h-8 text-xs font-semibold rounded-lg cursor-pointer"
                                        onClick={() => deleteTestCase(activeTestCase.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete Test Case
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 space-y-3">
                                <Database className="h-10 w-10 opacity-30" />
                                <p className="text-xs">
                                    Select or create a test case to configure it.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
