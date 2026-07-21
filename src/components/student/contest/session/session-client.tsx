/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle2,
    ChevronLeft,
    Circle,
    CircleDot,
    Loader2,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { StudentCodeRunResponse } from "@/api/generated/model";
import {
    getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey,
    getGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGetQueryKey,
    getGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGetQueryKey,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    useFinishContestSessionApiV1StudentsContestsContestIdFinishPost,
    useGetContestQuestionDetailsApiV1StudentsContestsContestIdQuestionsQuestionIdGet,
    useGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGet,
    useGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGet,
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
    useGetWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspaceGet,
    useRunStudentCodeApiV1StudentsContestsContestIdQuestionsQuestionIdRunPost,
    useSaveWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspacePut,
    useSubmitContestQuestionApiV1StudentsContestsContestIdQuestionsQuestionIdSubmitPost,
} from "@/api/generated/students/students";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { handleApiError } from "@/lib/handle-api-error";
import { useContestSessionAppearance } from "@/lib/providers/contest-session-appearance-provider";
import { useContestSession } from "@/lib/providers/contest-session-provider";
import { useSessionTimer } from "@/lib/providers/session-timer-provider";
import { cn } from "@/lib/utils";

import { EditorPanel } from "./editor-panel";
import { ProblemView } from "./problem-view";
import { SessionHeader } from "./session-header";

interface SessionClientProps {
    contestId: string;
}

