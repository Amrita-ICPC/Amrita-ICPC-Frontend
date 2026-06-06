"use client";

import { CheckCircle2, Code, Database, FileText, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { type MonacoLanguage, QuestionCodeEditor } from "./question-code-editor";
import { type TestCase, TestCaseManager } from "./test-case-manager";

interface QuestionWorkflowSectionProps {
    activeWorkflowStep: string;
    setActiveWorkflowStep: (step: string) => void;
    steps: string[];
    isStepValid: (step: string) => boolean;
    canGoNext: boolean;
    workflowEditorLang: MonacoLanguage;
    setWorkflowEditorLang: (lang: MonacoLanguage) => void;
    allowedLanguages: number[];
    starterCodes: Record<number, string>;
    setStarterCodes: (codes: Record<number, string>) => void;
    solutionCodes: Record<number, string>;
    setSolutionCodes: (codes: Record<number, string>) => void;
    driverCodes: Record<number, string>;
    setDriverCodes: (codes: Record<number, string>) => void;
    testCases: TestCase[];
    setTestCases: (cases: TestCase[]) => void;
    onSave: () => void;
    isSaving?: boolean;
}

const CONFIG_TABS = [
    { id: "starter", label: "Starter Code", icon: Code },
    { id: "solution", label: "Reference Solution", icon: FileText },
    { id: "testcases", label: "Test Cases", icon: Database },
    { id: "driver", label: "Driver Code", icon: FileText },
];

export function QuestionWorkflowSection({
    activeWorkflowStep,
    setActiveWorkflowStep,
    steps: _steps,
    isStepValid,
    canGoNext: _canGoNext,
    workflowEditorLang,
    setWorkflowEditorLang,
    allowedLanguages,
    starterCodes,
    setStarterCodes,
    solutionCodes,
    setSolutionCodes,
    driverCodes,
    setDriverCodes,
    testCases,
    setTestCases,
    onSave: _onSave,
    isSaving: _isSaving = false,
}: QuestionWorkflowSectionProps) {
    return (
        <div className="flex h-full w-full">
            {/* Left Sidebar */}
            <div className="w-64 shrink-0 border-r border-border/60 bg-muted/20 p-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                        Problem
                    </h3>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground cursor-not-allowed">
                        <span>Details</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground cursor-not-allowed">
                        <span>Statement</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                        Judge Configuration
                    </h3>
                    {CONFIG_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeWorkflowStep === tab.id;
                        const isValid = isStepValid(tab.id);

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveWorkflowStep(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                )}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </div>
                                {isValid && !isActive && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                                )}
                                {isActive && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-background overflow-y-auto p-8 relative">
                {["starter", "solution", "driver"].includes(activeWorkflowStep) ? (
                    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground capitalize">
                                {activeWorkflowStep === "solution"
                                    ? "Reference Solution"
                                    : activeWorkflowStep + " Code"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure language specific code for this section.
                            </p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <QuestionCodeEditor
                                title=""
                                language={workflowEditorLang}
                                onLanguageChange={setWorkflowEditorLang}
                                showExecution={activeWorkflowStep === "driver"}
                                testCases={testCases}
                                starterCode={starterCodes[workflowEditorLang.id]}
                                solutionCode={solutionCodes[workflowEditorLang.id]}
                                driverCode={driverCodes[workflowEditorLang.id]}
                                allowedLanguages={allowedLanguages}
                                value={
                                    (activeWorkflowStep === "starter"
                                        ? starterCodes[workflowEditorLang.id]
                                        : activeWorkflowStep === "solution"
                                          ? solutionCodes[workflowEditorLang.id]
                                          : driverCodes[workflowEditorLang.id]) ?? ""
                                }
                                onChange={(val) => {
                                    if (activeWorkflowStep === "starter")
                                        setStarterCodes({
                                            ...starterCodes,
                                            [workflowEditorLang.id]: val,
                                        });
                                    else if (activeWorkflowStep === "solution")
                                        setSolutionCodes({
                                            ...solutionCodes,
                                            [workflowEditorLang.id]: val,
                                        });
                                    else
                                        setDriverCodes({
                                            ...driverCodes,
                                            [workflowEditorLang.id]: val,
                                        });
                                }}
                            />
                        </div>
                    </div>
                ) : activeWorkflowStep === "testcases" ? (
                    <div className="max-w-6xl mx-auto">
                        <TestCaseManager testCases={testCases} setTestCases={setTestCases} />
                    </div>
                ) : (
                    <div className="bg-card/10 border border-border/40 rounded-2xl p-12 text-center backdrop-blur-sm max-w-2xl mx-auto mt-20">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-6">
                            <Plus className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground capitalize">
                            Configure {activeWorkflowStep.replace("-", " ")}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-2">
                            Select a section from the left sidebar to begin.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
