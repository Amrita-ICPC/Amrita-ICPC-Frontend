"use client";

import { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Hash,
    Weight,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface TestCase {
    id: string;
    input: string;
    output: string;
    is_hidden: boolean;
    weight: number;
    order: number;
}

interface TestCaseCardProps {
    testCase: TestCase;
    index: number;
    totalCount: number;
    onUpdate: (id: string, updates: Partial<TestCase>) => void;
    onDelete: (id: string) => void;
    onMove: (id: string, direction: "up" | "down") => void;
}

function TestCaseCard({
    testCase,
    index,
    totalCount,
    onUpdate,
    onDelete,
    onMove,
}: TestCaseCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(
                "group relative bg-card/30 backdrop-blur-md border border-border/40 rounded-2xl overflow-hidden mb-4 transition-all duration-300",
                isExpanded ? "shadow-2xl" : "shadow-md hover:shadow-lg",
            )}
        >
            {/* Header / Summary */}
            <div className="flex items-center gap-4 p-4 bg-muted/20">
                <div className="flex flex-col gap-1 pr-2 border-r border-border/40">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary disabled:opacity-20"
                        disabled={index === 0}
                        onClick={() => onMove(testCase.id, "up")}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary disabled:opacity-20"
                        disabled={index === totalCount - 1}
                        onClick={() => onMove(testCase.id, "down")}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {index + 1}
                        </div>
                        <span className="text-sm font-bold tracking-tight">Test Case</span>
                    </div>

                    <div className="flex items-center gap-6 ml-auto mr-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Weight className="h-3 w-3" />
                            Weight: <span className="text-primary">{testCase.weight}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {testCase.is_hidden ? (
                                <EyeOff className="h-3 w-3 text-amber-500" />
                            ) : (
                                <Eye className="h-3 w-3 text-emerald-500" />
                            )}
                            {testCase.is_hidden ? "Hidden" : "Public"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-l border-border/40 pl-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                        onClick={() => onDelete(testCase.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Detailed Editor */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="p-6 grid grid-cols-2 gap-6 border-t border-border/20">
                            <div className="space-y-3 col-span-2 md:col-span-1">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Input Data
                                </Label>
                                <Textarea
                                    value={testCase.input}
                                    onChange={(e) =>
                                        onUpdate(testCase.id, { input: e.target.value })
                                    }
                                    placeholder="Enter test input..."
                                    className="min-h-[120px] font-mono text-sm bg-background/50 border-border/40 focus:border-primary/50 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-3 col-span-2 md:col-span-1">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Expected Output
                                </Label>
                                <Textarea
                                    value={testCase.output}
                                    onChange={(e) =>
                                        onUpdate(testCase.id, { output: e.target.value })
                                    }
                                    placeholder="Enter expected output..."
                                    className="min-h-[120px] font-mono text-sm bg-background/50 border-border/40 focus:border-primary/50 transition-all resize-none"
                                />
                            </div>

                            <div className="col-span-2 flex items-center justify-between pt-4 border-t border-border/10">
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Weight (Points)
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                value={testCase.weight}
                                                onChange={(e) =>
                                                    onUpdate(testCase.id, {
                                                        weight: Number(e.target.value),
                                                    })
                                                }
                                                className="w-24 h-9 bg-background/50 border-border/40 font-bold"
                                            />
                                            <span className="text-xs text-muted-foreground/60 italic">
                                                Score multiplier
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Visibility
                                        </Label>
                                        <div className="flex items-center gap-3 h-9">
                                            <span
                                                className={cn(
                                                    "text-xs font-medium transition-colors",
                                                    !testCase.is_hidden
                                                        ? "text-emerald-500"
                                                        : "text-muted-foreground/40",
                                                )}
                                            >
                                                Public
                                            </span>
                                            <Switch
                                                checked={testCase.is_hidden}
                                                onCheckedChange={(val) =>
                                                    onUpdate(testCase.id, { is_hidden: val })
                                                }
                                            />
                                            <span
                                                className={cn(
                                                    "text-xs font-medium transition-colors",
                                                    testCase.is_hidden
                                                        ? "text-amber-500"
                                                        : "text-muted-foreground/40",
                                                )}
                                            >
                                                Hidden
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/20 italic">
                                    Order Index: {testCase.order}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface TestCaseManagerProps {
    testCases: TestCase[];
    setTestCases: (testCases: TestCase[]) => void;
}

export function TestCaseManager({ testCases, setTestCases }: TestCaseManagerProps) {
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
    };

    const updateTestCase = (id: string, updates: Partial<TestCase>) => {
        setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)));
    };

    const deleteTestCase = (id: string) => {
        setTestCases(
            testCases.filter((tc) => tc.id !== id).map((tc, idx) => ({ ...tc, order: idx })),
        );
    };

    const moveTestCase = (id: string, direction: "up" | "down") => {
        const index = testCases.findIndex((tc) => tc.id === id);
        if (index === -1) return;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= testCases.length) return;

        const newTestCases = [...testCases];
        const temp = newTestCases[index];
        newTestCases[index] = newTestCases[newIndex];
        newTestCases[newIndex] = temp;

        // Update order properties
        setTestCases(newTestCases.map((tc, idx) => ({ ...tc, order: idx })));
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        Test Case Management
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {testCases.length}
                        </div>
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                        Configure input/output pairs and visibility for evaluation.
                    </p>
                </div>
                <Button
                    onClick={addTestCase}
                    className="shadow-lg shadow-primary/20 gap-2 h-10 px-6 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Add Test Case
                </Button>
            </div>

            <div className="space-y-4">
                <AnimatePresence initial={false} mode="popLayout">
                    {testCases.map((tc, index) => (
                        <TestCaseCard
                            key={tc.id}
                            testCase={tc}
                            index={index}
                            totalCount={testCases.length}
                            onUpdate={updateTestCase}
                            onDelete={deleteTestCase}
                            onMove={moveTestCase}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {testCases.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5"
                >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/20 text-muted-foreground/30 mb-6">
                        <Plus className="h-10 w-10" />
                    </div>
                    <h4 className="text-lg font-semibold text-muted-foreground/60">
                        No test cases yet
                    </h4>
                    <p className="text-sm text-muted-foreground/40 mt-1 max-w-xs text-center">
                        Add at least one test case to validate participant submissions.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-8 border-primary/20 hover:bg-primary/5"
                        onClick={addTestCase}
                    >
                        Create First Test Case
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
