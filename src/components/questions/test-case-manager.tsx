"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Upload, Play, MoreVertical, Info, Database } from "lucide-react";
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
    const [activeId, setActiveId] = useState<string | null>(
        testCases.find((tc) => !tc.is_hidden)?.id || null,
    );

    const visibleCases = testCases.filter((tc) => !tc.is_hidden);
    const hiddenCases = testCases.filter((tc) => tc.is_hidden);

    const filteredTestCases = useMemo(() => {
        return testCases
            .map((tc, index) => ({ ...tc, originalIndex: index }))
            .filter((tc) => (activeTab === "visible" ? !tc.is_hidden : tc.is_hidden));
    }, [testCases, activeTab]);

    const handleTabChange = (tab: "visible" | "hidden") => {
        setActiveTab(tab);
        const newFiltered = testCases.filter((tc) =>
            tab === "visible" ? !tc.is_hidden : tc.is_hidden,
        );
        if (!newFiltered.find((tc) => tc.id === activeId)) {
            setActiveId(newFiltered.length > 0 ? newFiltered[0].id : null);
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

    const activeTestCase = testCases.find((tc) => tc.id === activeId);
    const activeOriginalIndex = testCases.findIndex((tc) => tc.id === activeId);

    return (
        <div className="w-full flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Test Cases
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Create input and expected output pairs to test solutions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 px-4 gap-2 border-border/60 font-medium"
                    >
                        <Upload className="h-4 w-4 text-primary" /> Import
                    </Button>
                    <Button
                        type="button"
                        onClick={() => addTestCase(false)}
                        className="shadow-sm gap-2 h-9 px-4 font-medium"
                    >
                        <Plus className="h-4 w-4" /> Add Test Case
                    </Button>
                </div>
            </div>

            {/* Split View Container */}
            <div className="flex flex-col border border-border/60 rounded-xl bg-card overflow-hidden shadow-sm flex-1 min-h-[600px]">
                {/* Tabs Row */}
                <div className="flex items-center border-b border-border/60 px-2 bg-background/50">
                    <button
                        type="button"
                        onClick={() => handleTabChange("visible")}
                        className={cn(
                            "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                            activeTab === "visible"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        Visible ({visibleCases.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("hidden")}
                        className={cn(
                            "px-6 py-3 text-sm font-bold border-b-2 transition-colors",
                            activeTab === "hidden"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        Hidden ({hiddenCases.length})
                    </button>
                </div>

                {/* Inner Split Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar List */}
                    <div className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-muted/10">
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {filteredTestCases.map((tc) => {
                                const isActive = activeId === tc.id;
                                return (
                                    <div
                                        key={tc.id}
                                        onClick={() => setActiveId(tc.id)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "hover:bg-muted/50 text-foreground font-medium",
                                        )}
                                    >
                                        <span className="text-sm truncate">
                                            {tc.name || `Sample Test Case ${tc.originalIndex + 1}`}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                                                isActive && "opacity-100",
                                            )}
                                        >
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-border/60 bg-muted/5">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary border-dashed font-semibold"
                                onClick={() => addTestCase(activeTab === "hidden")}
                            >
                                <Plus className="h-4 w-4" /> Add{" "}
                                {activeTab === "hidden" ? "Hidden" : "Visible"} Test Case
                            </Button>
                        </div>
                    </div>

                    {/* Right Content Editor */}
                    <div className="flex-1 flex flex-col p-6 bg-background overflow-y-auto">
                        {activeTestCase ? (
                            <div className="flex-1 flex flex-col h-full space-y-6 max-w-4xl">
                                {/* Top Row: Name & Switch */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1.5 flex-1 max-w-sm">
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
                                            className="bg-card border-border/60 h-10 font-medium focus-visible:ring-primary/50"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={activeTestCase.is_hidden}
                                            onCheckedChange={(val) =>
                                                updateTestCase(activeTestCase.id, {
                                                    is_hidden: val,
                                                })
                                            }
                                        />
                                        <Label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                                            Hidden Test Case <Info className="h-4 w-4 opacity-50" />
                                        </Label>
                                    </div>
                                </div>

                                {/* Textareas */}
                                <div className="grid grid-cols-2 gap-6 flex-1 min-h-[300px]">
                                    <div className="flex flex-col space-y-2 h-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                Input <Info className="h-3 w-3 opacity-50" />
                                            </Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs border-border/60 text-muted-foreground px-2"
                                            >
                                                Format <ChevronDownIcon className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={activeTestCase.input}
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    input: e.target.value,
                                                })
                                            }
                                            className="flex-1 resize-none font-mono text-sm bg-background border-border/60 focus-visible:ring-primary/50 rounded-xl p-4 shadow-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col space-y-2 h-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                Expected Output{" "}
                                                <Info className="h-3 w-3 opacity-50" />
                                            </Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs border-border/60 text-muted-foreground px-2"
                                            >
                                                Format <ChevronDownIcon className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={activeTestCase.output}
                                            onChange={(e) =>
                                                updateTestCase(activeTestCase.id, {
                                                    output: e.target.value,
                                                })
                                            }
                                            className="flex-1 resize-none font-mono text-sm bg-background border-border/60 focus-visible:ring-primary/50 rounded-xl p-4 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Row Buttons */}
                                <div className="flex items-center justify-between pt-6 mt-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 gap-2 h-9 font-medium"
                                        onClick={() => deleteTestCase(activeTestCase.id)}
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete Test Case
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2 h-9 border-border/60 hover:bg-muted font-medium text-primary hover:text-primary"
                                    >
                                        <Play className="h-4 w-4" /> Run Test Case
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60 space-y-4">
                                <Database className="h-12 w-12 opacity-20" />
                                <p>Select or create a test case to configure it.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronDownIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
