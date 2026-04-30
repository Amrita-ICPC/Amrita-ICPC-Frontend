"use client";

import { motion } from "framer-motion";
import { Plus, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionWorkflow } from "./question-workflow";
import { QuestionCodeEditor, type MonacoLanguage } from "./question-code-editor";
import { TestCaseManager, type TestCase } from "./test-case-manager";
import { cn } from "@/lib/utils";

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

export function QuestionWorkflowSection({
    activeWorkflowStep,
    setActiveWorkflowStep,
    steps,
    isStepValid,
    canGoNext,
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
    onSave,
    isSaving = false,
}: QuestionWorkflowSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-12 border-t border-border/40 mt-12"
        >
            <div className="flex flex-col items-start mb-8 text-left">
                <h2 className="text-2xl font-bold tracking-tight">Code</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Configure the core logic, test cases, and driver environment for this challenge.
                </p>
            </div>

            <QuestionWorkflow
                currentStep={activeWorkflowStep}
                onStepClick={(id) => {
                    const targetIdx = steps.indexOf(id);
                    const currentIdx = steps.indexOf(activeWorkflowStep);

                    // Allow going back freely, but going forward requires validation of all previous steps
                    if (targetIdx <= currentIdx) {
                        setActiveWorkflowStep(id);
                    } else {
                        // Check if all steps between current and target are valid
                        let allValid = true;
                        for (let i = currentIdx; i < targetIdx; i++) {
                            if (!isStepValid(steps[i])) {
                                allValid = false;
                                break;
                            }
                        }
                        if (allValid) setActiveWorkflowStep(id);
                    }
                }}
            />

            <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {["starter", "solution", "driver"].includes(activeWorkflowStep) ? (
                    <QuestionCodeEditor
                        title={activeWorkflowStep}
                        language={workflowEditorLang}
                        onLanguageChange={setWorkflowEditorLang}
                        showExecution={activeWorkflowStep === "driver"}
                        testCases={testCases}
                        starterCode={starterCodes[workflowEditorLang.id]}
                        solutionCode={solutionCodes[workflowEditorLang.id]}
                        driverCode={driverCodes[workflowEditorLang.id]}
                        allowedLanguages={allowedLanguages}
                        value={
                            activeWorkflowStep === "starter"
                                ? starterCodes[workflowEditorLang.id]
                                : activeWorkflowStep === "solution"
                                  ? solutionCodes[workflowEditorLang.id]
                                  : driverCodes[workflowEditorLang.id]
                        }
                        onChange={(val) => {
                            if (activeWorkflowStep === "starter")
                                setStarterCodes({ ...starterCodes, [workflowEditorLang.id]: val });
                            else if (activeWorkflowStep === "solution")
                                setSolutionCodes({
                                    ...solutionCodes,
                                    [workflowEditorLang.id]: val,
                                });
                            else setDriverCodes({ ...driverCodes, [workflowEditorLang.id]: val });
                        }}
                    />
                ) : activeWorkflowStep === "testcases" ? (
                    <TestCaseManager testCases={testCases} setTestCases={setTestCases} />
                ) : (
                    <div className="bg-card/10 border border-border/40 rounded-2xl p-12 text-center backdrop-blur-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-6">
                            <Plus className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground capitalize">
                            Configure {activeWorkflowStep.replace("-", " ")}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                            This section will allow you to manage the {activeWorkflowStep} details.
                            Select a step from the workflow above to begin.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-8 border-primary/20 hover:bg-primary/5"
                        >
                            Add {activeWorkflowStep}
                        </Button>
                    </div>
                )}
            </div>

            {/* Workflow Navigation */}
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-border/20 min-h-[80px]">
                {activeWorkflowStep !== "starter" ? (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const idx = steps.indexOf(activeWorkflowStep);
                            if (idx > 0) setActiveWorkflowStep(steps[idx - 1]);
                        }}
                        className="gap-2 text-muted-foreground hover:text-foreground transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to{" "}
                        {activeWorkflowStep === "solution"
                            ? "Starter"
                            : activeWorkflowStep === "testcases"
                              ? "Solution"
                              : "Test Cases"}
                    </Button>
                ) : (
                    <div />
                )}

                <Button
                    onClick={() => {
                        const idx = steps.indexOf(activeWorkflowStep);
                        if (idx < steps.length - 1) {
                            if (canGoNext) setActiveWorkflowStep(steps[idx + 1]);
                        } else {
                            onSave();
                        }
                    }}
                    disabled={!canGoNext || isSaving}
                    className={cn(
                        "gap-2 px-8 h-12 shadow-xl transition-all active:scale-95",
                        activeWorkflowStep === "driver"
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                            : "shadow-primary/20",
                    )}
                >
                    {activeWorkflowStep === "driver" ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Finalize & Save Question
                        </>
                    ) : (
                        <>
                            Continue to{" "}
                            {activeWorkflowStep === "starter"
                                ? "Solution"
                                : activeWorkflowStep === "solution"
                                  ? "Test Cases"
                                  : "Driver Code"}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
