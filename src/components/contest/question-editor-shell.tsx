"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useEditorContext } from "../shared/TipTap";
import { ProblemMetadataCard } from "../questions/question-metadata-card";
import { ProblemPreview } from "../questions/question-preview";
import { QuestionCreateHero } from "../questions/question-create-hero";
import { QuestionCodeEditor, LANGUAGES, MonacoLanguage } from "../questions/question-code-editor";
import { QuestionArchitectureSection } from "../questions/question-architecture-section";
import { TestCaseManager } from "../questions/test-case-manager";
import { useQuestionEditorSync } from "@/hooks/use-question-editor-sync";
import { Skeleton } from "../ui/skeleton";
import type { useQuestionForm } from "@/hooks/use-question-form";
import { useContestQuestion, usePlatformLanguages } from "@/query/contest-query";
import { useGetQuestion } from "@/query/question-query";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_STEPS = ["details", "statement", "starter", "solution", "testcases", "driver"] as const;
type EditorStep = (typeof ALL_STEPS)[number];

const STEP_GROUPS = [
    {
        title: "Problem",
        steps: [
            { id: "details", label: "Details" },
            { id: "statement", label: "Statement" },
        ],
    },
    {
        title: "Judge Configuration",
        steps: [
            { id: "starter", label: "Starter Code" },
            { id: "solution", label: "Solution" },
            { id: "testcases", label: "Test Cases" },
            { id: "driver", label: "Driver Code" },
        ],
    },
] as const;

export interface QuestionEditorShellProps {
    mode: "create" | "update";
    contestId?: string;
    bankId?: string;
    questionId?: string;
    form: ReturnType<typeof useQuestionForm>;
    onSave: () => void;
    isSaving: boolean;
    compact?: boolean;
}