export function SessionClient({ contestId }: SessionClientProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const queryClient = useQueryClient();
    const { isDark } = useContestSessionAppearance();

    // 1. Core Queries
    const { data: contestRes, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestRes?.data;

    const { data: questionsRes, isLoading: isQuestionsLoading } =
        useGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGet(contestId);
    const questionsList = useMemo(() => questionsRes?.data?.questions || [], [questionsRes]);

    // 2. State & Timer Providers
    const { activeQuestionId, setActiveQuestionId } = useContestSession();
    const { timeLeft, runtimeSession, isTimerLoading: isRuntimeLoading } = useSessionTimer();

    const isGlobalLoading = isContestLoading || isRuntimeLoading || isQuestionsLoading;

    // Set initial active question once questions list is loaded
    useEffect(() => {
        if (!activeQuestionId && questionsList.length > 0) {
            setActiveQuestionId(questionsList[0].id);
        }
    }, [activeQuestionId, questionsList, setActiveQuestionId]);

    const [selectedLanguageIdState, setSelectedLanguageIdState] = useState<number>(71);
    const [editorCode, setEditorCode] = useState<string>("");
    const [loadedKey, setLoadedKey] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isQuestionNavCollapsed, setIsQuestionNavCollapsed] = useState(false);
    const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);

    // Console tab state
    const [consoleTab, setConsoleTab] = useState<"output" | "submissions">("output");

    // Run Code State
    const [runResult, setRunResult] = useState<StudentCodeRunResponse | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    // Reset runResult when active question changes
    useEffect(() => {
        setRunResult(null);
    }, [activeQuestionId]);

    // Update active question status to "viewed" in React Query cache immediately without refetching
    useEffect(() => {
        if (!activeQuestionId) return;

        const queryKey =
            getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey(contestId);
        queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData?.data?.questions) return oldData;
            return {
                ...oldData,
                data: {
                    ...oldData.data,
                    questions: oldData.data.questions.map((q: any) => {
                        if (q.id === activeQuestionId) {
                            if (q.status === "unviewed" || !q.status) {
                                return { ...q, status: "viewed" };
                            }
                        }
                        return q;
                    }),
                },
            };
        });
    }, [activeQuestionId, contestId, queryClient]);

    // Dynamic width and height limits sizing state
    const [leftWidth, setLeftWidth] = useState<number>(50); // initial percentage (50% left, 50% right)
    const [prevLeftWidth, setPrevLeftWidth] = useState<number>(50);
    const [consoleHeight, setConsoleHeight] = useState<number>(176); // initial px height
    const [prevConsoleHeight, setPrevConsoleHeight] = useState<number>(176);
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);

    // Horizontal split handler (horizontal drag, changes column widths)
    const handleHorizontalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = leftWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercentage = (deltaX / window.innerWidth) * 100;
            const targetWidth = startWidth + deltaPercentage;

            if (targetWidth < 15) {
                setLeftWidth(0);
            } else {
                setLeftWidth(Math.max(20, Math.min(80, targetWidth)));
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // Vertical split handler (vertical drag, changes console panel height)
    const handleVerticalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsConsoleCollapsed(false);
        const startY = e.clientY;
        const startHeight = consoleHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const targetHeight = startHeight - deltaY;
            if (targetHeight < 50) {
                setIsConsoleCollapsed(true);
            } else {
                setConsoleHeight(Math.max(50, Math.min(500, targetHeight)));
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // 3. Question Detail & Workspace Queries
    const { data: questionDetailsRes, isLoading: isQuestionDetailsLoading } =
        useGetContestQuestionDetailsApiV1StudentsContestsContestIdQuestionsQuestionIdGet(
            contestId,
            activeQuestionId || "",
            { query: { enabled: !!activeQuestionId } },
        );
    const questionDetails = questionDetailsRes?.data;

    const { data: workspaceRes, isSuccess: isWorkspaceLoaded } =
        useGetWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspaceGet(
            contestId,
            activeQuestionId || "",
            { query: { enabled: !!activeQuestionId } },
        );
    const workspaceData = workspaceRes?.data;

    const [prevHasRunning, setPrevHasRunning] = useState(false);

    const { data: submissionsRes, isLoading: isSubmissionsLoading } =
        useGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGet(
            contestId,
            activeQuestionId || "",
            {
                query: {
                    enabled: !!activeQuestionId,
                    refetchInterval: (query) => {
                        const subs = query?.state?.data?.data || [];
                        const hasRunning = subs.some((s: any) => {
                            const statusStr = (s.status as string) || "";
                            return (
                                statusStr === "QUEUED" ||
                                statusStr === "RUNNING" ||
                                statusStr === "PENDING" ||
                                !s.status
                            );
                        });
                        return hasRunning ? 2000 : false;
                    },
                },
            },
        );
    const submissions = useMemo(() => submissionsRes?.data || [], [submissionsRes?.data]);

    // Invalidate questions query to update solved status when running submissions finish
    useEffect(() => {
        const hasRunning = submissions.some((s) => {
            const statusStr = (s.status as string) || "";
            return (
                statusStr === "QUEUED" ||
                statusStr === "RUNNING" ||
                statusStr === "PENDING" ||
                !s.status
            );
        });
        if (prevHasRunning && !hasRunning) {
            void queryClient.invalidateQueries({
                queryKey:
                    getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey(
                        contestId,
                    ),
            });
        }
        setPrevHasRunning(hasRunning);
    }, [submissions, prevHasRunning, contestId, queryClient]);

    // Determine starter templates
    const currentTemplates = useMemo(() => questionDetails?.templates || [], [questionDetails]);

    const selectedLanguageId = useMemo(() => {
        if (currentTemplates.length === 0) return selectedLanguageIdState;
        const hasLang = currentTemplates.some((t) => t.language_id === selectedLanguageIdState);
        return hasLang ? selectedLanguageIdState : currentTemplates[0].language_id;
    }, [currentTemplates, selectedLanguageIdState]);

    const starterCode =
        currentTemplates.find((t) => t.language_id === selectedLanguageId)?.starter_code || "";

    const currentKey = `${activeQuestionId}_${selectedLanguageId}`;

    // Update active editor and role details
    const isTeamMode = contest?.contest_mode?.toUpperCase() === "TEAM";

    // Sync workspace or starter code in Monaco
    useEffect(() => {
        if (!activeQuestionId || !isWorkspaceLoaded || !questionDetails || !userId) return;

        // Check if we need to load the question workspace for the first time
        const hasLoadedQuestion = loadedKey.startsWith(`${activeQuestionId}_`);

        // Check local backup first
        const key = `user:${userId}:contest:${contestId}:question:${activeQuestionId}:lang:${selectedLanguageId}`;
        let localBackupCode: string | null = null;
        try {
            const localBackup = localStorage.getItem(key);
            if (localBackup) {
                const parsed = JSON.parse(localBackup);
                if (parsed && typeof parsed.code === "string") {
                    const dbTime = workspaceData?.updated_at
                        ? new Date(workspaceData.updated_at).getTime()
                        : 0;
                    if (parsed.savedAt > dbTime) {
                        localBackupCode = parsed.code;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to parse local backup", e);
        }

        if (!hasLoadedQuestion) {
            // First time loading this question: check if workspace has saved code or local backup
            if (localBackupCode !== null && localBackupCode.trim() !== "") {
                setEditorCode(localBackupCode);
                setLoadedKey(currentKey);
            } else if (
                workspaceData &&
                workspaceData.source_code !== null &&
                workspaceData.source_code !== undefined &&
                workspaceData.source_code.trim() !== ""
            ) {
                // If saved workspace exists, use it and update selected language
                if (workspaceData.language_id) {
                    setSelectedLanguageIdState(workspaceData.language_id);
                }
                setEditorCode(workspaceData.source_code);
                setLoadedKey(
                    `${activeQuestionId}_${workspaceData.language_id || selectedLanguageId}`,
                );
            } else {
                // Workspace has no code or local backup has no data: fall back to the starter code template for the currently selected language
                setEditorCode(starterCode);
                setLoadedKey(currentKey);
            }
        } else {
            // Question has already loaded at least once. If user switched the language, update the editor code
            if (loadedKey !== currentKey) {
                const codeToSet =
                    localBackupCode !== null && localBackupCode.trim() !== ""
                        ? localBackupCode
                        : workspaceData &&
                            workspaceData.language_id === selectedLanguageId &&
                            workspaceData.source_code !== null &&
                            workspaceData.source_code.trim() !== ""
                          ? workspaceData.source_code
                          : starterCode;
                setEditorCode(codeToSet);
                setLoadedKey(currentKey);
            }
        }
    }, [
        isWorkspaceLoaded,
        workspaceData,
        starterCode,
        currentKey,
        loadedKey,
        activeQuestionId,
        selectedLanguageId,
        contestId,
        questionDetails,
        userId,
    ]);

    // 4. Save Code Mutation & Debounce Auto-Save
    const saveWorkspaceMutation =
        useSaveWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspacePut();

    useEffect(() => {
        if (!activeQuestionId || !editorCode || loadedKey !== currentKey) return;

        // Auto-save logic: debounced by 1.5 seconds
        const delayDebounce = setTimeout(() => {
            setIsSaving(true);
            saveWorkspaceMutation.mutate(
                {
                    contestId,
                    questionId: activeQuestionId,
                    data: {
                        source_code: editorCode,
                        language_id: selectedLanguageId,
                    },
                },
                {
                    onSettled: () => setIsSaving(false),
                },
            );
        }, 2000);

        return () => clearTimeout(delayDebounce);
    }, [
        editorCode,
        activeQuestionId,
        selectedLanguageId,
        loadedKey,
        currentKey,
        contestId,
        saveWorkspaceMutation,
    ]);

    // Backup to localStorage on change
    useEffect(() => {
        if (
            editorCode === undefined ||
            editorCode === null ||
            !activeQuestionId ||
            loadedKey !== currentKey ||
            !userId
        )
            return;

        const key = `user:${userId}:contest:${contestId}:question:${activeQuestionId}:lang:${selectedLanguageId}`;
        localStorage.setItem(
            key,
            JSON.stringify({
                code: editorCode,
                savedAt: Date.now(),
            }),
        );
    }, [
        editorCode,
        contestId,
        activeQuestionId,
        selectedLanguageId,
        loadedKey,
        currentKey,
        userId,
    ]);

    const handleManualSave = () => {
        if (!activeQuestionId) return;
        setIsSaving(true);
        saveWorkspaceMutation.mutate(
            {
                contestId,
                questionId: activeQuestionId,
                data: {
                    source_code: editorCode,
                    language_id: selectedLanguageId,
                },
            },
            {
                onSettled: () => setIsSaving(false),
            },
        );
    };

    // 4.5 Run Code Mutation Handler
    const runCodeMutation =
        useRunStudentCodeApiV1StudentsContestsContestIdQuestionsQuestionIdRunPost();

    const submitMutation =
        useSubmitContestQuestionApiV1StudentsContestsContestIdQuestionsQuestionIdSubmitPost({
            mutation: { meta: { suppressGlobalError: true } },
        });

    const finishSessionMutation = useFinishContestSessionApiV1StudentsContestsContestIdFinishPost({
        mutation: { meta: { suppressGlobalError: true } },
    });

    const handleFinishSession = () => {
        finishSessionMutation.mutate(
            { contestId },
            {
                onSuccess: () => {
                    toast.success("Contest session finished successfully!");
                    void queryClient.invalidateQueries({
                        queryKey:
                            getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                contestId,
                            ),
                    });
                    void queryClient.invalidateQueries({
                        queryKey:
                            getGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGetQueryKey(
                                contestId,
                            ),
                    });
                    router.push(`/student/contest/${contestId}`);
                },
                onError: (error) => {
                    console.error("Finish session error:", error);
                    toast.error(
                        handleApiError(error).message || "Failed to finish contest session",
                    );
                },
            },
        );
    };

    const handleRun = () => {
        if (!activeQuestionId) return;
        setIsRunning(true);
        setRunResult(null);
        setIsConsoleCollapsed(false);
        setConsoleTab("output");

        runCodeMutation.mutate(
            {
                contestId,
                questionId: activeQuestionId,
                data: {
                    code: editorCode,
                    language_id: selectedLanguageId,
                },
            },
            {
                onSuccess: (res) => {
                    if (res?.data) {
                        setRunResult(res.data);
                    }
                },
                onError: (err) => {
                    console.error("Run error:", err);
                },
                onSettled: () => {
                    setIsRunning(false);
                },
            },
        );
    };

    const executeSubmit = () => {
        if (!activeQuestionId) return;
        setIsConsoleCollapsed(false);
        setConsoleTab("submissions");

        submitMutation.mutate(
            {
                contestId,
                questionId: activeQuestionId,
                data: {
                    code: editorCode,
                    language_id: selectedLanguageId,
                },
            },
            {
                onSuccess: () => {
                    const isImmediate = runtimeSession?.evaluate_on_submit ?? true;
                    if (isImmediate) {
                        toast.success("Submission successfully queued!");
                    } else {
                        toast.success("Submission saved successfully (pending evaluation)!");
                    }
                    void queryClient.invalidateQueries({
                        queryKey:
                            getGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGetQueryKey(
                                contestId,
                                activeQuestionId,
                            ),
                    });

                    // Update cache for the questions list: set status to 'submitted' immediately
                    const queryKey =
                        getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey(
                            contestId,
                        );
                    queryClient.setQueryData(queryKey, (oldData: any) => {
                        if (!oldData?.data?.questions) return oldData;
                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                questions: oldData.data.questions.map((q: any) => {
                                    if (q.id === activeQuestionId) {
                                        return { ...q, status: "submitted" };
                                    }
                                    return q;
                                }),
                            },
                        };
                    });
                },
                onError: (error) => {
                    console.error("Submit error:", error);
                    toast.error(handleApiError(error).message || "Failed to submit code");
                },
            },
        );
    };

    const handleSubmit = () => {
        if (!activeQuestionId) return;

        const isImmediate = runtimeSession?.evaluate_on_submit ?? true;
        if (!isImmediate) {
            setIsSubmitConfirmOpen(true);
        } else {
            executeSubmit();
        }
    };

    if (isGlobalLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <span className="text-sm font-semibold tracking-wider uppercase">
                    Loading Coding Session...
                </span>
            </div>
        );
    }

    const isImmediate = runtimeSession?.evaluate_on_submit ?? true;
    const hasAlreadySubmitted = submissions.length > 0;

    // Check submission limits
    const maxSubmission = (questionDetails as any)?.max_submission ?? 0;
    const hasReachedSubmissionLimit = maxSubmission > 0 && submissions.length >= maxSubmission;

    const isSubmitDisabled = (!isImmediate && hasAlreadySubmitted) || hasReachedSubmissionLimit;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans text-slate-900 select-none dark:bg-[#090d16] dark:text-slate-100",
                isDark && "dark",
            )}
        >
            {/* Header */}
            <SessionHeader
                contestName={contest?.name || "Contest"}
                timeLeft={timeLeft}
                onFinish={handleFinishSession}
                isFinishing={finishSessionMutation.isPending}
            />

            {/* Main Area: Split Screen Workspace */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative bg-background">
                <aside
                    className={cn(
                        "flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
                        isQuestionNavCollapsed ? "w-16" : "w-64",
                    )}
                >
                    <div
                        className={cn(
                            "flex h-11 shrink-0 items-center border-b border-border px-3",
                            isQuestionNavCollapsed ? "justify-center" : "justify-between",
                        )}
                    >
                        {!isQuestionNavCollapsed && (
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Questions
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => setIsQuestionNavCollapsed((collapsed) => !collapsed)}
                            title={
                                isQuestionNavCollapsed ? "Expand questions" : "Collapse questions"
                            }
                        >
                            {isQuestionNavCollapsed ? (
                                <PanelLeftOpen className="size-4" />
                            ) : (
                                <PanelLeftClose className="size-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto p-2">
                        {questionsList.map((question, index) => {
                            const isSelected = activeQuestionId === question.id;
                            const status =
                                question.status === "submitted"
                                    ? "Submitted"
                                    : question.status === "viewed"
                                      ? "Viewed"
                                      : "Unviewed";
                            const questionWithTitle = question as typeof question & {
                                title?: string;
                                question_title?: string;
                                name?: string;
                                question?: { title?: string };
                            };
                            const questionTitle =
                                questionWithTitle.title ||
                                questionWithTitle.question_title ||
                                questionWithTitle.name ||
                                questionWithTitle.question?.title ||
                                `Question ${index + 1}`;

                            return (
                                <button
                                    key={question.id}
                                    type="button"
                                    onClick={() => setActiveQuestionId(question.id)}
                                    title={`${questionTitle} · ${status}`}
                                    className={cn(
                                        "flex w-full items-center rounded-lg text-left transition-colors",
                                        isQuestionNavCollapsed
                                            ? "h-10 justify-center px-1"
                                            : "min-h-12 gap-3 px-3 py-2",
                                        isSelected
                                            ? "bg-primary/10 ring-1 ring-primary/30"
                                            : "hover:bg-muted/60",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                            question.status === "submitted"
                                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                : question.status === "viewed"
                                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                                  : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                    {!isQuestionNavCollapsed && (
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-xs font-semibold">
                                                {questionTitle}
                                            </span>
                                            <span
                                                className={cn(
                                                    "block text-[10px]",
                                                    question.status === "submitted"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : question.status === "viewed"
                                                          ? "text-amber-600 dark:text-amber-400"
                                                          : "text-muted-foreground",
                                                )}
                                            >
                                                {status}
                                            </span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="shrink-0 space-y-2 border-t border-border p-3">
                        {[
                            {
                                label: "Submitted",
                                count: questionsList.filter(
                                    (question) => question.status === "submitted",
                                ).length,
                                icon: CheckCircle2,
                                color: "text-emerald-500",
                            },
                            {
                                label: "Viewed",
                                count: questionsList.filter(
                                    (question) => question.status === "viewed",
                                ).length,
                                icon: CircleDot,
                                color: "text-amber-500",
                            },
                            {
                                label: "Unviewed",
                                count: questionsList.filter(
                                    (question) =>
                                        question.status === "unviewed" || !question.status,
                                ).length,
                                icon: Circle,
                                color: "text-muted-foreground",
                            },
                        ].map(({ label, count, icon: Icon, color }) => (
                            <div
                                key={label}
                                className={cn(
                                    "flex items-center text-[10px] text-muted-foreground",
                                    isQuestionNavCollapsed ? "justify-center gap-1" : "gap-2",
                                )}
                                title={`${label}: ${count}`}
                            >
                                <Icon className={cn("size-3.5 shrink-0", color)} />
                                {isQuestionNavCollapsed ? (
                                    <>
                                        <span className="font-bold text-foreground">{count}</span>
                                        <span className="sr-only">{label}</span>
                                    </>
                                ) : (
                                    <span className="flex flex-1 justify-between gap-2">
                                        <span>{label}</span>
                                        <strong className="text-foreground">{count}</strong>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Problem Viewer Wrapper */}
                {leftWidth > 0 && (
                    <div
                        style={{ width: `${leftWidth}%` }}
                        className="h-full shrink-0 flex flex-col min-w-[20%] border-r border-border"
                    >
                        {/* Problem Header Bar */}
                        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card dark:bg-[#0b0f19] px-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Problem Description
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => {
                                    setPrevLeftWidth(leftWidth);
                                    setLeftWidth(0);
                                }}
                                title="Collapse Description (make editor full-width)"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <ProblemView
                            questionDetails={questionDetails}
                            isLoading={isQuestionDetailsLoading}
                        />
                    </div>
                )}

                {/* Resize Splitter Divider */}
                {leftWidth > 0 && (
                    <div
                        onMouseDown={handleHorizontalMouseDown}
                        className="w-1 shrink-0 bg-slate-200 dark:bg-slate-800/85 hover:bg-indigo-500 dark:hover:bg-indigo-400 cursor-col-resize transition-colors h-full"
                    />
                )}

                {/* Editor & Console Panel wrapper */}
                <div className="flex-1 flex flex-col min-w-[20%] h-full">
                    <EditorPanel
                        selectedLanguageId={selectedLanguageId}
                        setSelectedLanguageIdState={setSelectedLanguageIdState}
                        currentTemplates={currentTemplates}
                        isSaving={isSaving}
                        handleManualSave={handleManualSave}
                        isTeamMode={isTeamMode}
                        editorCode={editorCode}
                        setEditorCode={setEditorCode}
                        consoleHeight={consoleHeight}
                        handleConsoleMouseDown={handleVerticalMouseDown}
                        leftWidth={leftWidth}
                        setLeftWidth={setLeftWidth}
                        prevLeftWidth={prevLeftWidth}
                        isConsoleCollapsed={isConsoleCollapsed}
                        setIsConsoleCollapsed={setIsConsoleCollapsed}
                        prevConsoleHeight={prevConsoleHeight}
                        setConsoleHeight={setConsoleHeight}
                        setPrevConsoleHeight={setPrevConsoleHeight}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        isRunning={isRunning}
                        isSubmitting={submitMutation.isPending}
                        isSubmitDisabled={isSubmitDisabled}
                        runResult={runResult}
                        consoleTab={consoleTab}
                        setConsoleTab={setConsoleTab}
                        submissions={submissions}
                        isSubmissionsLoading={isSubmissionsLoading}
                        maxSubmission={maxSubmission}
                        submissionsCount={submissions.length}
                    />
                </div>
            </div>

            <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive font-semibold">
                            Confirm Final Submission
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-muted-foreground leading-normal">
                            This contest has immediate evaluation turned off.{" "}
                            <strong>Only one submission is allowed</strong> for this question. Once
                            submitted:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-3">
                        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                            <li>
                                You will not be able to re-submit or modify your code for this
                                question.
                            </li>
                            <li>
                                Your submission will remain in a pending state and will be evaluated
                                once the contest session finishes.
                            </li>
                        </ul>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSubmitConfirmOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setIsSubmitConfirmOpen(false);
                                executeSubmit();
                            }}
                            className="w-full sm:w-auto"
                        >
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
