"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Play, ChevronUp, ChevronDown, Info, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    const [activeTab, setActiveTab] = useState<"visible" | "hidden">("visible");

    // Sort test cases by order value
    const sortedTestCases = useMemo(() => {
        return [...testCases].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }, [testCases]);

    // Active test case ID
    const [activeId, setActiveId] = useState<string | null>(() => {
        const initial = sortedTestCases.find((tc) => !tc.is_hidden);
        return initial ? initial.id : null;
    });

    const visibleCases = sortedTestCases.filter((tc) => !tc.is_hidden);
    const hiddenCases = sortedTestCases.filter((tc) => tc.is_hidden);

    const filteredTestCases = useMemo(() => {
        return sortedTestCases
            .map((tc, index) => ({ ...tc, filteredIndex: index }))
            .filter((tc) => (activeTab === "visible" ? !tc.is_hidden : tc.is_hidden));
    }, [sortedTestCases, activeTab]);

    const handleTabChange = (tab: "visible" | "hidden") => {
        setActiveTab(tab);
        const newFiltered = sortedTestCases.filter((tc) =>
            tab === "visible" ? !tc.is_hidden : tc.is_hidden,
        );
        if (newFiltered.length > 0) {
            // Find if there's already an active ID within the new list
            const currentActiveInTab = newFiltered.find((tc) => tc.id === activeId);
            if (!currentActiveInTab) {
                setActiveId(newFiltered[0].id);
            }
        } else {
            setActiveId(null);
        }
    };

    const addTestCase = (isHidden: boolean = false) => {
        const newTestCase: TestCase = {
            id: Math.random().toString(36).substr(2, 9),
            input: "",
            output: "",
            is_hidden: isHidden,
            weight: 1,
            order: testCases.length,
        };
        setTestCases([...testCases, newTestCase]);
        setActiveTab(isHidden ? "hidden" : "visible");
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
            const currentTabCases = newTestCases.filter((tc) =>
                activeTab === "visible" ? !tc.is_hidden : tc.is_hidden,
            );
            setActiveId(currentTabCases.length > 0 ? currentTabCases[0].id : null);
        }
    };

    const moveTestCase = (filteredIndex: number, direction: "up" | "down") => {
        const newFilteredIndex = direction === "up" ? filteredIndex - 1 : filteredIndex + 1;
        if (newFilteredIndex < 0 || newFilteredIndex >= filteredTestCases.length) return;

        // Find corresponding items in the main testCases list
        const item1 = filteredTestCases[filteredIndex];
        const item2 = filteredTestCases[newFilteredIndex];

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

    const activeTestCase = sortedTestCases.find((tc) => tc.id === activeId);
    const activeOriginalIndex = sortedTestCases.findIndex((tc) => tc.id === activeId);

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
                        onClick={() => addTestCase(activeTab === "hidden")}
                        size="sm"
                        className="h-8 text-xs font-semibold px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Test Case
                    </Button>
                </div>

                {/* 2. Tabs Row with Underline Border Indicator */}
                <div className="flex items-end border-b border-border/40 px-6 bg-card shrink-0 pt-6">
                    <div className="flex gap-6 -mb-[1px]">
                        <button
                            type="button"
                            onClick={() => handleTabChange("visible")}
                            className={cn(
                                "bg-transparent rounded-none border-t-0 border-x-0 border-b-2 border-transparent pt-2 pb-2.5 px-1 font-bold text-xs cursor-pointer focus:outline-none transition-all",
                                activeTab === "visible"
                                    ? "border-[#2563eb] text-[#2563eb] dark:border-primary dark:text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:border-border/60",
                            )}
                        >
                            Visible ({visibleCases.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange("hidden")}
                            className={cn(
                                "bg-transparent rounded-none border-t-0 border-x-0 border-b-2 border-transparent pt-2 pb-2.5 px-1 font-bold text-xs cursor-pointer focus:outline-none transition-all",
                                activeTab === "hidden"
                                    ? "border-[#2563eb] text-[#2563eb] dark:border-primary dark:text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:border-border/60",
                            )}
                        >
                            Hidden ({hiddenCases.length})
                        </button>
                    </div>
                </div>

                {/* 3. Inner Split Layout */}
                <div className="flex flex-1 overflow-hidden min-h-0 bg-card">
                    {/* Left Sidebar List */}
                    <div className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-muted/5">
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {filteredTestCases.map((tc, index) => {
                                const isActive = activeId === tc.id;
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
                                        <span className="text-xs truncate">
                                            {tc.name || `Sample Test Case ${index + 1}`}
                                        </span>
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
                                                disabled={index === filteredTestCases.length - 1}
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
                                onClick={() => addTestCase(activeTab === "hidden")}
                            >
                                <Plus className="h-3 w-3" /> Add{" "}
                                {activeTab === "hidden" ? "Hidden" : "Visible"} Test Case
                            </Button>
                        </div>
                    </div>

                    {/* Right Content Editor */}
                    <div className="flex-1 flex flex-col p-6 bg-card overflow-y-auto">
                        {activeTestCase ? (
                            <div className="flex-1 flex flex-col h-full space-y-6 max-w-4xl min-h-0">
                                {/* Top Row: Name, Weight/Points & Hidden Switch */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-1.5 md:col-span-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            Test Case Name
                                        </Label>
                                        <Input
                                            value={activeTestCase.name || ""}
                                            placeholder={`Sample Test Case ${activeOriginalIndex + 1}`}
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    name: e.target.value,
                                                })
                                            }
                                            className="bg-background border-border/60 h-9 font-medium text-xs focus-visible:ring-primary/50 rounded-lg"
                                        />
                                    </div>

                                    {/* Weight Field (Required field requested by User) */}
                                    <div className="space-y-1.5 md:col-span-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">
                                            Weight / Points
                                        </Label>
                                        <Input
                                            type="number"
                                            value={activeTestCase.weight ?? 1}
                                            placeholder="1"
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    weight: Number(e.target.value),
                                                })
                                            }
                                            className="bg-background border-border/60 h-9 font-medium text-xs focus-visible:ring-primary/50 rounded-lg"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pb-2 justify-end md:col-span-1">
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
                                </div>

                                {/* Textareas inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[280px]">
                                    <div className="flex flex-col space-y-1.5 h-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                                Input <Info className="h-3.5 w-3.5 opacity-55" />
                                            </Label>
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
                                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                                Expected Output{" "}
                                                <Info className="h-3.5 w-3.5 opacity-55" />
                                            </Label>
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