export function QuestionEditorShell({
    mode,
    contestId,
    bankId,
    questionId,
    form,
    onSave,
    isSaving,
    compact = false,
}: QuestionEditorShellProps) {
    const { metadata, content, code, testCases, initializeForm } = form;

    // Data fetching
    const {
        data: contestQuestionData,
        isLoading: isFetchingContestQuestion,
        error: contestFetchError,
        refetch: refetchContestQuestion,
    } = useContestQuestion(contestId || "", questionId || "", {
        query: {
            enabled: mode === "update" && !!contestId && !!questionId,
        },
    });

    const {
        data: genericQuestionData,
        isLoading: isFetchingGenericQuestion,
        error: genericFetchError,
        refetch: refetchGenericQuestion,
    } = useGetQuestion(mode === "update" && !contestId && questionId ? questionId : "", {
        query: {
            enabled: mode === "update" && !contestId && !!questionId,
        },
    });

    const questionData = contestId ? contestQuestionData : genericQuestionData;
    const isFetchingQuestion = contestId ? isFetchingContestQuestion : isFetchingGenericQuestion;
    const fetchError = contestId ? contestFetchError : genericFetchError;
    const refetchQuestion = contestId ? refetchContestQuestion : refetchGenericQuestion;

    const {
        data: languagesData,
        isLoading: isFetchingLangs,
        error: langError,
        refetch: refetchLangs,
    } = usePlatformLanguages();

    const [workflowEditorLang, setWorkflowEditorLang] = useState<MonacoLanguage>(LANGUAGES[0]);
    const [activeStep, setActiveStep] = useState<EditorStep>("details");

    const [visitedSteps, setVisitedSteps] = useState<Record<EditorStep, boolean>>(() => ({
        details: true,
        statement: mode === "update",
        starter: mode === "update",
        solution: mode === "update",
        testcases: mode === "update",
        driver: mode === "update",
    }));

    // View State
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const editor = useEditorContext();
    const [activeTab, setActiveTab] = useState("description");

    const initializedQuestionIdRef = useRef<string | null>(null);

    // Initialize form with fetched data in update mode
    useEffect(() => {
        if (mode !== "update" || !questionData?.data) return;
        if (!languagesData?.data?.languages) return;
        if (initializedQuestionIdRef.current === questionData.data.id) return;

        initializeForm(questionData.data as any, languagesData.data.languages);
        initializedQuestionIdRef.current = questionData.data.id;
    }, [mode, questionData?.data, languagesData?.data?.languages, initializeForm]);

    // Hide global layout (header/sidebar)
    useEffect(() => {
        document.body.classList.add("hide-layout");
        return () => {
            document.body.classList.remove("hide-layout");
        };
    }, []);

    useQuestionEditorSync({
        editor,
        activeTab,
        content,
        setters: {
            setDescription: content.setDescription,
            setInputFormat: content.setInputFormat,
            setOutputFormat: content.setOutputFormat,
            setConstraints: content.setConstraints,
            setNotes: content.setNotes,
        },
    });

    const backUrl = contestId
        ? `/contest/${contestId}/questions`
        : bankId
          ? `/banks/${bankId}`
          : "/";

    // Step validity checks
    const isStepValid = (stepId: EditorStep): boolean => {
        // For starter, solution, and driver code, we require that the step has been visited (if in create mode)
        // to ensure the user actually reviewed the default templates.
        if (["starter", "solution", "driver"].includes(stepId) && !visitedSteps[stepId]) {
            return false;
        }

        switch (stepId) {
            case "details":
                return !!metadata.title?.trim();
            case "statement":
                return !!content.description?.trim();
            case "starter":
                return !!code.starterCodes[workflowEditorLang.id]?.trim();
            case "solution":
                return !!code.solutionCodes[workflowEditorLang.id]?.trim();
            case "testcases":
                return testCases.testCases.length > 0;
            case "driver":
                return !!code.driverCodes[workflowEditorLang.id]?.trim();
            default:
                return false;
        }
    };

    const currentIdx = ALL_STEPS.indexOf(activeStep);

    const handlePrev = () => {
        if (currentIdx > 0) {
            const prevStep = ALL_STEPS[currentIdx - 1];
            setActiveStep(prevStep);
            setVisitedSteps((prev) => ({ ...prev, [prevStep]: true }));
        }
    };

    const handleNext = () => {
        if (currentIdx < ALL_STEPS.length - 1) {
            const nextStep = ALL_STEPS[currentIdx + 1];
            setActiveStep(nextStep);
            setVisitedSteps((prev) => ({ ...prev, [nextStep]: true }));
        } else {
            onSave();
        }
    };

    return (
        <AsyncStateHandler
            isLoading={(mode === "update" && isFetchingQuestion) || isFetchingLangs}
            isError={(mode === "update" && !!fetchError) || !!langError}
            error={fetchError || langError}
            onRetry={() => {
                if (fetchError) refetchQuestion();
                if (langError) refetchLangs();
            }}
            errorTitle={fetchError ? "Failed to Load Question" : "Failed to Load Platform Data"}
            loadingComponent={
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-20 mt-10">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-56 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            }
        >
            <div
                className="flex flex-col bg-background relative overflow-hidden w-full h-full"
                style={{ height: "calc(100vh - 56px)" }}
            >
                {/* 1. Sticky Header */}
                <div className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-border/60 bg-card px-6 py-3">
                    <QuestionCreateHero
                        title={mode === "update" ? "Update Question" : "Create Question"}
                        description={
                            mode === "update"
                                ? "Edit the metadata and requirements for this programming challenge."
                                : "Configure the requirements for your new programming challenge."
                        }
                        backUrl={backUrl}
                        onPreview={() => setIsPreviewMode(!isPreviewMode)}
                        isPreview={isPreviewMode}
                        onSave={onSave}
                        isSaving={isSaving}
                    />
                </div>

                {isPreviewMode ? (
                    <div className="flex-1 overflow-y-auto p-6 bg-background">
                        <ProblemPreview
                            title={metadata.title}
                            difficulty={metadata.difficulty}
                            timeLimit={metadata.timeLimit}
                            memoryLimit={metadata.memoryLimit}
                            score={metadata.score}
                            description={content.description}
                            inputFormat={content.inputFormat}
                            outputFormat={content.outputFormat}
                            constraints={content.constraints}
                            notes={content.notes}
                            testCases={testCases.testCases}
                            onBack={() => setIsPreviewMode(false)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden bg-background p-6 gap-6">
                        {/* 2. Unified Sidebar Stepper (Floating Card) */}
                        <div className="w-72 shrink-0 rounded-xl border border-border/60 bg-card px-5 py-4 space-y-6 overflow-y-auto flex flex-col justify-between shadow-sm min-h-[460px] self-start">
                            <div className="space-y-6">
                                {STEP_GROUPS.map((group) => (
                                    <div key={group.title} className="space-y-2">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3">
                                            {group.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {group.steps.map((step) => {
                                                const isActive = activeStep === step.id;
                                                const isValid = isStepValid(step.id);
                                                return (
                                                    <button
                                                        key={step.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveStep(step.id);
                                                            setVisitedSteps((prev) => ({
                                                                ...prev,
                                                                [step.id]: true,
                                                            }));
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer outline-none",
                                                            isActive
                                                                ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                                        )}
                                                    >
                                                        <span className="text-left py-1.5">
                                                            {step.label}
                                                        </span>
                                                        {isValid && !isActive && (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                        )}
                                                        {!isValid && !isActive && (
                                                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                                                        )}
                                                        {isActive && (
                                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Main Workspace Area */}
                        <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">
                            {/* Scrollable Step Content */}
                            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex flex-col w-full h-fit"
                                    >
                                        {/* STEP: DETAILS */}
                                        {activeStep === "details" && (
                                            <div className="max-w-4xl w-full pb-4">
                                                <ProblemMetadataCard
                                                    title={metadata.title}
                                                    setTitle={metadata.setTitle}
                                                    difficulty={metadata.difficulty}
                                                    setDifficulty={metadata.setDifficulty}
                                                    timeLimit={metadata.timeLimit}
                                                    setTimeLimit={metadata.setTimeLimit}
                                                    memoryLimit={metadata.memoryLimit}
                                                    setMemoryLimit={metadata.setMemoryLimit}
                                                    score={metadata.score}
                                                    setScore={metadata.setScore}
                                                    duration={metadata.duration}
                                                    setDuration={metadata.setDuration}
                                                    allowedLanguages={metadata.allowedLanguages}
                                                    setAllowedLanguages={
                                                        metadata.setAllowedLanguages
                                                    }
                                                    tags={metadata.tags}
                                                    setTags={metadata.setTags}
                                                />
                                            </div>
                                        )}

                                        {/* STEP: STATEMENT */}
                                        {activeStep === "statement" && (
                                            <div className="w-full pb-4 flex flex-col h-[800px]">
                                                <div className="flex-1 min-h-0 bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
                                                    <QuestionArchitectureSection
                                                        activeTab={activeTab}
                                                        onTabChange={setActiveTab}
                                                        editor={editor}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEPS: CODE EDITORS */}
                                        {["starter", "solution", "driver"].includes(activeStep) && (
                                            <div className="w-full pb-4">
                                                <QuestionCodeEditor
                                                    title={activeStep}
                                                    language={workflowEditorLang}
                                                    onLanguageChange={setWorkflowEditorLang}
                                                    showExecution={activeStep === "driver"}
                                                    testCases={testCases.testCases}
                                                    starterCode={
                                                        code.starterCodes[workflowEditorLang.id]
                                                    }
                                                    solutionCode={
                                                        code.solutionCodes[workflowEditorLang.id]
                                                    }
                                                    driverCode={
                                                        code.driverCodes[workflowEditorLang.id]
                                                    }
                                                    allowedLanguages={metadata.allowedLanguages}
                                                    value={
                                                        (activeStep === "starter"
                                                            ? code.starterCodes[
                                                                  workflowEditorLang.id
                                                              ]
                                                            : activeStep === "solution"
                                                              ? code.solutionCodes[
                                                                    workflowEditorLang.id
                                                                ]
                                                              : code.driverCodes[
                                                                    workflowEditorLang.id
                                                                ]) ?? ""
                                                    }
                                                    onChange={(val) => {
                                                        if (activeStep === "starter")
                                                            code.setStarterCodes({
                                                                ...code.starterCodes,
                                                                [workflowEditorLang.id]: val,
                                                            });
                                                        else if (activeStep === "solution")
                                                            code.setSolutionCodes({
                                                                ...code.solutionCodes,
                                                                [workflowEditorLang.id]: val,
                                                            });
                                                        else
                                                            code.setDriverCodes({
                                                                ...code.driverCodes,
                                                                [workflowEditorLang.id]: val,
                                                            });
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* STEP: TEST CASES */}
                                        {activeStep === "testcases" && (
                                            <div className="w-full pb-4 flex flex-col">
                                                <TestCaseManager
                                                    testCases={testCases.testCases}
                                                    setTestCases={testCases.setTestCases}
                                                />
                                            </div>
                                        )}

                                        {/* Dynamic Footer Area inside motion.div (closely below card, transparent, no borders) */}
                                        <div
                                            className={cn(
                                                "flex items-center justify-between bg-transparent px-0 py-4 shrink-0 w-full border-none shadow-none mt-2",
                                                activeStep === "details"
                                                    ? "max-w-4xl"
                                                    : "max-w-none",
                                            )}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handlePrev}
                                                disabled={currentIdx === 0}
                                                className="gap-1.5 border-border/60 h-9 text-xs px-4 rounded-lg font-semibold cursor-pointer"
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" /> Previous
                                            </Button>

                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={
                                                    currentIdx === ALL_STEPS.length - 1 && isSaving
                                                }
                                                className="gap-1.5 h-9 text-xs px-5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-sm"
                                            >
                                                {currentIdx === ALL_STEPS.length - 1 ? (
                                                    isSaving ? (
                                                        "Saving..."
                                                    ) : (
                                                        "Save Question"
                                                    )
                                                ) : (
                                                    <>
                                                        Save & Continue{" "}
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AsyncStateHandler>
    );
}
