"use client";

import { useState, useEffect, useMemo } from "react";
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
import { AsyncStateHandler } from "../shared/async-state-handler";

export interface QuestionEditorShellProps {
    mode: "create" | "update";
    contestId: string;
    questionId?: string;
    form: ReturnType<typeof useQuestionForm>;
    onSave: () => void;
    isSaving: boolean;
}

export function QuestionEditorShell({
    mode,
    contestId,
    questionId,
    form,
    onSave,
    isSaving,
}: QuestionEditorShellProps) {
    const { metadata, content, code, testCases, initializeForm } = form;

    // Data fetching
    const {
        data: questionData,
        isLoading: isFetchingQuestion,
        error: fetchError,
        refetch: refetchQuestion,
    } = useContestQuestion(contestId, mode === "update" && questionId ? questionId : "");
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

    const editor = useEditorContext();
    const [activeTab, setActiveTab] = useState("description");

    // Initialize form with fetched data in update mode
    useEffect(() => {
        if (mode === "update" && questionData?.data) {
            initializeForm(questionData.data, languages);
        }
    }, [mode, questionData, initializeForm, languages]);

    // Hide global layout (header/sidebar) when in preview mode
    useEffect(() => {
        if (isPreviewMode) {
            document.body.classList.add("hide-layout");
        } else {
            document.body.classList.remove("hide-layout");
        }
        return () => {
            document.body.classList.remove("hide-layout");
        };
    }, [isPreviewMode]);

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
                <div className="space-y-8 max-w-5xl mx-auto pb-20">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            }
        >
            <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <QuestionCreateHero
                    backUrl={`/contest/${contestId}/questions`}
                    onPreview={() => setIsPreviewMode(!isPreviewMode)}
                    isPreview={isPreviewMode}
                    onSave={onSave}
                    isSaving={isSaving}
                />

                {isPreviewMode ? (
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
                ) : (
                    <>
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

                        <QuestionArchitectureSection
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            editor={editor}
                        />

                        <QuestionWorkflowSection
                            activeWorkflowStep={activeStep}
                            setActiveWorkflowStep={(val) => goToStep(val as WorkflowStep)}
                            steps={steps}
                            isStepValid={(val) => isStepValid(val as WorkflowStep)}
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
                    </>
                )}
            </div>
        </AsyncStateHandler>
    );
}
