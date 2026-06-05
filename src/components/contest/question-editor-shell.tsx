"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useEditorContext } from "../shared/TipTap";
import { ProblemMetadataCard } from "../questions/question-metadata-card";
import { ProblemPreview } from "../questions/question-preview";
import { QuestionWorkflowSection } from "../questions/question-workflow-section";
import { QuestionCreateHero } from "../questions/question-create-hero";
import { LANGUAGES, MonacoLanguage } from "../questions/question-code-editor";
import { QuestionArchitectureSection } from "../questions/question-architecture-section";
import { useQuestionWorkflow, type WorkflowStep } from "@/hooks/use-question-workflow";
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

const MAIN_STEPS = [
    { id: "details", label: "Details" },
    { id: "statement", label: "Statement" },
    { id: "judge_config", label: "Judge Configuration" },
];

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
    const languages = useMemo(() => languagesData?.data?.languages || [], [languagesData]);

    const [workflowEditorLang, setWorkflowEditorLang] = useState<MonacoLanguage>(LANGUAGES[0]);

    const { activeStep, steps, isStepValid, canGoNext, goToStep } = useQuestionWorkflow({
        starterCodes: code.starterCodes,
        solutionCodes: code.solutionCodes,
        driverCodes: code.driverCodes,
        testCases: testCases.testCases,
        activeLanguageId: workflowEditorLang.id,
    });

    // View State
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [currentMainStep, setCurrentMainStep] = useState(0);

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

    // Navigation logic
    const handleNextMainStep = () => {
        setCurrentMainStep((prev) => Math.min(prev + 1, MAIN_STEPS.length - 1));
    };

    const handlePrevMainStep = () => {
        setCurrentMainStep((prev) => Math.max(prev - 1, 0));
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
                className="flex flex-col bg-background relative overflow-hidden -mx-6 -mt-5 -mb-[44px]"
                style={{ height: "calc(100vh - 56px)" }}
            >
                {/* 1. Sticky Header */}
                <div className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md">
                    <QuestionCreateHero
                        title={mode === "update" ? "Update Question" : "Create Question"}
                        description={
                            mode === "update"
                                ? "Edit the metadata and requirements for this programming challenge."
                                : "Configure the metadata and requirements for your new programming challenge."
                        }
                        backUrl={backUrl}
                        onPreview={() => setIsPreviewMode(!isPreviewMode)}
                        isPreview={isPreviewMode}
                        onSave={onSave}
                        isSaving={isSaving}
                    />
                </div>

                {isPreviewMode ? (
                    <div className="flex-1 overflow-y-auto p-6">
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
                    <>
                        {/* 2. Main Horizontal Stepper */}
                        <div className="flex items-center justify-center border-b border-border/60 bg-card/30 px-6 py-4">
                            <div className="flex items-center gap-2 max-w-3xl w-full">
                                {MAIN_STEPS.map((step, idx) => {
                                    const active = currentMainStep === idx;
                                    const completed = currentMainStep > idx;
                                    return (
                                        <div
                                            key={step.id}
                                            className="flex items-center flex-1 last:flex-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${completed ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-muted text-muted-foreground border border-border/60"}`}
                                                >
                                                    {completed ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        idx + 1
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`text-sm font-bold ${active || completed ? "text-foreground" : "text-muted-foreground"}`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-medium">
                                                        {completed
                                                            ? "Completed"
                                                            : active
                                                              ? "In Progress"
                                                              : "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                            {idx < MAIN_STEPS.length - 1 && (
                                                <div className="h-px flex-1 bg-border/60 mx-6" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Main Content Area */}
                        <div className="flex-1 overflow-hidden flex bg-background relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMainStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 w-full h-full overflow-y-auto"
                                >
                                    {/* STEP 0: DETAILS */}
                                    {currentMainStep === 0 && (
                                        <div className="max-w-5xl mx-auto p-6 md:p-12">
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
                                                setAllowedLanguages={metadata.setAllowedLanguages}
                                                tags={metadata.tags}
                                                setTags={metadata.setTags}
                                            />
                                        </div>
                                    )}

                                    {/* STEP 1: STATEMENT */}
                                    {currentMainStep === 1 && (
                                        <div className="max-w-5xl mx-auto p-6 md:p-12 h-full flex flex-col">
                                            <div className="space-y-1 mb-6 shrink-0">
                                                <h2 className="text-2xl font-bold text-foreground">
                                                    Problem Statement
                                                </h2>
                                                <p className="text-sm text-muted-foreground">
                                                    Write a clear description using Markdown.
                                                    Include constraints and examples.
                                                </p>
                                            </div>
                                            <div className="flex-1 min-h-0 bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
                                                <QuestionArchitectureSection
                                                    activeTab={activeTab}
                                                    onTabChange={setActiveTab}
                                                    editor={editor}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: JUDGE CONFIGURATION */}
                                    {currentMainStep === 2 && (
                                        <div className="h-full w-full">
                                            <QuestionWorkflowSection
                                                activeWorkflowStep={activeStep}
                                                setActiveWorkflowStep={(val) =>
                                                    goToStep(val as WorkflowStep)
                                                }
                                                steps={steps}
                                                isStepValid={(val) =>
                                                    isStepValid(val as WorkflowStep)
                                                }
                                                canGoNext={canGoNext}
                                                workflowEditorLang={workflowEditorLang}
                                                setWorkflowEditorLang={setWorkflowEditorLang}
                                                allowedLanguages={metadata.allowedLanguages}
                                                starterCodes={code.starterCodes}
                                                setStarterCodes={code.setStarterCodes}
                                                solutionCodes={code.solutionCodes}
                                                setSolutionCodes={code.setSolutionCodes}
                                                driverCodes={code.driverCodes}
                                                setDriverCodes={code.setDriverCodes}
                                                testCases={testCases.testCases}
                                                setTestCases={testCases.setTestCases}
                                                onSave={onSave}
                                                isSaving={isSaving}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* 4. Sticky Footer */}
                        <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevMainStep}
                                disabled={currentMainStep === 0}
                                className="gap-2 border-border/60 h-10 px-5"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>

                            {currentMainStep < MAIN_STEPS.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={handleNextMainStep}
                                    className="gap-2 h-10 px-6 shadow-md shadow-primary/10"
                                >
                                    Next Step <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="gap-2 h-10 px-6 shadow-lg shadow-primary/20"
                                >
                                    Finalize & Save Question
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AsyncStateHandler>
    );
}
