import { useMemo, useState } from "react";

export type WorkflowStep = "starter" | "solution" | "testcases" | "driver";

export const STEPS: WorkflowStep[] = ["starter", "solution", "testcases", "driver"];

interface UseQuestionWorkflowProps {
    starterCodes: Record<number, string>;
    solutionCodes: Record<number, string>;
    driverCodes: Record<number, string>;
    testCases: Array<unknown>;
    activeLanguageId: number;
}

export function useQuestionWorkflow({
    starterCodes,
    solutionCodes,
    driverCodes,
    testCases,
    activeLanguageId,
}: UseQuestionWorkflowProps) {
    const [activeStep, setActiveStep] = useState<WorkflowStep>("starter");

    const isStepValid = useMemo(() => {
        return (step: WorkflowStep) => {
            switch (step) {
                case "starter":
                    return !!starterCodes[activeLanguageId]?.trim();

                case "solution":
                    return !!solutionCodes[activeLanguageId]?.trim();

                case "testcases":
                    return testCases.length > 0;

                case "driver":
                    return !!driverCodes[activeLanguageId]?.trim();

                default:
                    return false;
            }
        };
    }, [starterCodes, solutionCodes, driverCodes, testCases, activeLanguageId]);

    const currentIndex = STEPS.indexOf(activeStep);

    const canGoNext = isStepValid(activeStep);
    const canGoBack = currentIndex > 0;
    const isLastStep = currentIndex === STEPS.length - 1;

    const goNext = () => {
        if (!canGoNext || isLastStep) return;
        setActiveStep(STEPS[currentIndex + 1]);
    };

    const goBack = () => {
        if (!canGoBack) return;
        setActiveStep(STEPS[currentIndex - 1]);
    };

    const goToStep = (targetStep: WorkflowStep) => {
        const targetIndex = STEPS.indexOf(targetStep);

        if (targetIndex <= currentIndex) {
            setActiveStep(targetStep);
            return;
        }

        for (let i = currentIndex; i < targetIndex; i++) {
            if (!isStepValid(STEPS[i])) return;
        }

        setActiveStep(targetStep);
    };

    return {
        steps: STEPS,
        activeStep,
        setActiveStep,
        canGoNext,
        canGoBack,
        isLastStep,
        isStepValid,
        goNext,
        goBack,
        goToStep,
    };
}
