"use client";

import { useState, useEffect } from "react";
import { useEditorContext } from "../shared/TipTap";
import { ProblemMetadataCard } from "../questions/question-metadata-card";
import { ProblemPreview } from "../questions/question-preview";
import { QuestionWorkflowSection } from "../questions/question-workflow-section";
import { QuestionCreateHero } from "../questions/question-create-hero";
import { LANGUAGES, MonacoLanguage } from "../questions/question-code-editor";
import { QuestionArchitectureSection } from "../questions/question-architecture-section";
import { useQuestionForm } from "@/hooks/use-question-form";
import { useQuestionWorkflow, type WorkflowStep } from "@/hooks/use-question-workflow";
import { useQuestionEditorSync } from "@/hooks/use-question-editor-sync";
import { useContestQuestionSubmit } from "@/hooks/use-contest-question-submit";

interface ContestQuestionsCreateClientProps {
    contestId: string;
}

export function ContestQuestionsCreateClient({ contestId }: ContestQuestionsCreateClientProps) {
    const { metadata, content, code, testCases } = useQuestionForm();
    const { handleSubmit, isSaving } = useContestQuestionSubmit();

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

    const onSaveHandler = () =>
        handleSubmit({
            contestId,
            // Metadata
            title: metadata.title,
            difficulty: metadata.difficulty,
            timeLimit: metadata.timeLimit,
            memoryLimit: metadata.memoryLimit,
            score: metadata.score,
            tags: metadata.tags,
            // Content
            description: content.description,
            inputFormat: content.inputFormat,
            outputFormat: content.outputFormat,
            constraints: content.constraints,
            notes: content.notes,
            // Code
            starterCodes: code.starterCodes,
            solutionCodes: code.solutionCodes,
            driverCodes: code.driverCodes,
            // Test Cases
            testCases: testCases.testCases,
            allowedLanguages: metadata.allowedLanguages,
        });

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <QuestionCreateHero
                backUrl={`/contest/${contestId}/questions`}
                onPreview={() => setIsPreviewMode(true)}
                onSave={onSaveHandler}
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
                </>
            )}

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
                onSave={onSaveHandler}
                isSaving={isSaving}
            />
        </div>
    );
}
